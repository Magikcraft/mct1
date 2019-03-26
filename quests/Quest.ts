import { Logger } from '../log'
import { questCommand } from './index'
import { ChestItems } from './mct1/chest-items'
import { Inventories } from './mct1/inventories'
import * as questTools from './quest-tools'
import * as tools from '../tools'
import { user } from '../user'
import { worldly } from '../world'

import * as server from '../utils/server'
import * as events from 'events'
import DB from './db'

export type QuestMode = 'single' | 'multi'
export interface QuestOptions {
    mode: QuestMode
    /** When set to true, this.debug will print to log */
    verbose?: boolean
    units: 'mgdL' | 'mmolL'
}
export interface QuestConfig {
    name: string
    nextQuestName: string | undefined
    player: any
    world: any
    options: QuestOptions
}

export type Quest = QuestBase | QuestMCT1

export class QuestBase {
    name: string
    nextQuestName?: string
    player: any
    db: DB // player database
    world: any
    state: any = {}
    options: any
    log: any
    /** When set to true, this.debug will print messages to log */
    verbose: boolean = false
    Locs: any = {}
    inventory: any[] = []
    waypoints?: any[]
    endPortalRegion?: any[]

    private events: any = {}
    private intervals: any = {}
    private timers: any = {}

    constructor(conf: QuestConfig) {
        this.name = conf.name
        this.nextQuestName = conf.nextQuestName
        this.player = conf.player
        this.world = conf.world
        this.db = new DB(this.world.name)
        this.options = conf.options || {}
        this.log = Logger(`mct1/quests/${this.name}--${this.player.name}`)
        this.verbose = (conf.options && conf.options.verbose) || false
    }

    start() {
        const { player, world } = this
        this.stop() // stop and restart, in case already running.
        this.registerEvents()
        this.setupWayPoints()
        this.setupEndPortal()
        // this.doTracking()
        worldly(world).setDestroyWorldIfEmpty(true, 5000)
    }

    doTracking() {
        this.setTimeout(() => {
            this.track()
            this.setInterval(() => {
                this.track()
            }, 10000) // track every 10 secs
        }, 2000) // delay first track by 2 secs
    }

    track() {
        // user(this.player).db.
        this.log(`track quest ${this.world.name}`)
        const { player, world, name } = this

        const inventoryJSON = user(player).inventory.exportToJSON(
            user(player).inventory.getAllitemStacks()
        )
        const inventory = inventoryJSON
            .map((item, i) => (item ? { ...item, slot: i } : null))
            .filter(item => item)

        const mct1 = user(player).mct1.isStarted
            ? {
                  bgl: user(player).mct1.bgl,
                  insulin: user(player).mct1.insulin,
                  digestionQueue: user(player).mct1.digestionQueue.map(
                      item => ({ ...item })
                  ), // Clone instead of object reference
                  isStarted: user(player).mct1.isStarted,
                  isUSA: user(player).mct1.isUSA,
                  hasInfiniteInsulin: user(player).mct1.hasInfiniteInsulin,
                  hasLightningSnowballs: user(player).mct1
                      .hasLightningSnowballs,
                  hasSuperJump: user(player).mct1.hasSuperJump,
                  hasSuperSpeed: user(player).mct1.hasSuperSpeed,
                  hasNightVision: user(player).mct1.hasNightVision,
                  isSuperCharged: user(player).mct1.isSuperCharged,
              }
            : false

        const state = {
            quest: name,
            player: player.name,
            isDead: player.isDead(),
            world: world.name,
            session: user(player).sessionId,
            timestamp: new Date(),
            health: player.health,
            foodLevel: player.foodLevel,
            location: tools.locationToJSON(player.location),
            inventory: inventory,
            mct1: mct1,
        }

        // Log to console.
        const logs: any[] = []
        logs.push(`PLAYER: ${player.name}`)
        logs.push(`WORLD: ${world.name}`)
        logs.push(`HEALTH: ${player.health}`)
        logs.push(`FOOD_LEVEL: ${player.foodLevel}`)
        if (mct1) {
            logs.push(`BGL: ${mct1.bgl}`)
            logs.push(`INSULIN: ${mct1.insulin}`)

            let digestionQueue: any[] = []
            mct1.digestionQueue.forEach(item => {
                if (item && item.food && item.food.type) {
                    digestionQueue.push(item.food.type)
                }
            })
            logs.push(`DIGESTION_QUEUE: [${digestionQueue.join(', ')}]`)
        }

        this.log(logs.join(' | '))
    }

