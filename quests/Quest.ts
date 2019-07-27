import * as events from 'events'
import { Logger } from '../log'
import * as tools from '../tools'
import { MCT1PlayerCache } from '../user'
import MCT1Player from '../user/MCT1Player'
import ManagedWorld from '../world/ManagedWorld'
import DB from './db'
import { questCommand } from './index'
import { QuestMCT1 } from './QuestMCT1'

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
    player: Player
    world: ManagedWorld
    options: QuestOptions
}

export type Quest = QuestBase | QuestMCT1

export class QuestBase {
    public name: string
    public nextQuestName?: string
    public player: any
    public db: DB // player database
    public world: ManagedWorld
    public state: any = {}
    public options: any
    public log: any
    /** When set to true, this.debug will print messages to log */
    public verbose: boolean = false
    public Locs: any = {}
    public inventory: any[] = []
    public waypoints?: any[]
    public endPortalRegion?: any[]
    public mct1Player: MCT1Player
    private events: any = {}
    private intervals: any = {}
    private timers: any = {}

    constructor(conf: QuestConfig) {
        this.name = conf.name
        this.nextQuestName = conf.nextQuestName
        this.player = conf.player
        this.mct1Player = MCT1PlayerCache.getMct1Player(conf.player)
        this.world = conf.world
        this.db = new DB(this.world.getName())
        this.options = conf.options || {}
        this.log = Logger(`mct1/quests/${this.name}--${this.player.name}`)
        this.verbose = (conf.options && conf.options.verbose) || false
    }

    public start() {
        this.log('Starting quest')
        this.stop() // stop and restart, in case already running.
        this.registerEvents()
        this.setupWayPoints()
        this.setupEndPortal()
        // this.doTracking()
    }

    public doTracking() {
        this.setTimeout(() => {
            this.track()
            this.setInterval(() => {
                this.track()
            }, 10000) // track every 10 secs
        }, 2000) // delay first track by 2 secs
    }

    public track() {
        // this.mct1Player.db.
        this.log(`track quest ${this.world.getName()}`)

        const inventoryJSON = this.mct1Player.inventory.exportToJSON(
            this.mct1Player.inventory.getAllitemStacks()
        )
        const inventory = inventoryJSON
            .map((item, i) => (item ? { ...item, slot: i } : null))
            .filter(item => item)

        const mct1 = this.mct1Player.mct1.isStarted
            ? {
                  bgl: this.mct1Player.mct1.bgl,
                  digestionQueue: this.mct1Player.mct1.digestionQueue.map(
                      item => ({ ...item })
                  ), // Clone instead of object reference
                  hasInfiniteInsulin: this.mct1Player.mct1.hasInfiniteInsulin,
                  hasLightningSnowballs: this.mct1Player.mct1
                      .hasLightningSnowballs,
                  hasNightVision: this.mct1Player.mct1.hasNightVision,
                  hasSuperJump: this.mct1Player.mct1.hasSuperJump,
                  hasSuperSpeed: this.mct1Player.mct1.hasSuperSpeed,
                  insulin: this.mct1Player.mct1.insulin,
                  isStarted: this.mct1Player.mct1.isStarted,
                  isSuperCharged: this.mct1Player.mct1.isSuperCharged,
                  isUSA: this.mct1Player.mct1.isUSA,
              }
            : false

        const state = {
            foodLevel: this.player.foodLevel,
            health: this.player.health,
            inventory,
            isDead: this.player.isDead(),
            location: tools.locationToJSON(this.player.location),
            mct1,
            player: this.player.name,
            quest: QuestBase.name,
            session: this.mct1Player.sessionId,
            timestamp: new Date(),
            world: this.world.getName(),
        }

        // Log to console.
        const logs: any[] = []
        logs.push(`PLAYER: ${this.player.name}`)
        logs.push(`WORLD: ${this.world.getName()}`)
        logs.push(`HEALTH: ${this.player.health}`)
        logs.push(`FOOD_LEVEL: ${this.player.foodLevel}`)
        if (mct1) {
            logs.push(`BGL: ${mct1.bgl}`)
            logs.push(`INSULIN: ${mct1.insulin}`)

            const digestionQueue: any[] = []
            mct1.digestionQueue.forEach(item => {
                if (item && item.food && item.food.type) {
                    digestionQueue.push(item.food.type)
                }
            })
            logs.push(`DIGESTION_QUEUE: [${digestionQueue.join(', ')}]`)
        }

        this.log(logs.join(' | '))
    }

