import { QuestConfig, QuestMCT1 } from '@magikcraft/mct1/quests/Quest'
import { worldly } from '@magikcraft/mct1/world'
import * as questTools from '../../quest-tools'
import * as Locations from './locs'

const Location = Java.type('org.bukkit.Location')
const Material = Java.type('org.bukkit.Material')

export default class QuestMCT1Magmarun extends QuestMCT1 {
    activeRuns: Array<any> = []

    constructor(conf: QuestConfig) {
        super(conf)
        this.Locs = Locations.getLocations(this.world)
    }

    start() {
        super.start()
        this.registerEvents()

        const { player, world, log, options, Locs, state } = this
        ;[1, 2, 3, 4, 5].forEach(i => {
            const key = `run${i}`
            worldly(world).registerRegion(
                key,
                Locs.waypoints[key].region[0],
                Locs.waypoints[key].region[1]
            )
            worldly(world).registerPlayerEnterRegionEvent(key, event => {
                this.activeRuns.push(i)
                log('this.activeRuns', this.activeRuns)
            })
            worldly(world).registerPlayerExitRegionEvent(key, event => {
                this.activeRuns = this.activeRuns.filter(j => j !== i)
                log('this.activeRuns', this.activeRuns)
            })
        })

        let interval
        interval = 170
        this.setInterval(() => {
            this.activeRuns.forEach(key => {
                if (key != '1' && key != '2' && key != '3') return
                let dispenseType = 'ARROW'
                this.activateRun(
                    Locs.locations[`run${key}`],
                    dispenseType,
                    interval
                )
            })
        }, 35 * interval)

        interval = 170
        this.setInterval(() => {
            this.activeRuns.forEach(key => {
                if (key != '4' && key != '5') return
                let dispenseType = 'LEGACY_FIREBALL'
                this.activateRun(
                    Locs.locations[`run${key}`],
                    dispenseType,
                    interval
                )
            })
        }, 35 * interval)
    }

    activateRun(rows, dispenseType, interval) {
        let index = 0

        rows.forEach((row, i) => {
            index = i
            setTimeout(() => {
                row.forEach((loc, j) => {
                    if (loc.block.type == 'DISPENSER') {
                        questTools.shootDispenser(loc.block, dispenseType)
                    }

                    // clean-up
                    setTimeout(() => {
                        const targetLoc = new Location(
                            loc.world,
                            loc.x,
                            loc.y - 11,
                            loc.z
                        )
                        if (dispenseType == 'LEGACY_FIREBALL') {
                            if (j % 4 === 0) {
                                this.getBlocksInRadius(targetLoc, 5, [
                                    'FIRE',
                                ]).forEach(block => {
                                    block.setType(Material.AIR)
                                })
                            }
                        }
                        if (dispenseType == 'ARROW') {
                            if (j % 4 === 0) {
                                this.Locs.world
                                    .getNearbyEntities(targetLoc, 5, 10, 5)
                                    .forEach(e => {
                                        if (e.type == 'ARROW') e.remove()
                                    })
                            }
                        }
                    }, interval * 25)
                })
            }, i * interval)
        })
    }

    registerEvents() {
        super.registerEvents()
        const { player, world } = this

        // playerPickupItem
        this.registerEvent('playerPickupItem', event => {
            if (event.player.name != player.name) return
            if (event.player.world.name != world.name) return
            // Cancel arrow pickup event.
            if (event.item.itemStack.type == 'ARROW') event.setCancelled(true)
        })
    }

    getBlocksInRadius(loc, radius = 2, filterTypes?: string[]) {
        const blocks: any[] = []
        for (let x = -radius; x <= radius; x++) {
            for (let y = -radius; y <= radius; y++) {
                for (let z = -radius; z <= radius; z++) {
                    const block = loc.block.getRelative(x, y, z)
                    if (filterTypes) {
                        if (filterTypes.includes(block.type.toString())) {
                            blocks.push(block)
                        }
                    } else {
                        blocks.push(block)
                    }
                }
            }
        }
        return blocks
    }
}
