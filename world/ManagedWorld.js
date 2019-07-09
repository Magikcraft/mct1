"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events = require("events");
var log_1 = require("../log");
var tools = require("../tools");
var server = require("../utils/server");
var Biome = Java.type('org.bukkit.block.Biome');
var log = log_1.Logger(__filename);
var ManagedWorld = /** @class */ (function () {
    function ManagedWorld(world, playername) {
        var _this = this;
        this.started = false;
        this.regions = [];
        this.worldPlayers = [];
        this.events = {};
        this.intervals = {};
        this.timers = {};
        // setTime = (time: 'dawn' | 'day' | 'dusk' | 'night') => server.executeCommand(`time ${time} ${this.world.name}`)
        this.setDawn = function () { return _this.world.setTime(6000); };
        this.setDay = function () { return _this.world.setTime(12000); };
        this.setDusk = function () { return _this.world.setTime(18000); };
        this.setNight = function () { return _this.world.setTime(20000); };
        this.setSun = function () {
            return _this.world.setStorm(false) || _this.world.setThundering(false);
        };
        this.setStorm = function () {
            return _this.world.setThundering(true) || _this.world.setStorm(true);
        };
        this.setRain = function () { return _this.world.setStorm(true); };
        this.registerPlayerEnterRegionEvent = function (regionName, handler, player) {
            _this._registerPlayerRegionEvent('enter', regionName, handler, player);
        };
        this.allowMobSpawning = function () {
            _this.unregisterEvent('preventMobSpawning');
        };
        this.setInterval = function (callback, interval, key) {
            var k = key || tools.uuid();
            this.intervals[k] = setInterval(callback, interval);
        };
        this.world = world;
        this.worldname = world.name;
        this.playername = playername;
        this.logger = log_1.Logger("world--" + this.world.name);
        this._watchPlayersJoinWorld();
    }
    ManagedWorld.prototype.start = function () {
        this._watchPlayersMove();
        this.started = true;
    };
    ManagedWorld.prototype.stop = function () {
        this.unregisterAllEvents();
        this.clearAllTimeouts();
        this.clearAllIntervals();
        // Restart watcher
        this._watchPlayersJoinWorld();
        this.started = false;
    };
    ManagedWorld.prototype.cleanse = function () {
        this.unregisterAllEvents();
        this.clearAllTimeouts();
        this.clearAllIntervals();
    };
    ManagedWorld.prototype.getBukkitWorld = function () {
        return this.world;
    };
    ManagedWorld.prototype.getName = function () {
        return this.world.name;
    };
    ManagedWorld.prototype.killAll = function (type) {
        server.executeCommand("killall " + type + " " + this.world.name);
    };
    ManagedWorld.prototype.setChunkBiome = function (loc, biome) {
        var chunk = this.world.getChunkAt(loc);
        for (var x = 0; x < 16; x++) {
            for (var z = 0; z < 16; z++) {
                var block = chunk.getBlock(x, 0, z);
                this.log('setChunkBiome', x + " 0 " + z);
                this.log('block.getBiome()', block.getBiome());
                block.setBiome(Biome[biome]);
            }
        }
    };
    ManagedWorld.prototype.registerRegion = function (regionName, loc1, loc2) {
        this.regions.push({
            enterEventHandlers: [],
            exitEventHandlers: [],
            loc1: loc1,
            loc2: loc2,
            name: regionName,
        });
    };
    ManagedWorld.prototype.log = function (label, msg) {
        this.logger(label, msg);
    };
    ManagedWorld.prototype.registerPlayerExitRegionEvent = function (regionName, handler, player) {
        this._registerPlayerRegionEvent('exit', regionName, handler, player);
    };
    ManagedWorld.prototype.preventDeadPlayerDrops = function () {
        this.registerEvent('playerDeath', function (event) {
            if (event.entity.type != 'PLAYER') {
                return;
            }
            // Clean-up dropped items
            setTimeout(function () {
                event.entity.getNearbyEntities(1, 1, 1).forEach(function (entity) {
                    if (entity.type == 'DROPPED_ITEM' && entity.name) {
                        entity.remove();
                    }
                });
            }, 1);
        });
    };
    ManagedWorld.prototype.preventBlockBreak = function (except) {
        var _this = this;
        if (except === void 0) { except = []; }
        this.registerEvent('blockBreak', function (event) {
            if (event.block.world.name !== _this.world.name) {
                return;
            }
            var blockType = event.block.type.toString();
            if (except.includes(blockType)) {
                return;
            }
            event.setCancelled(true);
        });
    };
    ManagedWorld.prototype.preventMobSpawning = function (except) {
        var _this = this;
        if (except === void 0) { except = []; }
        this.unregisterEvent('preventMobSpawning');
        this.registerEvent('creatureSpawn', function (event) {
            if (event.entity.world.name !== _this.world.name) {
                return;
            }
            var mobType = event.entity.type.toString();
            if (except.includes(mobType)) {
                return;
            }
            var isMonster = event.entity instanceof
                Java.type('org.bukkit.entity.Monster');
            var otherMonsterTypes = ['SLIME'];
            if (!isMonster &&
                !otherMonsterTypes.includes(event.entity.type.toString())) {
                return;
            }
            // log(`Cancel spawn ${event.entity.type}`);
            event.setCancelled(true);
        }, 'preventMobSpawning');
    };
    ManagedWorld.prototype.setTimeout = function (callback, interval, key) {
        var k = key || tools.uuid();
        this.timers[k] = setTimeout(callback, interval);
    };
    ManagedWorld.prototype.clearTimeout = function (key) {
        clearTimeout(this.timers[key]);
    };
    ManagedWorld.prototype.clearTimeoutsLike = function (wildcard) {
        for (var key in this.timers) {
            if (key.includes(wildcard)) {
                this.clearTimeout(key);
            }
        }
    };
    ManagedWorld.prototype.clearAllTimeouts = function () {
        // tslint:disable-next-line: forin
        for (var key in this.timers) {
            this.clearTimeout(key);
        }
    };
    ManagedWorld.prototype.clearInterval = function (key) {
        clearInterval(this.intervals[key]);
    };
    ManagedWorld.prototype.clearIntervalsLike = function (wildcard) {
        for (var key in this.timers) {
            if (key.includes(wildcard)) {
                this.clearInterval(key);
            }
        }
    };
    ManagedWorld.prototype.clearAllIntervals = function () {
        for (var key in this.intervals) {
            this.clearInterval(key);
        }
    };
    ManagedWorld.prototype.registerEvent = function (type, callback, key) {
        var k = key || tools.uuid();
        this.unregisterEvent(k);
        this.events[k] = events[type](callback);
    };
    ManagedWorld.prototype.spawnEntity = function (location, entityType) {
        this.world.spawnEntity(location, entityType);
    };
    ManagedWorld.prototype.unregisterEvent = function (key) {
        if (this.events[key]) {
            this.events[key].unregister();
        }
    };
    ManagedWorld.prototype.unregisterEventsLike = function (wildcard) {
        for (var key in this.events) {
            if (key.includes(wildcard)) {
                this.unregisterEvent(key);
            }
        }
    };
    ManagedWorld.prototype.unregisterAllEvents = function () {
        for (var key in this.events) {
            this.unregisterEvent(key);
        }
    };
    ManagedWorld.prototype._registerPlayerRegionEvent = function (type, regionName, handler, player) {
        var region;
        this.regions.forEach(function (r) {
            // use forEach as find pollyfill may not be loaded...
            if (r.name === regionName) {
                region = r;
            }
        });
        if (region) {
            if (type === 'enter') {
                region.enterEventHandlers.push({ handler: handler, player: player });
            }
            if (type === 'exit') {
                region.exitEventHandlers.push({ handler: handler, player: player });
            }
        }
    };
    ManagedWorld.prototype._watchPlayersJoinWorld = function () {
        var _this = this;
        this.world.players.forEach(function (player) { return _this._playerJoinedWorld(player); });
        this.registerEvent('playerJoin', function (event) {
            if (event.player.world.name !== _this.world.name) {
                return;
            }
            _this._playerJoinedWorld(event.player);
        });
        this.registerEvent('playerChangedWorld', function (event) {
            if (event.player.world.name !== _this.world.name) {
                return;
            }
            _this._playerJoinedWorld(event.player);
        });
    };
    ManagedWorld.prototype._playerJoinedWorld = function (player) {
        this.log("player " + player.name + " joined world " + this.world.name);
        var worldPlayer = {
            inRegionNames: [],
            moveCount: 0,
            player: player,
        };
        // Ensure clean
        // player.setBedSpawnLocation(this.world.getSpawnLocation())
        this.worldPlayers.push(worldPlayer);
        this._playerMove(worldPlayer); // populate inRegions
        // One or more players in world. Run start.
        if (!this.started) {
            this.start();
        }
    };
    ManagedWorld.prototype._watchPlayersMove = function () {
        var _this = this;
        this.registerEvent('playerMove', function (event) {
            if (event.player.world.name !== _this.world.name) {
                return;
            }
            if (!_this.regions.length) {
                return;
            }
            var worldPlayer = _this.worldPlayers.find(function (p) { return event.player.name === p.player.name; });
            if (!worldPlayer) {
                return;
            }
            worldPlayer.moveCount++;
            if (worldPlayer.moveCount % 3 !== 0) {
                return;
            }
            _this._playerMove(worldPlayer);
        });
    };
    ManagedWorld.prototype._playerMove = function (worldPlayer) {
        var _this = this;
        // this.log('_playerMove')
        var player = worldPlayer.player;
        // check if player exited any regions.
        worldPlayer.inRegionNames.forEach(function (regionName) {
            // this.log('exit check');
            var region = _this.regions.find(function (r) { return r.name === regionName; });
            if (region) {
                if (!_this._regionContainsLocation(region, worldPlayer.player.location)) {
                    // Remove from player.inRegionNames
                    worldPlayer.inRegionNames = worldPlayer.inRegionNames.filter(function (name) { return region.name !== name; });
                    // Log!
                    log(player.name + " exited region " + region.name);
                    // Run handlers
                    region.exitEventHandlers.forEach(function (handle) {
                        if (handle.player &&
                            handle.player.name != player.name) {
                            return;
                        }
                        handle.handler({ player: player });
                    });
                }
            }
        });
        // check if player entered any regions.
        this.regions.forEach(function (region) {
            // this.log(`player ${player.name} enter check for region: ${region.name}`);
            var alreadyInRegion = worldPlayer.inRegionNames.find(function (rnanme) { return rnanme === region.name; });
            if (!alreadyInRegion &&
                _this._regionContainsLocation(region, player.location)) {
                // Add to player.inRegionNames
                worldPlayer.inRegionNames.push(region.name);
                // Log!
                _this.log(player.name + " entered region " + region.name);
                // Run handlers
                region.enterEventHandlers.forEach(function (handle) {
                    if (handle.player && handle.player.name != player.name) {
                        return;
                    }
                    handle.handler({ player: player });
                });
            }
        });
    };
    ManagedWorld.prototype._regionContainsLocation = function (reg, loc) {
        if ((loc.x >= reg.loc1.x && loc.x <= reg.loc2.x) ||
            (loc.x <= reg.loc1.x && loc.x >= reg.loc2.x)) {
            if ((loc.y >= reg.loc1.y && loc.y <= reg.loc2.y) ||
                (loc.y <= reg.loc1.y && loc.y >= reg.loc2.y)) {
                if ((loc.z >= reg.loc1.z && loc.z <= reg.loc2.z) ||
                    (loc.z <= reg.loc1.z && loc.z >= reg.loc2.z)) {
                    return true;
                }
            }
        }
        return false;
    };
    return ManagedWorld;
}());
exports.default = ManagedWorld;
