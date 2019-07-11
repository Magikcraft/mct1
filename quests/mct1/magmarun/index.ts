import * as questTools from '../../quest-tools'
import { QuestConfig, QuestMCT1 } from '../../QuestMCT1'
import * as Locations from './locs'

const Location = Java.type('org.bukkit.Location')
const Material = Java.type('org.bukkit.Material')

export default class QuestMCT1Magmarun extends QuestMCT1 {
    public activeRuns: any[] = []

    constructor(conf: QuestConfig) {
        super(conf)
        this.Locs = Locations.getLocations(this.world)
    }

    public start() {
        super.start()
        this.registerEvents()
        ;[1, 2, 3, 4, 5].forEach(i => {
            const key = `run${i}`
            this.world.registerRegion(
                key,
                this.Locs.waypoints[key].region[0],
                this.Locs.waypoints[key].region[1]
            )
            this.world.registerPlayerEnterRegionEvent(key, event => {
                this.activeRuns.push(i)
                this.log('this.activeRuns', this.activeRuns)
            })
            this.world.registerPlayerExitRegionEvent(key, event => {
                this.activeRuns = this.activeRuns.filter(j => j !== i)
                this.log('this.activeRuns', this.activeRuns)
            })
        })

        let interval
        interval = 170
        this.setInterval(() => {
            this.activeRuns.forEach(key => {
                if (key != '1' && key != '2' && key != '3') {
                    return
                }
                const dispenseType = 'ARROW'
                this.activateRun(
                    this.Locs.locations[`run${key}`],
                    dispenseType,
                    interval
                )
            })
        }, 35 * interval)

        interval = 170
        this.setInterval(() => {
            this.activeRuns.forEach(key => {
                if (key != '4' && key != '5') {
                    return
                }
                const dispenseType = 'LEGACY_FIREBALL'
                this.activateRun(
                    this.Locs.locations[`run${key}`],
                    dispenseType,
                    interval
                )
            })
        }, 35 * interval)
    }

    public activateRun(rows, dispenseType, interval) {
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
                                        if (e.type == 'ARROW') {
                                            e.remove()
                                        }
                                    })
                            }
                        }
                    }, interval * 25)
                })
            }, i * interval)
        })
    }

    public registerEvents() {
        super.registerEvents()

        // playerPickupItem
        this.registerEvent('playerPickupItem', event => {
            if (event.player.name != this.player.name) {
                return
            }
            if (event.player.world.name != this.world.getName()) {
                return
            }
            // Cancel arrow pickup event.
            if (event.item.itemStack.type == 'ARROW') {
                event.setCancelled(true)
            }
        })
    }

    public getBlocksInRadius(loc, radius = 2, filterTypes?: string[]) {
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
