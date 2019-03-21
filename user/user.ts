import * as events from 'events'

import { Logger } from 'mct1/log'
const log = Logger(`${[__dirname, __filename].join('/')}`)

import { MCT1 } from 'mct1/mct1'
import * as tools from 'mct1/tools'
import DB from './db'
import PlayerInventory from './inventory'
import PlayerEffects from './effects'
import { user } from 'mct1/user';
import Follower from './follower'

const GameMode = Java.type('org.bukkit.GameMode')

// User class
export default class User {
    player: BukkitPlayer
    sessionId
    world // the world player is currently in
    mct1: MCT1
    db: DB // player database
    inventory: PlayerInventory
    effects: PlayerEffects
    follower: Follower
    // cube: Follower

    private timers
    private intervals
    private events = {}

    constructor(player) {
        this.player = player
        this.sessionId = tools.uuid()
        this.mct1 = new MCT1(player)
        this.db = new DB(player)
        this.inventory = new PlayerInventory(player)
        this.effects = new PlayerEffects(player)
        this.setRespawnAtSpawnLocation(true)
        this.setReloadInventoryAtSpawn(true)
        this.follower = new Follower(user)
        // this.cube =
    }

    cleanse() {
        this.unregisterAllEvents()
        this.clearAllTimeouts()
        this.clearAllIntervals()
        this.mct1.stop()
    }

    teleport(location) {
        // Player cannot teleport with a passenger. See https://www.spigotmc.org/threads/catch-a-player-teleport-attempt-while-passenger-is-set.95710/
        this.player.eject()
        this.player.teleport(location)
    }

    gms = () => this.player.setGameMode(GameMode.SURVIVAL)
    gmc = () => this.player.setGameMode(GameMode.CREATIVE)
    gmsp = () => this.player.setGameMode(GameMode.SPECTATOR)
    gma = () => this.player.setGameMode(GameMode.ADVENTURE)

    // continue () {
    // 	// if player is part way through a quest, restart quest at last waypoint.
    // }

    // saveQuest (quest) {
    // 	this.db.set('quest', tools.questToJSON(quest))
    // }

    // loadQuest () {
    // 	return this.db.get('quest')
    // 		? tools.questFromJSON(this.db.get('quest'))
    // 		: undefined
    // }

    setSpawn() {
        this.saveSpawn(this.player.location)
    }

    saveSpawn(location) {
        this.db.set('spawnLocation', tools.locationToJSON(location))
    }

    loadSpawn() {
        if (this.getSpawn()) user(this.player).teleport(this.getSpawn())
    }

    getSpawn() {
        return this.db.get('spawnLocation')
            ? tools.locationFromJSON(this.db.get('spawnLocation'))
            : undefined
    }

    clearSpawn() {
        this.db.delete('spawnLocation')
    }

    setRespawnAtSpawnLocation(bool: boolean, teleportBetweenWorlds?: boolean) {
        const key = 'setRespawnAtSpawn'
        if (bool) {
            if (!this.events[key]) {
                this.registerEvent('playerRespawn',
                    (event) => {
                        if (event.player.name !== this.player.name) return
                        const spawn = this.getSpawn()
                        if (!spawn) {
                            // return
                            event.setRespawnLocation(this.player.world.getSpawnLocation())
                        } else {
                            if (!teleportBetweenWorlds && this.player.world.name !== spawn.world.name) {
                                return
                            }
                            event.setRespawnLocation(spawn)
                        }
                    },
                    key
                )
            }
        }
        else {
            if (this.events[key]) {
                this.unregisterEvent(key)
            }
        }
    }

    setGodMode(bool: boolean) {
        const key = 'setGodMode'
        if (bool) {
            if (!this.events[key]) {
                this.registerEvent('entityDamage',
                    (event) => {
                        if (event.entity.type != 'PLAYER') return
                        if (event.entity.name !== this.player.name) return
                        event.setCancelled(true)
                    },
                    key
                )
            }
        }
        else {
            if (this.events[key]) {
                this.unregisterEvent(key)
            }
        }
    }

    setReloadInventoryAtSpawn(bool: boolean) {
        this.inventory.setReloadAtSpawn(bool)
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

    setInterval = function (callback: any, interval: number, key?: string) {
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
        }
    }

    registerEvent(type: string, callback: any, key?: string) {
        const k = key || type
        this.unregisterEvent(k)
        this.events[k] = events[type](callback)
    }

    unregisterEvent(key: string) {
        if (this.events[key]) this.events[key].unregister()
    }

    unregisterEventsLike(wildcard: string) {
        for (const key in this.events) {
            if (key.includes(wildcard)) {
                this.unregisterEvent(key)
            }
        }
    }

    public unregisterAllEvents() {
        for (const key in this.events) {
            this.unregisterEvent(key)
        }
    }

    follow(whoToFollow) {
        this.follower.startFollowing(whoToFollow)
    }

    stopFollowing() {
        this.follower.stopFollowing()
    }

    tell(msg) {
        echo(this.player, msg)
    }
}