    stop() {
        const { world } = this
        worldly(world).killAll('*')
        this.unregisterAllEvents()
        this.clearAllIntervals()
        this.clearAllTimeouts()
    }

    registerEvents() {
        const { player, world, options, log } = this

        // playerChangedWorld
        this.registerEvent('playerChangedWorld', event => {
            if (
                event.player.name == player.name &&
                event.from.name == world.name
            ) {
                this.stop()
            }
        })

        // playerQuit
        this.registerEvent('playerQuit', event => {
            if (event.player.name == player.name) {
                this.stop()
            }
        })
    }

    complete() {
        const { player, options, nextQuestName } = this
        this.stop()

        if (this.nextQuestName) {
            questCommand(nextQuestName, 'start', player, options)
        }
    }

    setTimeout(callback: any, interval: number, key?: string) {
        const k = key || tools.uuid()
        this.timers[k] = setTimeout(callback, interval)
    }

    clearTimeout(key: string) {
        clearTimeout(this.timers[key])
    }

    clearTimeoutsLike(wildcard: string) {
        for (let key in this.timers) {
            if (key.includes(wildcard)) {
                this.clearTimeout(key)
            }
        }
    }

    clearAllTimeouts() {
        for (let key in this.timers) {
            this.clearTimeout(key)
        }
    }

    setInterval = function(callback: any, interval: number, key?: string) {
        const k = key || tools.uuid()
        this.intervals[k] = setInterval(callback, interval)
    }

    clearInterval(key: string) {
        clearInterval(this.intervals[key])
    }

    clearIntervalsLike(wildcard: string) {
        for (let key in this.timers) {
            if (key.includes(wildcard)) {
                this.clearInterval(key)
            }
        }
    }

    clearAllIntervals() {
        for (let key in this.intervals) {
            this.clearInterval(key)
            delete this.intervals[key]
        }
    }

    /**
     * Print debugging messages to the log when this.verbose is true
     * @param msg - The message to log. Can be used for a label.
     * @param toLog - An object or string to log.
     */
    debug(msg, toLog?: any) {
        if (this.verbose) {
            this.log(msg, toLog)
        }
    }

    registerEvent(type: string, callback: any, key?: string) {
        const k = key || tools.uuid()
        this.unregisterEvent(k)
        this.events[k] = events[type](callback)
    }

    unregisterEvent(key: string) {
        if (this.events[key]) this.events[key].unregister()
    }

    unregisterEventsLike(wildcard: string) {
        for (let key in this.events) {
            if (key.includes(wildcard)) {
                this.unregisterEvent(key)
            }
        }
    }

    unregisterAllEvents() {
        for (let key in this.events) {
            this.unregisterEvent(key)
            delete this.events[key]
        }
    }

    setupEndPortal() {
        const { player, world, endPortalRegion } = this
        if (endPortalRegion) {
            const name = 'endPortal'
            worldly(world).registerRegion(
                name,
                endPortalRegion[0],
                endPortalRegion[1]
            )
            worldly(world).registerPlayerEnterRegionEvent(name, event => {
                this.complete()
            })
        }
    }

    setupWayPoints() {
        const { player, world, Locs, log } = this
        const { waypoints } = Locs
        if (waypoints) {
            for (const name in waypoints) {
                const waypoint = waypoints[name]
                const key = `waypoint-${name}`
                worldly(world).registerRegion(
                    key,
                    waypoint.region[0],
                    waypoint.region[1]
                )
                worldly(world).registerPlayerEnterRegionEvent(key, event => {
                    user(player).saveSpawn(waypoint.saveLocation)
                })
            }
        }
    }
}

// #################### MCT1 Quest #######################

export class QuestMCT1 extends QuestBase {
    mct1QuestName: string
    endGateRegion?: any[]
    endChestLocation?: any
    endChestContents?: any[]

