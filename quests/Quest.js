"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var quests_1 = require("@magikcraft/mct1/quests");
var log_1 = require("@magikcraft/mct1/log");
var world_1 = require("@magikcraft/mct1/world");
var user_1 = require("@magikcraft/mct1/user");
var inventories_1 = require("@magikcraft/mct1/quests/mct1/inventories");
var chest_items_1 = require("@magikcraft/mct1/quests/mct1/chest-items");
var tools = require("@magikcraft/mct1/tools");
var events = require("events");
var questTools = require("@magikcraft/mct1/quests/quest-tools");
var db_1 = require("./db");
// import * as http from 'http'
var api = require("@magikcraft/mct1/api");
var QuestBase = /** @class */ (function () {
    function QuestBase(conf) {
        this.state = {};
        /** When set to true, this.debug will print messages to log */
        this.verbose = false;
        this.Locs = {};
        this.inventory = [];
        this.events = {};
        this.intervals = {};
        this.timers = {};
        this.setInterval = function (callback, interval, key) {
            var k = key || tools.uuid();
            this.intervals[k] = setInterval(callback, interval);
        };
        this.name = conf.name;
        this.nextQuestName = conf.nextQuestName;
        this.player = conf.player;
        this.world = conf.world;
        this.db = new db_1.default(this.world.name);
        this.options = conf.options || {};
        this.log = log_1.Logger("mct1/quests/" + this.name + "--" + this.player.name);
        this.verbose = (conf.options && conf.options.verbose) || false;
    }
    QuestBase.prototype.start = function () {
        var _a = this, player = _a.player, world = _a.world;
        this.stop(); // stop and restart, in case already running.
        this.registerEvents();
        this.setupWayPoints();
        this.setupEndPortal();
        this.doTracking();
        world_1.worldly(world).setDestroyWorldIfEmpty(true, 5000);
    };
    QuestBase.prototype.doTracking = function () {
        var _this = this;
        this.setTimeout(function () {
            _this.track();
            _this.setInterval(function () {
                _this.track();
            }, 10000); // track every 10 secs
        }, 2000); // delay first track by 2 secs
    };
    QuestBase.prototype.track = function () {
        var _this = this;
        // user(this.player).db.
        this.log("track quest " + this.world.name);
        var _a = this, player = _a.player, world = _a.world, name = _a.name;
        var inventoryJSON = user_1.user(player).inventory.exportToJSON(user_1.user(player).inventory.getAllitemStacks());
        var inventory = inventoryJSON
            .map(function (item, i) { return (item) ? __assign({}, item, { slot: i }) : null; })
            .filter(function (item) { return item; });
        var mct1 = (user_1.user(player).mct1.isStarted)
            ? {
                bgl: user_1.user(player).mct1.bgl,
                insulin: user_1.user(player).mct1.insulin,
                digestionQueue: user_1.user(player).mct1.digestionQueue
                    .map(function (item) { return (__assign({}, item)); }),
                isStarted: user_1.user(player).mct1.isStarted,
                isUSA: user_1.user(player).mct1.isUSA,
                hasInfiniteInsulin: user_1.user(player).mct1.hasInfiniteInsulin,
                hasLightningSnowballs: user_1.user(player).mct1.hasLightningSnowballs,
                hasSuperJump: user_1.user(player).mct1.hasSuperJump,
                hasSuperSpeed: user_1.user(player).mct1.hasSuperSpeed,
                hasNightVision: user_1.user(player).mct1.hasNightVision,
                isSuperCharged: user_1.user(player).mct1.isSuperCharged,
            }
            : false;
        var state = {
            quest: name,
            player: player.name,
            isDead: player.isDead(),
            world: world.name,
            session: user_1.user(player).sessionId,
            timestamp: new Date(),
            health: player.health,
            foodLevel: player.foodLevel,
            location: tools.locationToJSON(player.location),
            inventory: inventory,
            mct1: mct1,
        };
        // api.post('/minecraft/player/state/track', {state}, (err, res) => {
        // 	if (err) this.log('err', err)
        // 	else this.log('logged player state to DB')
        // })
        // V2 method in the wings
        var payload = {
            player: player.name,
            world: world.name,
            session: user_1.user(player).sessionId,
            payload: JSON.stringify(state)
        };
        api.post('/minecraft/player/state/log', payload, function (err, res) {
            if (err)
                _this.log('err', err);
            else
                _this.log('logged player state to DB');
        });
        // Log to console.
        var logs = [];
        logs.push("PLAYER: " + player.name);
        logs.push("WORLD: " + world.name);
        logs.push("HEALTH: " + player.health);
        logs.push("FOOD_LEVEL: " + player.foodLevel);
        if (mct1) {
            logs.push("BGL: " + mct1.bgl);
            logs.push("INSULIN: " + mct1.insulin);
            var digestionQueue_1 = [];
            mct1.digestionQueue.forEach(function (item) {
                if (item && item.food && item.food.type) {
                    digestionQueue_1.push(item.food.type);
                }
            });
            logs.push("DIGESTION_QUEUE: [" + digestionQueue_1.join(', ') + "]");
        }
        this.log(logs.join(' | '));
    };
    QuestBase.prototype.stop = function () {
        var _a = this, player = _a.player, world = _a.world, options = _a.options;
        // Remove all mobs!
        world.getEntities().forEach(function (e) {
            if (e.type != 'PLAYER') {
                e.remove();
            }
        });
        // __plugin.server.dispatchCommand(__plugin.server.consoleSender, `killall monsters ${world.name}`)
        this.unregisterAllEvents();
        this.clearAllIntervals();
        this.clearAllTimeouts();
    };
    QuestBase.prototype.registerEvents = function () {
        var _this = this;
        var _a = this, player = _a.player, world = _a.world, options = _a.options, log = _a.log;
        // playerChangedWorld
        this.registerEvent('playerChangedWorld', function (event) {
            if (event.player.name == player.name && event.from.name == world.name) {
                _this.stop();
            }
        });
        // playerQuit
        this.registerEvent('playerQuit', function (event) {
            if (event.player.name == player.name) {
                _this.stop();
            }
        });
    };
    QuestBase.prototype.complete = function () {
        var _a = this, player = _a.player, world = _a.world, options = _a.options, nextQuestName = _a.nextQuestName;
        this.stop();
        if (this.nextQuestName) {
            quests_1.questCommand(nextQuestName, 'start', player, options);
        }
    };
    QuestBase.prototype.setTimeout = function (callback, interval, key) {
        var k = key || tools.uuid();
        this.timers[k] = setTimeout(callback, interval);
    };
    QuestBase.prototype.clearTimeout = function (key) {
        clearTimeout(this.timers[key]);
    };
    QuestBase.prototype.clearTimeoutsLike = function (wildcard) {
        for (var key in this.timers) {
            if (key.includes(wildcard)) {
                this.clearTimeout(key);
            }
        }
    };
    QuestBase.prototype.clearAllTimeouts = function () {
        for (var key in this.timers) {
            this.clearTimeout(key);
        }
    };
    QuestBase.prototype.clearInterval = function (key) {
        clearInterval(this.intervals[key]);
    };
    QuestBase.prototype.clearIntervalsLike = function (wildcard) {
        for (var key in this.timers) {
            if (key.includes(wildcard)) {
                this.clearInterval(key);
            }
        }
    };
    QuestBase.prototype.clearAllIntervals = function () {
        for (var key in this.intervals) {
            this.clearInterval(key);
            delete this.intervals[key];
        }
    };
    /**
     * Print debugging messages to the log when this.verbose is true
     * @param msg - The message to log. Can be used for a label.
     * @param toLog - An object or string to log.
     */
    QuestBase.prototype.debug = function (msg, toLog) {
        if (this.verbose) {
            this.log(msg, toLog);
        }
    };
    QuestBase.prototype.registerEvent = function (type, callback, key) {
        var k = key || tools.uuid();
        this.unregisterEvent(k);
        this.events[k] = events[type](callback);
    };
    QuestBase.prototype.unregisterEvent = function (key) {
        if (this.events[key])
            this.events[key].unregister();
    };
    QuestBase.prototype.unregisterEventsLike = function (wildcard) {
        for (var key in this.events) {
            if (key.includes(wildcard)) {
                this.unregisterEvent(key);
            }
        }
    };
    QuestBase.prototype.unregisterAllEvents = function () {
        for (var key in this.events) {
            this.unregisterEvent(key);
            delete this.events[key];
        }
    };
    QuestBase.prototype.setupEndPortal = function () {
        var _this = this;
        var _a = this, player = _a.player, world = _a.world, endPortalRegion = _a.endPortalRegion;
        if (endPortalRegion) {
            var name = 'endPortal';
            world_1.worldly(world).registerRegion(name, endPortalRegion[0], endPortalRegion[1]);
            world_1.worldly(world).registerPlayerEnterRegionEvent(name, function (event) {
                _this.complete();
            });
        }
    };
    QuestBase.prototype.setupWayPoints = function () {
        var _a = this, player = _a.player, world = _a.world, Locs = _a.Locs, log = _a.log;
        var waypoints = Locs.waypoints;
        if (waypoints) {
            var _loop_1 = function (name) {
                var waypoint = waypoints[name];
                var key = "waypoint-" + name;
                world_1.worldly(world).registerRegion(key, waypoint.region[0], waypoint.region[1]);
                world_1.worldly(world).registerPlayerEnterRegionEvent(key, function (event) {
                    user_1.user(player).saveSpawn(waypoint.saveLocation);
                });
            };
            for (var name in waypoints) {
                _loop_1(name);
            }
        }
    };
    return QuestBase;
}());
exports.QuestBase = QuestBase;
// #################### MCT1 Quest #######################
var QuestMCT1 = /** @class */ (function (_super) {
    __extends(QuestMCT1, _super);
    function QuestMCT1(conf) {
        var _this = _super.call(this, conf) || this;
        if (_this.name === 'mct1')
            _this.name = 'mct1-prologue';
        _this.mct1QuestName = _this.name.replace('mct1-', '');
        if (inventories_1.Inventories[_this.mct1QuestName]) {
            _this.inventory = inventories_1.Inventories[_this.mct1QuestName];
        }
        return _this;
    }
    QuestMCT1.prototype.start = function () {
        var _a = this, name = _a.name, player = _a.player, world = _a.world, options = _a.options, log = _a.log, Locs = _a.Locs;
        var locations = Locs.locations, regions = Locs.regions;
        if (chest_items_1.ChestItems[this.mct1QuestName])
            this.endChestContents = chest_items_1.ChestItems[this.mct1QuestName];
        if (locations.endChest)
            this.endChestLocation = locations.endChest;
        if (regions.endGate)
            this.endGateRegion = regions.endGate;
        if (regions.endPortal)
            this.endPortalRegion = regions.endPortal;
        // Do this here ...
        _super.prototype.start.call(this);
        user_1.user(player).teleport(locations.spawn);
        user_1.user(player).saveSpawn(locations.spawn);
        user_1.user(player).setRespawnAtSpawnLocation(true);
        user_1.user(player).gma(); // ADVENTURE!
        user_1.user(player).effects.cancel('LEVITATION'); // Just in case
        if (this.inventory) {
            user_1.user(player).inventory.set(this.inventory);
        }
        user_1.user(player).inventory.saveCurrent();
        user_1.user(player).inventory.setReloadAtSpawn(true);
        this.setMCT1SuperPowers(false);
        user_1.user(player).mct1.start();
        user_1.user(player).mct1.setInfiniteInsulin(true);
        log('setInfiniteInsulin');
        world_1.worldly(world).setNight();
        world_1.worldly(world).setStorm();
        world_1.worldly(world).preventMobSpawning(['HUSK']);
        // worldly(world).setDestroyWorldIfEmpty(true, 3000)
        // setup endchest contents
        if (this.endChestLocation && this.endChestContents) {
            questTools.putItemsInChest(this.endChestLocation, this.endChestContents);
        }
        if (this.nextQuestName) {
            // pre-import world to make quest start more snappy
            // questCommand(this.nextQuestName, 'import', player, options)
        }
    };
    QuestMCT1.prototype.stop = function () {
        _super.prototype.stop.call(this);
    };
    QuestMCT1.prototype.complete = function () {
        _super.prototype.complete.call(this);
    };
    QuestMCT1.prototype.setMCT1SuperPowers = function (bool) {
        var player = this.player;
        if (bool) {
            user_1.user(player).mct1.setSuperCharged(false);
            user_1.user(player).mct1.setInfiniteSnowballs(true);
            user_1.user(player).mct1.setSuperJump(true);
            user_1.user(player).mct1.setSuperSpeed(true);
            user_1.user(player).mct1.setNightVision(false);
            // user(player).mct1.start()
        }
        else {
            user_1.user(player).mct1.setSuperCharged(false);
            user_1.user(player).mct1.setInfiniteSnowballs(false);
            user_1.user(player).mct1.setSuperJump(false);
            user_1.user(player).mct1.setSuperSpeed(false);
            user_1.user(player).mct1.setNightVision(false);
            // user(player).mct1.start()
        }
    };
    QuestMCT1.prototype.openEndGate = function () {
        var _a = this, player = _a.player, world = _a.world, options = _a.options, log = _a.log, nextQuestName = _a.nextQuestName;
        // if (this.nextQuestName) {
        // 	// pre-import world to make quest start more snappy
        // 	questCommand(nextQuestName, 'import', player, options)
        // }
        if (this.endGateRegion) {
            // End gate effect
            var reg_1 = this.endGateRegion;
            questTools.replaceRegion(reg_1[0], reg_1[1], 'AIR');
            questTools.playEffectInRegion(reg_1[0], reg_1[1], 'DRAGON_BREATH');
            this.setInterval(function () {
                questTools.playEffectInRegion(reg_1[0], reg_1[1], 'PORTAL');
            }, 500);
        }
    };
    QuestMCT1.prototype.registerEvents = function () {
        var _this = this;
        _super.prototype.registerEvents.call(this);
        var _a = this, player = _a.player, world = _a.world, options = _a.options, log = _a.log, nextQuestName = _a.nextQuestName;
        if (this.endChestLocation) {
            // inventoryClose
            this.registerEvent('inventoryClose', function (event) {
                if (event.player.name != player.name)
                    return;
                if (event.inventory.type != 'CHEST')
                    return;
                // end chest close...
                var cLoc = event.inventory.location;
                var ecLoc = _this.endChestLocation;
                if (cLoc.x === ecLoc.x && cLoc.y === ecLoc.y && cLoc.z === ecLoc.z) {
                    _this.openEndGate();
                }
            });
        }
    };
    return QuestMCT1;
}(QuestBase));
exports.QuestMCT1 = QuestMCT1;
