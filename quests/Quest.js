"use strict";
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
var events = require("events");
var log_1 = require("../log");
var tools = require("../tools");
var user_1 = require("../user");
var db_1 = require("./db");
var index_1 = require("./index");
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
        this.mct1Player = user_1.MCT1PlayerCache.getMct1Player(conf.player);
        this.world = conf.world;
        this.db = new db_1.default(this.world.getName());
        this.options = conf.options || {};
        this.log = log_1.Logger("mct1/quests/" + this.name + "--" + this.player.name);
        this.verbose = (conf.options && conf.options.verbose) || false;
    }
    QuestBase.prototype.start = function () {
        this.log('Starting quest');
        this.stop(); // stop and restart, in case already running.
        this.registerEvents();
        this.setupWayPoints();
        this.setupEndPortal();
        // this.doTracking()
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
        // this.mct1Player.db.
        this.log("track quest " + this.world.getName());
        var inventoryJSON = this.mct1Player.inventory.exportToJSON(this.mct1Player.inventory.getAllitemStacks());
        var inventory = inventoryJSON
            .map(function (item, i) { return (item ? __assign({}, item, { slot: i }) : null); })
            .filter(function (item) { return item; });
        var mct1 = this.mct1Player.mct1.isStarted
            ? {
                bgl: this.mct1Player.mct1.bgl,
                digestionQueue: this.mct1Player.mct1.digestionQueue.map(function (item) { return (__assign({}, item)); }),
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
            : false;
        var state = {
            foodLevel: this.player.foodLevel,
            health: this.player.health,
            inventory: inventory,
            isDead: this.player.isDead(),
            location: tools.locationToJSON(this.player.location),
            mct1: mct1,
            player: this.player.name,
            quest: QuestBase.name,
            session: this.mct1Player.sessionId,
            timestamp: new Date(),
            world: this.world.getName(),
        };
        // Log to console.
        var logs = [];
        logs.push("PLAYER: " + this.player.name);
        logs.push("WORLD: " + this.world.getName());
        logs.push("HEALTH: " + this.player.health);
        logs.push("FOOD_LEVEL: " + this.player.foodLevel);
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
        this.log('Stopping quest');
        this.world.killAll('*');
        this.unregisterAllEvents();
        this.clearAllIntervals();
        this.clearAllTimeouts();
    };
    QuestBase.prototype.registerEvents = function () {
        var _this = this;
        // playerChangedWorld
        this.registerEvent('playerChangedWorld', function (event) {
            if (event.player.name == _this.player.name &&
                event.from.name == _this.world.getName()) {
                _this.log('Quest player changed world handler');
                _this.stop();
            }
        });
    };
    QuestBase.prototype.complete = function () {
        this.stop();
        if (this.nextQuestName) {
            index_1.questCommand({
                method: 'start',
                opts: this.options,
                player: this.player,
                questName: this.nextQuestName,
            });
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
        if (this.events[key]) {
            this.events[key].unregister();
        }
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
        if (this.endPortalRegion) {
            var name = 'endPortal';
            this.world.registerRegion(name, this.endPortalRegion[0], this.endPortalRegion[1]);
            this.world.registerPlayerEnterRegionEvent(name, function (event) {
                _this.complete();
            });
        }
    };
    QuestBase.prototype.setupWayPoints = function () {
        var _this = this;
        var waypoints = this.Locs.waypoints;
        if (waypoints) {
            var _loop_1 = function (name) {
                var waypoint = waypoints[name];
                var key = "waypoint-" + name;
                this_1.world.registerRegion(key, waypoint.region[0], waypoint.region[1]);
                this_1.world.registerPlayerEnterRegionEvent(key, function (event) {
                    _this.mct1Player.saveSpawn(waypoint.saveLocation);
                });
            };
            var this_1 = this;
            for (var name in waypoints) {
                _loop_1(name);
            }
        }
    };
    return QuestBase;
}());
exports.QuestBase = QuestBase;