    constructor(conf: QuestConfig) {
        super(conf)

        if (this.name === 'mct1') this.name = 'mct1-prologue'
        this.mct1QuestName = this.name.replace('mct1-', '')

        if (Inventories[this.mct1QuestName]) {
            this.inventory = Inventories[this.mct1QuestName]
        }
    }

    start() {
        // Set defaults for MCT1 quests.
        const { name, player, world, options, log, Locs } = this
        const { locations, regions } = Locs

        if (ChestItems[this.mct1QuestName])
            this.endChestContents = ChestItems[this.mct1QuestName]

        if (locations.endChest) this.endChestLocation = locations.endChest
        if (regions.endGate) this.endGateRegion = regions.endGate
        if (regions.endPortal) this.endPortalRegion = regions.endPortal

        // Do this here ...
        super.start()

        user(player).teleport(locations.spawn)
        user(player).saveSpawn(locations.spawn)
        user(player).setRespawnAtSpawnLocation(true)
        user(player).gma() // ADVENTURE!
        user(player).effects.cancel('LEVITATION') // Just in case

        if (this.inventory) {
            user(player).inventory.set(this.inventory)
        }
        user(player).inventory.saveCurrent()
        user(player).inventory.setReloadAtSpawn(true)

        this.setMCT1SuperPowers(false)
        user(player).mct1.start()
        user(player).mct1.setInfiniteInsulin(true)
        log('setInfiniteInsulin')
        worldly(world).killAll('mobs')
        // world.setSpawnFlags(false, true)

        worldly(world).setNight()
        worldly(world).setStorm()
        worldly(world).preventMobSpawning(['HUSK'])
        // worldly(world).setDestroyWorldIfEmpty(true, 3000)

        // setup endchest contents
        if (this.endChestLocation && this.endChestContents) {
            questTools.putItemsInChest(
                this.endChestLocation,
                this.endChestContents
            )
        }

        if (this.nextQuestName) {
            // pre-import world to make quest start more snappy
            // questCommand(this.nextQuestName, 'import', player, options)
        }
    }

    stop() {
        super.stop()
    }

    complete() {
        super.complete()
    }

    setMCT1SuperPowers(bool) {
        const { player } = this
        if (bool) {
            user(player).mct1.setSuperCharged(false)
            user(player).mct1.setInfiniteSnowballs(true)
            user(player).mct1.setSuperJump(true)
            user(player).mct1.setSuperSpeed(true)
            user(player).mct1.setNightVision(false)
            // user(player).mct1.start()
        } else {
            user(player).mct1.setSuperCharged(false)
            user(player).mct1.setInfiniteSnowballs(false)
            user(player).mct1.setSuperJump(false)
            user(player).mct1.setSuperSpeed(false)
            user(player).mct1.setNightVision(false)
            // user(player).mct1.start()
        }
    }

    openEndGate() {
        const { player, world, options, log, nextQuestName } = this

        // if (this.nextQuestName) {
        // 	// pre-import world to make quest start more snappy
        // 	questCommand(nextQuestName, 'import', player, options)
        // }

        if (this.endGateRegion) {
            // End gate effect
            const reg = this.endGateRegion
            questTools.replaceRegion(reg[0], reg[1], 'AIR')
            questTools.playEffectInRegion(reg[0], reg[1], 'DRAGON_BREATH')
            // this.setInterval(() => {
            //     questTools.playEffectInRegion(reg[0], reg[1], 'PORTAL')
            // }, 500)
        }
    }

    registerEvents() {
        super.registerEvents()
        const { player } = this

        if (this.endChestLocation) {
            // inventoryClose
            this.registerEvent('inventoryClose', event => {
                if (event.player.name != player.name) return
                if (event.inventory.type != 'CHEST') return

                // end chest close...
                const cLoc = event.inventory.location
                const ecLoc = this.endChestLocation
                if (
                    cLoc.x === ecLoc.x &&
                    cLoc.y === ecLoc.y &&
                    cLoc.z === ecLoc.z
                ) {
                    this.openEndGate()
                }
            })
        }
    }
}
