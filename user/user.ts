import { Logger } from '@magikcraft/mct1/log'
import { MCT1 } from '@magikcraft/mct1/mct1'
import * as tools from '@magikcraft/mct1/tools'
import { user } from '@magikcraft/mct1/user'
import * as events from 'events'
import { Quest } from '../quests/Quest'
import DB from './db'
import PlayerEffects from './effects'
import Follower from './follower'
import PlayerInventory from './inventory'

const log = Logger(__filename)

const GameMode = Java.type('org.bukkit.GameMode')

// User class
export default class User {
    public player: BukkitPlayer
    public sessionId
    public world // the world player is currently in
    public mct1: MCT1
    public db: DB // player database
    public inventory: PlayerInventory
    public effects: PlayerEffects
    public follower: Follower
    public quest: Quest | undefined
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

    public cleanse() {
        this.unregisterAllEvents()
        this.clearAllTimeouts()
        this.clearAllIntervals()
        this.mct1.stop()
    }

    public teleport(location) {
        // Player cannot teleport with a passenger. See https://www.spigotmc.org/threads/catch-a-player-teleport-attempt-while-passenger-is-set.95710/
        this.player.eject()
        log(`Teleporting ${this.player.name}`)
        this.player.teleport(location)
    }

    public gms = () => this.player.setGameMode(GameMode.SURVIVAL)
    public gmc = () => this.player.setGameMode(GameMode.CREATIVE)
    public gmsp = () => this.player.setGameMode(GameMode.SPECTATOR)
    public gma = () => this.player.setGameMode(GameMode.ADVENTURE)

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

    public setSpawn() {
        this.saveSpawn(this.player.location)
    }

    public saveSpawn(location) {
        this.db.set('spawnLocation', tools.locationToJSON(location))
    }

    public loadSpawn() {
        if (this.getSpawn()) {
            user(this.player).teleport(this.getSpawn())
        }
    }

    public getSpawn() {
        return this.db.get('spawnLocation')
            ? tools.locationFromJSON(this.db.get('spawnLocation'))
            : undefined
    }

    public clearSpawn() {
        this.db.delete('spawnLocation')
    }

    public setRespawnAtSpawnLocation(
        bool: boolean,
        teleportBetweenWorlds?: boolean
    ) {
        const key = 'setRespawnAtSpawn'
        if (bool) {
            if (!this.events[key]) {
                this.registerEvent(
                    'playerRespawn',
                    event => {
                        if (event.player.name !== this.player.name) {
                            return
                        }
                        const spawn = this.getSpawn()
                        if (!spawn) {
                            // return
                            event.setRespawnLocation(
                                this.player.world.getSpawnLocation()
                            )
                        } else {
                            if (
                                !teleportBetweenWorlds &&
                                this.player.world.name !== spawn.world.name
                            ) {
                                return
                            }
                            event.setRespawnLocation(spawn)
                        }
                    },
                    key
                )
            }
        } else {
            if (this.events[key]) {
                this.unregisterEvent(key)
            }
        }
    }

    public setGodMode(bool: boolean) {
        const key = 'setGodMode'
        if (bool) {
            if (!this.events[key]) {
                this.registerEvent(
                    'entityDamage',
                    event => {
                        if (event.entity.type != 'PLAYER') {
                            return
                        }
                        if (event.entity.name !== this.player.name) {
                            return
                        }
                        event.setCancelled(true)
                    },
                    key
                )
            }
        } else {
            if (this.events[key]) {
                this.unregisterEvent(key)
            }
        }
    }

    public setReloadInventoryAtSpawn(bool: boolean) {
        this.inventory.setReloadAtSpawn(bool)
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
        }
    }

    public registerEvent(type: string, callback: any, key?: string) {
        const k = key || type
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
        }
    }

    public follow(whoToFollow) {
        this.follower.startFollowing(whoToFollow)
    }

    public stopFollowing() {
        this.follower.stopFollowing()
    }

    public tell(msg) {
        echo(this.player, msg)
    }
}
