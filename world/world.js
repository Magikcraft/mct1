"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events = require("events");
var log_1 = require("mct1/log");
var tools = require("mct1/tools");
var index_1 = require("mct1/world/index");
var server = require("mct1/utils/server");
var Biome = Java.type('org.bukkit.block.Biome');
var log = log_1.Logger("" + [__dirname, __filename].join('/'));
// User class
var World = /** @class */ (function () {
    function World(world) {
        var _this = this;
        this.started = false;
        this.regions = [];
        this.worldPlayers = [];
        this.events = {};
        this.intervals = {};
        this.timers = {};
        this.destroyWorldIfEmpty = false;
        this.destroyWorldIfEmptyDelay = 3000;
        this.setTime = function (time) { return server.executeCommand("time " + time + " " + _this.world.name); };
        this.setDawn = function () { return server.executeCommand("time dawn " + _this.world.name); };
        this.setDay = function () { return server.executeCommand("time day " + _this.world.name); };
        this.setDusk = function () { return server.executeCommand("time dusk " + _this.world.name); };
        this.setNight = function () { return server.executeCommand("time night " + _this.world.name); };
        this.setSun = function () { return server.executeCommand("weather " + _this.world.name + " sun"); };
        this.setStorm = function () { return server.executeCommand("weather " + _this.world.name + " storm"); };
        this.setRain = function () { return server.executeCommand("weather " + _this.world.name + " rain"); };
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
        this.logger = log_1.Logger("world--" + this.world.name);
        this._watchPlayersJoinWorld();
    }
    World.prototype.start = function () {
        this._watchPlayersMove();
        this._watchPlayersLeaveWorld();
        this.started = true;
    };
    World.prototype.stop = function () {
        this.unregisterAllEvents();
        this.clearAllTimeouts();
        this.clearAllIntervals();
        // Restart watcher
        this._watchPlayersJoinWorld();
        this.started = false;
    };
    World.prototype.cleanse = function () {
        this.unregisterAllEvents();
        this.clearAllTimeouts();
        this.clearAllIntervals();
    };
    World.prototype.setChunkBiome = function (loc, biome) {
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
    World.prototype.registerRegion = function (regionName, loc1, loc2) {
        this.regions.push({
            name: regionName,
            loc1: loc1,
            loc2: loc2,
            enterEventHandlers: [],
            exitEventHandlers: [],
        });
    };
    World.prototype.log = function (label, log) {
        this.logger(label, log);
    };
    World.prototype.registerPlayerExitRegionEvent = function (regionName, handler, player) {
        this._registerPlayerRegionEvent('exit', regionName, handler, player);
    };
    World.prototype.preventDeadPlayerDrops = function () {
        this.registerEvent('playerDeath', function (event) {
            if (event.entity.type != 'PLAYER')
                return;
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
    World.prototype.preventBlockBreak = function (except) {
        var _this = this;
        if (except === void 0) { except = []; }
        this.registerEvent('blockBreak', function (event) {
            if (event.block.world.name !== _this.world.name)
                return;
            var blockType = event.block.type.toString();
            if (except.includes(blockType))
                return;
            event.setCancelled(true);
        });
    };
    World.prototype.preventMobSpawning = function (except) {
        var _this = this;
        if (except === void 0) { except = []; }
        this.unregisterEvent('preventMobSpawning');
        this.registerEvent('creatureSpawn', function (event) {
            if (event.entity.world.name !== _this.world.name)
                return;
            var mobType = event.entity.type.toString();
            if (except.includes(mobType))
                return;
            var isMonster = (event.entity instanceof Java.type('org.bukkit.entity.Monster'));
            if (!isMonster)
                return;
            event.setCancelled(true);
        }, 'preventMobSpawning');
    };
    World.prototype.setDestroyWorldIfEmpty = function (bool, delay) {
        this.destroyWorldIfEmpty = bool;
        if (delay) {
            this.destroyWorldIfEmptyDelay = delay;
        }
    };
    World.prototype.setTimeout = function (callback, interval, key) {
        var k = key || tools.uuid();
        this.timers[k] = setTimeout(callback, interval);
    };
    World.prototype.clearTimeout = function (key) {
        clearTimeout(this.timers[key]);
    };
    World.prototype.clearTimeoutsLike = function (wildcard) {
        for (var key in this.timers) {
            if (key.includes(wildcard)) {
                this.clearTimeout(key);
            }
        }
    };
    World.prototype.clearAllTimeouts = function () {
        for (var key in this.timers) {
            this.clearTimeout(key);
        }
    };
    World.prototype.clearInterval = function (key) {
        clearInterval(this.intervals[key]);
    };
    World.prototype.clearIntervalsLike = function (wildcard) {
        for (var key in this.timers) {
            if (key.includes(wildcard)) {
                this.clearInterval(key);
            }
        }
    };
    World.prototype.clearAllIntervals = function () {
        for (var key in this.intervals) {
            this.clearInterval(key);
        }
    };
    World.prototype.registerEvent = function (type, callback, key) {
        var k = key || tools.uuid();
        this.unregisterEvent(k);
        this.events[k] = events[type](callback);
    };
    World.prototype.unregisterEvent = function (key) {
        if (this.events[key])
            this.events[key].unregister();
    };
    World.prototype.unregisterEventsLike = function (wildcard) {
        for (var key in this.events) {
            if (key.includes(wildcard)) {
                this.unregisterEvent(key);
            }
        }
    };
    World.prototype.unregisterAllEvents = function () {
        for (var key in this.events) {
            this.unregisterEvent(key);
        }
    };
    World.prototype._registerPlayerRegionEvent = function (type, regionName, handler, player) {
        var region;
        this.regions.forEach(function (r) {
            if (r.name === regionName)
                region = r;
        });
        if (region) {
            if (type === 'enter')
                region.enterEventHandlers.push({ handler: handler, player: player });
            if (type === 'exit')
                region.exitEventHandlers.push({ handler: handler, player: player });
        }
    };
    World.prototype._watchPlayersJoinWorld = function () {
        var _this = this;
        this.world.players.forEach(function (player) { return _this._playerJoinedWorld(player); });
        this.registerEvent('playerJoin', function (event) {
            if (event.player.world.name !== _this.world.name)
                return;
            _this._playerJoinedWorld(event.player);
        });
        this.registerEvent('playerChangedWorld', function (event) {
            if (event.player.world.name !== _this.world.name)
                return;
            _this._playerJoinedWorld(event.player);
        });
    };
    World.prototype._playerJoinedWorld = function (player) {
        this.log("player " + player.name + " joined world " + this.world.name);
        var worldPlayer = {
            player: player,
            moveCount: 0,
            inRegionNames: [],
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
    World.prototype._watchPlayersLeaveWorld = function () {
        var _this = this;
        this.registerEvent('playerChangedWorld', function (event) {
            if (event.from.name !== _this.world.name)
                return;
            _this._playerLeftWorld(event.player);
        });
    };
    World.prototype._playerLeftWorld = function (player) {
        var _this = this;
        this.log("player " + player.name + " left world " + this.world.name);
        this.worldPlayers = this.worldPlayers.filter(function (wp) { return wp.player.name != player.name; });
        // If no players are left in world. Run stop.
        if (!this.worldPlayers.length) {
            this.stop();
            if (this.destroyWorldIfEmpty) {
                this.setTimeout(function () {
                    if (!_this.worldPlayers.length) {
                        index_1.worldDelete(_this.world);
                        server.executeCommand("mv delete " + _this.world.name);
                        server.executeCommand("mvconfirm");
                    }
                }, this.destroyWorldIfEmptyDelay);
            }
        }
    };
    World.prototype._watchPlayersMove = function () {
        var _this = this;
        this.registerEvent('playerMove', function (event) {
            if (event.player.world.name !== _this.world.name)
                return;
            if (!_this.regions.length)
                return;
            var worldPlayer = _this.worldPlayers.find(function (p) { return event.player.name === p.player.name; });
            if (!worldPlayer)
                return;
            worldPlayer.moveCount++;
            if (worldPlayer.moveCount % 3 !== 0)
                return;
            _this._playerMove(worldPlayer);
        });
    };
    World.prototype._playerMove = function (worldPlayer) {
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
                        if (handle.player && handle.player.name != player.name)
                            return;
                        handle.handler({ player: player });
                    });
                }
            }
        });
        // check if player entered any regions.
        this.regions.forEach(function (region) {
            // this.log(`player ${player.name} enter check for region: ${region.name}`);
            var alreadyInRegion = worldPlayer.inRegionNames.find(function (rnanme) { return rnanme === region.name; });
            if (!alreadyInRegion && _this._regionContainsLocation(region, player.location)) {
                // Add to player.inRegionNames
                worldPlayer.inRegionNames.push(region.name);
                // Log!
                _this.log(player.name + " entered region " + region.name);
                // Run handlers
                region.enterEventHandlers.forEach(function (handle) {
                    if (handle.player && handle.player.name != player.name)
                        return;
                    handle.handler({ player: player });
                });
            }
        });
    };
    World.prototype._regionContainsLocation = function (reg, loc) {
        if ((loc.x >= reg.loc1.x && loc.x <= reg.loc2.x) || (loc.x <= reg.loc1.x && loc.x >= reg.loc2.x)) {
            if ((loc.y >= reg.loc1.y && loc.y <= reg.loc2.y) || (loc.y <= reg.loc1.y && loc.y >= reg.loc2.y)) {
                if ((loc.z >= reg.loc1.z && loc.z <= reg.loc2.z) || (loc.z <= reg.loc1.z && loc.z >= reg.loc2.z)) {
                    return true;
                }
            }
        }
        return false;
    };
    return World;
}());
exports.default = World;
