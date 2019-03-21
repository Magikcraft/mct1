const Material = Java.type('org.bukkit.Material')
const Location = Java.type('org.bukkit.Location')
const EntityType = Java.type('org.bukkit.entity.EntityType')
const Locations = require('./locs')

import * as questTools from '@magikcraft/mct1/quests/quest-tools'
import { worldly } from '@magikcraft/mct1/world'
import ArenaStairs from './arena-stairs'
import { QuestConfig, QuestMCT1 } from '@magikcraft/mct1/quests/Quest'

export default class QuestMCT1Magmaboss extends QuestMCT1 {
    arenaStairs: any

    constructor(conf: QuestConfig) {
        super(conf)
        this.Locs = Locations.getLocations(this.world)
        this.state = {
            bossSceneStarted: false,
            magmaboss: undefined,
        }
    }

    start() {
        super.start()
        super.registerEvents()
        const { player, world, log, options, Locs, state } = this
        const { regions, locations, waypoints } = Locs

        // Setup arenaStairs
        this.arenaStairs = new ArenaStairs(Locs.regions.arenaStairs)
        this.arenaStairs.saveRegion()
        this.arenaStairs.hideRegion()

        // Region: complete
        worldly(world).registerRegion(
            'arenaThreshold',
            waypoints.arenaThreshold.region[0],
            waypoints.arenaThreshold.region[1]
        )
        worldly(world).registerPlayerEnterRegionEvent(
            'arenaThreshold',
            event => {
                this.startBossScene()
            }
        )

        this.setTimeout(() => {
            Locs.locations.dispensers.forEach(loc => {
                loc.block.setType(Material.DISPENSER)
                loc.block.setData(1)
            })
        }, 1000)
    }

    startBossScene() {
        const { player, world, log, options, Locs, state } = this
        if (state.bossSceneStarted) return
        state.bossSceneStarted = true

        state.magmaboss = world.spawnEntity(
            Locs.locations.magmabossSpawn,
            EntityType.MAGMA_CUBE
        )
        state.magmaboss.setSize(5)
        const marker = questTools.makeInvisibleArmourStand(
            Locs.locations.magmabossSpawn
        )

        // Reveal arena stairs once the magmaboss is dead.
        this.setInterval(() => {
            let magambossStillAlive = false
            marker.getNearbyEntities(40, 20, 40).forEach(e => {
                if (e.type == 'MAGMA_CUBE') magambossStillAlive = true
            })
            if (!magambossStillAlive) {
                this.arenaStairs.replaceRegion()
            }
        }, 3000)

        // ## helper
        const dispenseLava = loc => {
            if (loc.block.type != 'DISPENSER') return
            questTools.shootDispenser(loc.block, 'LAVA_BUCKET')
            const lavaLoc = new Location(loc.world, loc.x, loc.y + 1, loc.z)
            this.setTimeout(() => {
                lavaLoc.block.setType(Material.AIR)
            }, 7500)
        }

        // Dispense lava on interval
        Locs.locations.dispensers.forEach((loc, i) => {
            dispenseLava(loc)
            this.setInterval(() => {
                dispenseLava(loc)
            }, 25000)
        })
    }
}
