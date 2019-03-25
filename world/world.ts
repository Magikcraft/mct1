import * as events from 'events'
import { Logger } from '@magikcraft/mct1/log'
import * as tools from '@magikcraft/mct1/tools'
import { worldlyDelete } from '@magikcraft/mct1/world/index'
import * as server from '@magikcraft/mct1/utils/server'

const Biome = Java.type('org.bukkit.block.Biome')

const log = Logger(__filename)

interface IWorldRegion {
    name: string
    loc1: any // region
    loc2: any
    enterEventHandlers: IWorldRegionEventHandler[]
    exitEventHandlers: IWorldRegionEventHandler[]
}

interface IWorldRegionEventHandler {
    handler: any
    player?: any
}

interface IWorldPlayer {
    player: any
    moveCount: number
    inRegionNames: string[]
}

// User class
export default class World {
    private world
    private started: boolean = false
    private regions: IWorldRegion[] = []
    private regionEvents
    private worldPlayers: IWorldPlayer[] = []

    private logger

    private events: any = {}
    private intervals: any = {}
    private timers: any = {}

    private destroyWorldIfEmpty: boolean = false
    private destroyWorldIfEmptyDelay: number = 3000

    constructor(world) {
        this.world = world
        this.logger = Logger(`world--${this.world.name}`)
        this._watchPlayersJoinWorld()
    }

    start() {
        this._watchPlayersMove()
        this._watchPlayersLeaveWorld()
        this.started = true
    }

    stop() {
        this.unregisterAllEvents()
        this.clearAllTimeouts()
        this.clearAllIntervals()
        // Restart watcher
        this._watchPlayersJoinWorld()
        this.started = false
    }

    cleanse() {
        this.unregisterAllEvents()
        this.clearAllTimeouts()
        this.clearAllIntervals()
    }

    // setTime = (time: 'dawn' | 'day' | 'dusk' | 'night') => server.executeCommand(`time ${time} ${this.world.name}`)
    setDawn = () => this.world.setTime(6000)
    setDay = () => this.world.setTime(12000)
    setDusk = () => this.world.setTime(18000)
    setNight = () => this.world.setTime(20000)
    setSun = () => this.world.setStorm(false) || this.world.setThundering(false)
    setStorm = () => this.world.setThundering(true) || this.world.setStorm(true)
    setRain = () => this.world.setStorm(true)

    killAll(type: '*' | 'mobs' | 'monsters') {
        server.executeCommand(`killall ${type} ${this.world.name}`)
    }

    setChunkBiome(loc, biome: string) {
        const chunk = this.world.getChunkAt(loc)
        for (let x = 0; x < 16; x++) {
            for (let z = 0; z < 16; z++) {
                const block = chunk.getBlock(x, 0, z)
                this.log('setChunkBiome', `${x} 0 ${z}`)
                this.log('block.getBiome()', block.getBiome())
                block.setBiome(Biome[biome])
            }
        }
    }

    registerRegion(regionName: string, loc1, loc2) {
        this.regions.push({
            name: regionName,
            loc1: loc1,
            loc2: loc2,
            enterEventHandlers: [],
            exitEventHandlers: [],
        })
    }

    log(label: string, log?: any) {
        this.logger(label, log)
    }

    registerPlayerEnterRegionEvent = (regionName, handler, player?: any) => {
        this._registerPlayerRegionEvent('enter', regionName, handler, player)
    }

    registerPlayerExitRegionEvent(regionName, handler, player?: any) {
        this._registerPlayerRegionEvent('exit', regionName, handler, player)
    }

    preventDeadPlayerDrops() {
        this.registerEvent('playerDeath', event => {
            if (event.entity.type != 'PLAYER') return
            // Clean-up dropped items
            setTimeout(() => {
                event.entity.getNearbyEntities(1, 1, 1).forEach(entity => {
                    if (entity.type == 'DROPPED_ITEM' && entity.name) {
                        entity.remove()
                    }
                })
            }, 1)
        })
    }

    preventBlockBreak(except: string[] = []) {
        this.registerEvent('blockBreak', event => {
            if (event.block.world.name !== this.world.name) return
            const blockType = event.block.type.toString()
            if (except.includes(blockType)) return
            event.setCancelled(true)
        })
    }

    allowMobSpawning = () => {
        this.unregisterEvent('preventMobSpawning')
    }

    preventMobSpawning(except: string[] = []) {
        this.unregisterEvent('preventMobSpawning')
        this.registerEvent(
            'creatureSpawn',
            event => {
                if (event.entity.world.name !== this.world.name) {
                    return
                }
                const mobType = event.entity.type.toString()
                if (except.includes(mobType)) {
                    return
                }

                const isMonster =
                    event.entity instanceof
                    Java.type('org.bukkit.entity.Monster')
                const otherMonsterTypes = ['SLIME']

                if (
                    !isMonster &&
                    !otherMonsterTypes.includes(event.entity.type.toString())
                ) {
                    return
                }
                // log(`Cancel spawn ${event.entity.type}`);
                event.setCancelled(true)
            },
            'preventMobSpawning'
        )
    }