    public stop() {
        this.log('Stopping quest')
        this.world.killAll('*')
        this.unregisterAllEvents()
        this.clearAllIntervals()
        this.clearAllTimeouts()
    }

    public registerEvents() {
        // playerChangedWorld
        this.registerEvent('playerChangedWorld', event => {
            if (
                event.player.name == this.player.name &&
                event.from.name == this.world.getName()
            ) {
                this.log('Quest player changed world handler')
                this.stop()
            }
        })
    }

    public complete() {
        this.stop()

        if (this.nextQuestName) {
            questCommand({
                method: 'start',
                opts: this.options,
                player: this.player,
                questName: this.nextQuestName,
            })
        }
    }

    public setTimeout(callback: any, interval: number, key?: string) {
        const k = key || tools.uuid()
        this.timers[k] = setTimeout(callback, interval)
    }

    public clearTimeout(key: string) {
        clearTimeout(this.timers[key])
    }

    public clearTimeoutsLike(wildcard: string) {
        for (const key in this.timers) {
            if (key.includes(wildcard)) {
                this.clearTimeout(key)
            }
        }
    }

    public clearAllTimeouts() {
        for (const key in this.timers) {
            this.clearTimeout(key)
        }
    }

    public setInterval = function(
        callback: any,
        interval: number,
        key?: string
    ) {
        const k = key || tools.uuid()
        this.intervals[k] = setInterval(callback, interval)
    }

    public clearInterval(key: string) {
        clearInterval(this.intervals[key])
    }

    public clearIntervalsLike(wildcard: string) {
        for (const key in this.timers) {
            if (key.includes(wildcard)) {
                this.clearInterval(key)
            }
        }
    }

    public clearAllIntervals() {
        for (const key in this.intervals) {
            this.clearInterval(key)
            delete this.intervals[key]
        }
    }

    /**
     * Print debugging messages to the log when this.verbose is true
     * @param msg - The message to log. Can be used for a label.
     * @param toLog - An object or string to log.
     */
    public debug(msg, toLog?: any) {
        if (this.verbose) {
            this.log(msg, toLog)
        }
    }

    public registerEvent(type: string, callback: any, key?: string) {
        const k = key || tools.uuid()
        this.unregisterEvent(k)
        this.events[k] = events[type](callback)
    }

    public unregisterEvent(key: string) {
        if (this.events[key]) {
            this.events[key].unregister()
        }
    }

    public unregisterEventsLike(wildcard: string) {
        for (const key in this.events) {
            if (key.includes(wildcard)) {
                this.unregisterEvent(key)
            }
        }
    }

    public unregisterAllEvents() {
        for (const key in this.events) {
            this.unregisterEvent(key)
            delete this.events[key]
        }
    }

    public setupEndPortal() {
        if (this.endPortalRegion) {
            const name = 'endPortal'
            this.world.registerRegion(
                name,
                this.endPortalRegion[0],
                this.endPortalRegion[1]
            )
            this.world.registerPlayerEnterRegionEvent(name, event => {
                this.complete()
            })
        }
    }

    public setupWayPoints() {
        const { waypoints } = this.Locs
        if (waypoints) {
            for (const name in waypoints) {
                const waypoint = waypoints[name]
                const key = `waypoint-${name}`
                this.world.registerRegion(
                    key,
                    waypoint.region[0],
                    waypoint.region[1]
                )
                this.world.registerPlayerEnterRegionEvent(key, event => {
                    this.mct1Player.saveSpawn(waypoint.saveLocation)
                })
            }
        }
    }
}
