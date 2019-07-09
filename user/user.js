"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("@magikcraft/mct1/log");
var mct1_1 = require("@magikcraft/mct1/mct1");
var tools = require("@magikcraft/mct1/tools");
var user_1 = require("@magikcraft/mct1/user");
var events = require("events");
var db_1 = require("./db");
var effects_1 = require("./effects");
var follower_1 = require("./follower");
var inventory_1 = require("./inventory");
var log = log_1.Logger(__filename);
var GameMode = Java.type('org.bukkit.GameMode');
// User class
var User = /** @class */ (function () {
    function User(player) {
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
        this.mct1 = new mct1_1.MCT1(player);
        this.db = new db_1.default(player);
        this.inventory = new inventory_1.default(player);
        this.effects = new effects_1.default(player);
        this.setRespawnAtSpawnLocation(true);
        this.setReloadInventoryAtSpawn(true);
        this.follower = new follower_1.default(user_1.user);
        // this.cube =
    }
    User.prototype.cleanse = function () {
        this.unregisterAllEvents();
        this.clearAllTimeouts();
        this.clearAllIntervals();
        this.mct1.stop();
    };
    User.prototype.teleport = function (location) {
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
    User.prototype.setSpawn = function () {
        this.saveSpawn(this.player.location);
    };
    User.prototype.saveSpawn = function (location) {
        this.db.set('spawnLocation', tools.locationToJSON(location));
    };
    User.prototype.loadSpawn = function () {
        if (this.getSpawn()) {
            user_1.user(this.player).teleport(this.getSpawn());
        }
    };
    User.prototype.getSpawn = function () {
        return this.db.get('spawnLocation')
            ? tools.locationFromJSON(this.db.get('spawnLocation'))
            : undefined;
    };
    User.prototype.clearSpawn = function () {
        this.db.delete('spawnLocation');
    };
    User.prototype.setRespawnAtSpawnLocation = function (bool, teleportBetweenWorlds) {
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
    User.prototype.setGodMode = function (bool) {
        var _this = this;
        var key = 'setGodMode';
        if (bool) {
            if (!this.events[key]) {
                this.registerEvent('entityDamage', function (event) {
                    if (event.entity.type != 'PLAYER') {
                        return;
                    }
                    if (event.entity.name !== _this.player.name) {
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
    User.prototype.setReloadInventoryAtSpawn = function (bool) {
        this.inventory.setReloadAtSpawn(bool);
    };
    User.prototype.setTimeout = function (callback, interval, key) {
        var k = key || tools.uuid();
        this.timers[k] = setTimeout(callback, interval);
    };
    User.prototype.clearTimeout = function (key) {
        clearTimeout(this.timers[key]);
    };
    User.prototype.clearTimeoutsLike = function (wildcard) {
        for (var key in this.timers) {
            if (key.includes(wildcard)) {
                this.clearTimeout(key);
            }
        }
    };
    User.prototype.clearAllTimeouts = function () {
        for (var key in this.timers) {
            this.clearTimeout(key);
        }
    };
    User.prototype.clearInterval = function (key) {
        clearInterval(this.intervals[key]);
    };
    User.prototype.clearIntervalsLike = function (wildcard) {
        for (var key in this.timers) {
            if (key.includes(wildcard)) {
                this.clearInterval(key);
            }
        }
    };
    User.prototype.clearAllIntervals = function () {
        for (var key in this.intervals) {
            this.clearInterval(key);
        }
    };
    User.prototype.registerEvent = function (type, callback, key) {
        var k = key || type;
        this.unregisterEvent(k);
        this.events[k] = events[type](callback);
    };
    User.prototype.unregisterEvent = function (key) {
        if (this.events[key]) {
            this.events[key].unregister();
        }
    };
    User.prototype.unregisterEventsLike = function (wildcard) {
        for (var key in this.events) {
            if (key.includes(wildcard)) {
                this.unregisterEvent(key);
            }
        }
    };
    User.prototype.unregisterAllEvents = function () {
        for (var key in this.events) {
            this.unregisterEvent(key);
        }
    };
    User.prototype.follow = function (whoToFollow) {
        this.follower.startFollowing(whoToFollow);
    };
    User.prototype.stopFollowing = function () {
        this.follower.stopFollowing();
    };
    User.prototype.tell = function (msg) {
        echo(this.player, msg);
    };
    return User;
}());
exports.default = User;