    setDestroyWorldIfEmpty(bool: boolean, delay?: number) {
        this.destroyWorldIfEmpty = bool
        if (delay) {
            this.destroyWorldIfEmptyDelay = delay
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
        }
    }

    private _registerPlayerRegionEvent(
        type,
        regionName,
        handler,
        player?: any
    ) {
        let region
        this.regions.forEach(r => {
            // use forEach as find pollyfill may not be loaded...
            if (r.name === regionName) region = r
        })
        if (region) {
            if (type === 'enter')
                region.enterEventHandlers.push({ handler, player })
            if (type === 'exit')
                region.exitEventHandlers.push({ handler, player })
        }
    }

    private _watchPlayersJoinWorld() {
        this.world.players.forEach(player => this._playerJoinedWorld(player))

        this.registerEvent('playerJoin', event => {
            if (event.player.world.name !== this.world.name) return
            this._playerJoinedWorld(event.player)
        })

        this.registerEvent('playerChangedWorld', event => {
            if (event.player.world.name !== this.world.name) return
            this._playerJoinedWorld(event.player)
        })
    }

    private _playerJoinedWorld(player) {
        this.log(`player ${player.name} joined world ${this.world.name}`)
        const worldPlayer = {
            player: player,
            moveCount: 0,
            inRegionNames: [],
        }
        // Ensure clean
        // player.setBedSpawnLocation(this.world.getSpawnLocation())

        this.worldPlayers.push(worldPlayer)
        this._playerMove(worldPlayer) // populate inRegions
        // One or more players in world. Run start.
        if (!this.started) {
            this.start()
        }
    }

    private _watchPlayersLeaveWorld() {
        this.registerEvent('playerChangedWorld', event => {
            if (event.from.name !== this.world.name) return
            this._playerLeftWorld(event.player)
        })
    }

    private _playerLeftWorld(player) {
        this.log(`player ${player.name} left world ${this.world.name}`)
        this.worldPlayers = this.worldPlayers.filter(
            wp => wp.player.name != player.name
        )
        // If no players are left in world. Run stop.
        if (!this.worldPlayers.length) {
            this.stop()
            if (this.destroyWorldIfEmpty) {
                this.setTimeout(() => {
                    if (!this.worldPlayers.length) {
                        worldlyDelete(this.world)
                        server.executeCommand(`mv delete ${this.world.name}`)
                        server.executeCommand(`mvconfirm`)
                    }
                }, this.destroyWorldIfEmptyDelay)
            }
        }
    }

    private _watchPlayersMove() {
        this.registerEvent('playerMove', event => {
            if (event.player.world.name !== this.world.name) return
            if (!this.regions.length) return
            const worldPlayer = this.worldPlayers.find(
                p => event.player.name === p.player.name
            )
            if (!worldPlayer) return
            worldPlayer.moveCount++
            if (worldPlayer.moveCount % 3 !== 0) return
            this._playerMove(worldPlayer)
        })
    }

    private _playerMove(worldPlayer) {
        // this.log('_playerMove')
        const player = worldPlayer.player
        // check if player exited any regions.
        worldPlayer.inRegionNames.forEach(regionName => {
            // this.log('exit check');
            const region = this.regions.find(r => r.name === regionName)
            if (region) {
                if (
                    !this._regionContainsLocation(
                        region,
                        worldPlayer.player.location
                    )
                ) {
                    // Remove from player.inRegionNames
                    worldPlayer.inRegionNames = worldPlayer.inRegionNames.filter(
                        name => region.name !== name
                    )
                    // Log!
                    log(`${player.name} exited region ${region.name}`)
                    // Run handlers
                    region.exitEventHandlers.forEach(handle => {
                        if (handle.player && handle.player.name != player.name)
                            return
                        handle.handler({ player })
                    })
                }
            }
        })

        // check if player entered any regions.
        this.regions.forEach(region => {
            // this.log(`player ${player.name} enter check for region: ${region.name}`);
            const alreadyInRegion = worldPlayer.inRegionNames.find(
                rnanme => rnanme === region.name
            )
            if (
                !alreadyInRegion &&
                this._regionContainsLocation(region, player.location)
            ) {
                // Add to player.inRegionNames
                worldPlayer.inRegionNames.push(region.name)
                // Log!
                this.log(`${player.name} entered region ${region.name}`)
                // Run handlers
                region.enterEventHandlers.forEach(handle => {
                    if (handle.player && handle.player.name != player.name)
                        return
                    handle.handler({ player })
                })
            }
        })
    }

    private _regionContainsLocation(reg: IWorldRegion, loc) {
        if (
            (loc.x >= reg.loc1.x && loc.x <= reg.loc2.x) ||
            (loc.x <= reg.loc1.x && loc.x >= reg.loc2.x)
        ) {
            if (
                (loc.y >= reg.loc1.y && loc.y <= reg.loc2.y) ||
                (loc.y <= reg.loc1.y && loc.y >= reg.loc2.y)
            ) {
                if (
                    (loc.z >= reg.loc1.z && loc.z <= reg.loc2.z) ||
                    (loc.z <= reg.loc1.z && loc.z >= reg.loc2.z)
                ) {
                    return true
                }
            }
        }
        return false
    }
}
