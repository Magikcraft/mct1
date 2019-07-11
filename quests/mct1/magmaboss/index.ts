import { QuestConfig } from '../../Quest'
import * as questTools from '../../quest-tools'
import { QuestMCT1 } from '../../QuestMCT1'
import ArenaStairs from './arena-stairs'
import * as Locations from './locs'

const Material = Java.type('org.bukkit.Material')
const Location = Java.type('org.bukkit.Location')
const EntityType = Java.type('org.bukkit.entity.EntityType')

export default class QuestMCT1Magmaboss extends QuestMCT1 {
    private arenaStairs: any

    constructor(conf: QuestConfig) {
        super(conf)
        this.Locs = Locations.getLocations(this.world.getBukkitWorld())
        this.state = {
            bossSceneStarted: false,
            magmaboss: undefined,
        }
    }

    public start() {
        super.start()
        super.registerEvents()
        const { waypoints } = this.Locs

        // Setup arenaStairs
        this.arenaStairs = new ArenaStairs(this.Locs.regions.arenaStairs)
        this.arenaStairs.saveRegion()
        this.arenaStairs.hideRegion()

        // Region: complete
        this.world.registerRegion(
            'arenaThreshold',
            waypoints.arenaThreshold.region[0],
            waypoints.arenaThreshold.region[1]
        )

        this.world.registerPlayerEnterRegionEvent('arenaThreshold', event => {
            this.startBossScene()
        })

        this.setTimeout(() => {
            this.Locs.locations.dispensers.forEach(loc => {
                loc.block.setType(Material.DISPENSER)
                loc.block.setData(1)
            })
        }, 1000)
    }

    public startBossScene() {
        if (this.state.bossSceneStarted) {
            return
        }
        this.state.bossSceneStarted = true

        this.state.magmaboss = this.world.spawnEntity(
            this.Locs.locations.magmabossSpawn,
            EntityType.MAGMA_CUBE
        )
        this.state.magmaboss.setSize(5)
        const marker = questTools.makeInvisibleArmourStand(
            this.Locs.locations.magmabossSpawn
        )

        // Reveal arena stairs once the magmaboss is dead.
        this.setInterval(() => {
            let magambossStillAlive = false
            marker.getNearbyEntities(40, 20, 40).forEach(e => {
                if (e.type == 'MAGMA_CUBE') {
                    magambossStillAlive = true
                }
            })
            if (!magambossStillAlive) {
                this.arenaStairs.replaceRegion()
            }
        }, 3000)

        // ## helper
        const dispenseLava = loc => {
            if (loc.block.type != 'DISPENSER') {
                return
            }
            questTools.shootDispenser(loc.block, 'LAVA_BUCKET')
            const lavaLoc = new Location(loc.world, loc.x, loc.y + 1, loc.z)
            this.setTimeout(() => {
                lavaLoc.block.setType(Material.AIR)
            }, 7500)
        }

        // Dispense lava on interval
        this.Locs.locations.dispensers.forEach((loc, i) => {
            dispenseLava(loc)
            this.setInterval(() => {
                dispenseLava(loc)
            }, 25000)
        })
    }
}
