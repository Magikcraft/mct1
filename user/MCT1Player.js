"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events = require("events");
var log_1 = require("../log");
var mct1_1 = require("../mct1");
var tools = require("../tools");
var db_1 = require("./db");
var effects_1 = require("./effects");
var follower_1 = require("./follower");
var inventory_1 = require("./inventory");
var log = log_1.Logger(__filename);
var GameMode = Java.type('org.bukkit.GameMode');
// User class
var MCT1Player = /** @class */ (function () {
    function MCT1Player(player) {
        var _this = this;
        this.events = {};
        this.gms = function () { return _this.player.setGameMode(GameMode.SURVIVAL); };
        this.gmc = function () { return _this.player.setGameMode(GameMode.CREATIVE); };
        this.gmsp = function () { return _this.player.setGameMode(GameMode.SPECTATOR); };
        this.gma = function () { return _this.player.setGameMode(GameMode.ADVENTURE); };
        this.setInterval = function (callback, interval, key) {
            var k = key || tools.uuid();
            this.intervals[k] = setInterval(callback, interval);
        };
        this.player = player;
        this.sessionId = tools.uuid();
        this.mct1 = new mct1_1.MCT1(this);
        this.db = new db_1.default(player);
        this.inventory = new inventory_1.default(player);
        this.effects = new effects_1.default(player);
        this.setRespawnAtSpawnLocation(true);
        this.setReloadInventoryAtSpawn(true);
        this.follower = new follower_1.default(this);
        this.locale = player.spigot().getLocale();
        // this.cube =
    }
    MCT1Player.prototype.cleanse = function () {
        this.unregisterAllEvents();
        this.clearAllTimeouts();
        this.clearAllIntervals();
        this.mct1.stop();
    };
    MCT1Player.prototype.teleport = function (location) {
        // Player cannot teleport with a passenger. See https://www.spigotmc.org/threads/catch-a-player-teleport-attempt-while-passenger-is-set.95710/
        this.player.eject();
        log("Teleporting " + this.player.name);
        this.player.teleport(location);
    };
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
    MCT1Player.prototype.setSpawn = function () {
        this.saveSpawn(this.player.location);
    };
    MCT1Player.prototype.saveSpawn = function (location) {
        this.db.set('spawnLocation', tools.locationToJSON(location));
    };
    MCT1Player.prototype.loadSpawn = function () {
        if (this.getSpawn()) {
            this.teleport(this.getSpawn());
        }
    };
    MCT1Player.prototype.getSpawn = function () {
        return this.db.get('spawnLocation')
            ? tools.locationFromJSON(this.db.get('spawnLocation'))
            : undefined;
    };
    MCT1Player.prototype.clearSpawn = function () {
        this.db.delete('spawnLocation');
    };
    MCT1Player.prototype.setRespawnAtSpawnLocation = function (bool, teleportBetweenWorlds) {
        var _this = this;
        var key = 'setRespawnAtSpawn';
        if (bool) {
            if (!this.events[key]) {
                this.registerEvent('playerRespawn', function (event) {
                    if (event.player.name !== _this.player.name) {
                        return;
                    }
                    var spawn = _this.getSpawn();
                    if (!spawn) {
                        // return
                        event.setRespawnLocation(_this.player.world.getSpawnLocation());
                    }
                    else {
                        if (!teleportBetweenWorlds &&
                            _this.player.world.name !== spawn.world.name) {
                            return;
                        }
                        event.setRespawnLocation(spawn);
                    }
                }, key);
            }
        }
        else {
            if (this.events[key]) {
                this.unregisterEvent(key);
            }
        }
    };
    MCT1Player.prototype.setGodMode = function (bool) {
        var _this = this;
        var key = 'setGodMode';
        if (bool) {
            if (!this.events[key]) {
                this.registerEvent('entityDamage', function (event) {
                    if (event.entity.type != 'PLAYER' ||
                        event.entity.name !== _this.player.name) {
                        return;
                    }
                    event.setCancelled(true);
                }, key);
            }
        }
        else {
            if (this.events[key]) {
                this.unregisterEvent(key);
            }
        }
    };
    MCT1Player.prototype.startDKA = function (durationSeconds) {
        var _this = this;
        log("Start DKA for " + this.player.name);
        // we will go up to 20 BGL in durationSeconds
        var modifier = 15 / durationSeconds;
        var iterations = 0;
        return new Promise(function (resolve) {
            var doLoop = function () {
                if (iterations < durationSeconds) {
                    _this.mct1.bgl = _this.mct1.bgl + modifier;
                    iterations++;
                    setTimeout(function () { return doLoop(); }, 1000);
                }
                else {
                    resolve();
                }
            };
            doLoop();
        });
    };
    MCT1Player.prototype.setReloadInventoryAtSpawn = function (bool) {
        this.inventory.setReloadAtSpawn(bool);
    };
    MCT1Player.prototype.setTimeout = function (callback, interval, key) {
        var k = key || tools.uuid();
        this.timers[k] = setTimeout(callback, interval);
    };
    MCT1Player.prototype.clearTimeout = function (key) {
        clearTimeout(this.timers[key]);
    };
    MCT1Player.prototype.clearTimeoutsLike = function (wildcard) {
        for (var key in this.timers) {
            if (key.includes(wildcard)) {
                this.clearTimeout(key);
            }
        }
    };
    MCT1Player.prototype.clearAllTimeouts = function () {
        for (var key in this.timers) {
            this.clearTimeout(key);
        }
    };
    MCT1Player.prototype.clearInterval = function (key) {
        clearInterval(this.intervals[key]);
    };
    MCT1Player.prototype.clearIntervalsLike = function (wildcard) {
        for (var key in this.timers) {
            if (key.includes(wildcard)) {
                this.clearInterval(key);
            }
        }
    };
    MCT1Player.prototype.clearAllIntervals = function () {
        for (var key in this.intervals) {
            this.clearInterval(key);
        }
    };
    MCT1Player.prototype.registerEvent = function (type, callback, key) {
        var k = key || type;
        this.unregisterEvent(k);
        this.events[k] = events[type](callback);
    };
    MCT1Player.prototype.unregisterEvent = function (key) {
        if (this.events[key]) {
            this.events[key].unregister();
        }
    };
    MCT1Player.prototype.unregisterEventsLike = function (wildcard) {
        for (var key in this.events) {
            if (key.includes(wildcard)) {
                this.unregisterEvent(key);
            }
        }
    };
    MCT1Player.prototype.unregisterAllEvents = function () {
        for (var key in this.events) {
            this.unregisterEvent(key);
        }
    };
    MCT1Player.prototype.follow = function (whoToFollow) {
        this.follower.startFollowing(whoToFollow);
    };
    MCT1Player.prototype.stopFollowing = function () {
        this.follower.stopFollowing();
    };
    MCT1Player.prototype.tell = function (msg) {
        echo(this.player, msg);
    };
    return MCT1Player;
}());
exports.default = MCT1Player;
