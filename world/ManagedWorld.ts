import * as events from 'events'
import { Logger } from '../log'
import * as tools from '../tools'
import * as server from '../utils/server'

const Biome = Java.type('org.bukkit.block.Biome')

const log = Logger(__filename)

export default class ManagedWorld {
    public playername?: string
    public worldname: string
    private bukkitWorld
    private started: boolean = false
    private regions: IWorldRegion[] = []
    private regionEvents
    private worldPlayers: IWorldPlayer[] = []
    private destroyed = false

    private logger

    private events: any = {}
    private intervals: any = {}
    private timers: any = {}

    constructor(bukkitWorld, playername?: string) {
        this.bukkitWorld = bukkitWorld
        this.logger = Logger(`world--${this.bukkitWorld.name}`)
        this.worldname = bukkitWorld.name
        log(`Creating ManagedWorld ${this.worldname}`)
        this.playername = playername
        this._watchPlayersJoinWorld()
    }

    public start() {
        this._watchPlayersMove()
        this.started = true
    }

    public stop() {
        this.unregisterAllEvents()
        this.clearAllTimeouts()
        this.clearAllIntervals()
        // Restart watcher
        this._watchPlayersJoinWorld()
        this.started = false
    }

    public cleanse() {
        this.unregisterAllEvents()
        this.clearAllTimeouts()
        this.clearAllIntervals()
    }

    public destroy() {
        log(`Destroying ManagedWorld ${this.getName()}`)
        this.destroyed = true
        this.cleanse()
    }
    public getBukkitWorld() {
        return this.bukkitWorld
    }

    public getName(): string {
        return this.bukkitWorld.name
    }
    // setTime = (time: 'dawn' | 'day' | 'dusk' | 'night') => server.executeCommand(`time ${time} ${this.world.name}`)
    public setDawn = () => this.bukkitWorld.setTime(6000)
    public setDay = () => this.bukkitWorld.setTime(12000)
    public setDusk = () => this.bukkitWorld.setTime(18000)
    public setNight = () => this.bukkitWorld.setTime(20000)
    public setSun = () =>
        this.bukkitWorld.setStorm(false) ||
        this.bukkitWorld.setThundering(false)
    public setStorm = () =>
        this.bukkitWorld.setThundering(true) || this.bukkitWorld.setStorm(true)
    public setRain = () => this.bukkitWorld.setStorm(true)

    public killAll(type: '*' | 'mobs' | 'monsters') {
        if (this.destroyed) {
            return
        }
        server.executeCommand(`killall ${type} ${this.bukkitWorld.name}`)
    }

    public setChunkBiome(loc, biome: string) {
        const chunk = this.bukkitWorld.getChunkAt(loc)
        for (let x = 0; x < 16; x++) {
            for (let z = 0; z < 16; z++) {
                const block = chunk.getBlock(x, 0, z)
                this.log('setChunkBiome', `${x} 0 ${z}`)
                this.log('block.getBiome()', block.getBiome())
                block.setBiome(Biome[biome])
            }
        }
    }

    public registerRegion(regionName: string, loc1, loc2) {
        this.regions.push({
            enterEventHandlers: [],
            exitEventHandlers: [],
            loc1,
            loc2,
            name: regionName,
        })
    }

    public log(label: string, msg?: any) {
        this.logger(label, msg)
    }

    public registerPlayerEnterRegionEvent = (
        regionName,
        handler,
        player?: any
    ) => {
        this._registerPlayerRegionEvent('enter', regionName, handler, player)
    }

    public registerPlayerExitRegionEvent(regionName, handler, player?: any) {
        this._registerPlayerRegionEvent('exit', regionName, handler, player)
    }

    public preventDeadPlayerDrops() {
        this.registerEvent('playerDeath', event => {
            if (event.entity.type != 'PLAYER') {
                return
            }
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

    public preventBlockBreak(except: string[] = []) {
        this.registerEvent('blockBreak', event => {
            if (event.block.world.name !== this.bukkitWorld.name) {
                return
            }
            const blockType = event.block.type.toString()
            if (except.includes(blockType)) {
                return
            }
            event.setCancelled(true)
        })
    }

    public allowMobSpawning = () => {
        this.unregisterEvent('preventMobSpawning')
    }

    public preventMobSpawning(except: string[] = []) {
        this.unregisterEvent('preventMobSpawning')
        this.registerEvent(
            'creatureSpawn',
            event => {
                if (event.entity.world.name !== this.bukkitWorld.name) {
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
        // tslint:disable-next-line: forin
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
        const k = key || tools.uuid()
        this.unregisterEvent(k)
        this.events[k] = events[type](callback)
    }

    public spawnEntity(location: BukkitLocation, entityType: any) {
        this.bukkitWorld.spawnEntity(location, entityType)
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

    private _registerPlayerRegionEvent(
        type,
        regionName,
        handler,
        player?: any
    ) {
        let region
        this.regions.forEach(r => {
            // use forEach as find pollyfill may not be loaded...
            if (r.name === regionName) {
                region = r
            }
        })
        if (region) {
            if (type === 'enter') {
                region.enterEventHandlers.push({ handler, player })
            }
            if (type === 'exit') {
                region.exitEventHandlers.push({ handler, player })
            }
        }
    }

    private _watchPlayersJoinWorld() {
        this.bukkitWorld.players.forEach(player =>
            this._playerJoinedWorld(player)
        )

        this.registerEvent('playerJoin', event => {
            if (event.player.world.name !== this.bukkitWorld.name) {
                return
            }
            this._playerJoinedWorld(event.player)
        })

        this.registerEvent('playerChangedWorld', event => {
            if (event.player.world.name !== this.bukkitWorld.name) {
                return
            }
            this._playerJoinedWorld(event.player)
        })
    }

    private _playerJoinedWorld(player) {
        this.log(`player ${player.name} joined world ${this.bukkitWorld.name}`)
        const worldPlayer = {
            inRegionNames: [],
            moveCount: 0,
            player,
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

    private _watchPlayersMove() {
        this.registerEvent('playerMove', event => {
            if (event.player.world.name !== this.bukkitWorld.name) {
                return
            }
            if (!this.regions.length) {
                return
            }
            const worldPlayer = this.worldPlayers.find(
                p => event.player.name === p.player.name
            )
            if (!worldPlayer) {
                return
            }
            worldPlayer.moveCount++
            if (worldPlayer.moveCount % 3 !== 0) {
                return
            }
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
                        if (
                            handle.player &&
                            handle.player.name != player.name
                        ) {
                            return
                        }
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
                    if (handle.player && handle.player.name != player.name) {
                        return
                    }
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
