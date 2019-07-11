"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var events = require("events");
var utils = require("utils");
var log_1 = require("../log");
var ManagedWorld_1 = require("./ManagedWorld");
var multiverse_1 = require("./multiverse");
var log = log_1.Logger(__filename);
/**
 * The World Manager is responsible for loading and unloading worlds.
 * It creates ManagedWorlds - cloned worlds with additional helper methods for
 * use by quests.
 * Worlds are deleted when a player leaves the world, or when they leave the server.
 *
 * Multiplayer worlds are not fully implemented yet. The focus is on
 * centralising the logic around the single-player worlds that we currently
 * use. The motivation for this refactor was a bug in the previous implementation
 * that caused OOM errors over time by not deleting worlds when players quit the
 * server. With the previous division of responsibility it was not clear
 * where to implement the fix.
 *
 */
// We use this to detect worlds that should be managed when reloading the code
var managedPrefix = '_m_';
// We use this to know which player a world is for
var playerPrefix = '--player:';
var isManagedWorld = function (w) { return w.name.startsWith(managedPrefix); };
var isPlayerWorld = function (w) { return w.name.includes(playerPrefix); };
var playernameFromWorld = function (w) { return w.name.split(playerPrefix)[1]; };
var WorldManagerClass = /** @class */ (function () {
    function WorldManagerClass() {
        var _this = this;
        this.managedWorlds = {};
        this.listeners = {};
        // This handler destroys all player-specific worlds when a player quits the server.
        // Prevents the memory leak that has been crashing the server.
        events.playerQuit(function (_a) {
            var player = _a.player;
            log("WorldManager player quit server handler");
            _this.deleteWorldsForPlayer(player.name);
        });
        this.rebuildManagementState();
        this.cullWorldsForAbsentPlayers();
    }
    /**
     * Create a managed world for a specific player, or a multiplayer world
     * @param templateWorldname The template world to clone from
     * @param playername The name of the player to create the world for. Pass in undefined for a multiplayer world
     */
    WorldManagerClass.prototype.createManagedWorld = function (templateWorldname, playername) {
        return __awaiter(this, void 0, void 0, function () {
            var managedWorldName, managedWorld, worldAlreadyUnderManagement, unmanagedWorld, unmanagedWorldAlreadyExists, newWorld, world;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        managedWorldName = playername
                            ? managedPrefix + "-" + templateWorldname + playerPrefix + playername
                            : managedPrefix + "-" + templateWorldname + "-multi";
                        log('managedWorldName', managedWorldName); // @DEBUG
                        managedWorld = this.getWorldByWorldName(managedWorldName);
                        worldAlreadyUnderManagement = !!managedWorld;
                        if (worldAlreadyUnderManagement) {
                            log('Case 0'); // @DEBUG
                            return [2 /*return*/, managedWorld];
                        }
                        unmanagedWorld = utils.world(managedWorldName);
                        unmanagedWorldAlreadyExists = !!unmanagedWorld;
                        if (unmanagedWorldAlreadyExists) {
                            log('Case 1'); // @DEBUG
                            return [2 /*return*/, this.manageExistingWorld(unmanagedWorld)];
                        }
                        // Case 2: World does not exist yet.
                        log('Case 2'); // @DEBUG
                        return [4 /*yield*/, multiverse_1.Multiverse.cloneWorld({
                                targetWorldname: managedWorldName,
                                templateWorldname: templateWorldname,
                            })];
                    case 1:
                        newWorld = _a.sent();
                        if (!newWorld) {
                            log("Failed to setup world " + managedWorldName + ". Aborting.");
                            return [2 /*return*/, undefined];
                        }
                        log("Quest world " + managedWorldName + " intialized.");
                        this.manageExistingWorld(newWorld);
                        world = this.getWorldByWorldName(managedWorldName);
                        log(world.getBukkitWorld());
                        return [2 /*return*/, world];
                }
            });
        });
    };
    /**
     * @param world The world to delete
     */
    WorldManagerClass.prototype.deleteWorld = function (worldname) {
        var managedWorld = this.getWorldByWorldName(worldname);
        if (managedWorld) {
            managedWorld.destroy();
            this.unregisterPlayerLeftWorldListener(worldname);
            multiverse_1.Multiverse.destroyWorld(worldname);
            // Remove the world from the in-memory state
            delete this.managedWorlds[worldname];
        }
    };
    WorldManagerClass.prototype.deleteWorldsForPlayer = function (playername) {
        var _this = this;
        log("Deleting worlds for " + playername);
        this.getWorldsForPlayer(playername).forEach(function (worldname) {
            return _this.deleteWorld(worldname);
        });
    };
    WorldManagerClass.prototype.getWorldsForPlayer = function (playername) {
        var _this = this;
        return Object.keys(this.managedWorlds).filter(function (n) {
            return _this.managedWorlds[n] &&
                _this.managedWorlds[n].playername == playername;
        });
    };
    WorldManagerClass.prototype.getWorldByWorldName = function (name) {
        log("Retrieving " + name + "...");
        return this.managedWorlds[name];
    };
    /**
     * Bring all existing worlds under management. This is used to rebuild the in-memory state of the WorldManager when it has been reloaded.
     */
    WorldManagerClass.prototype.rebuildManagementState = function () {
        var _this = this;
        utils
            .worlds()
            .filter(isManagedWorld)
            .forEach(function (w) { return _this.manageExistingWorld(w); });
        log("Worlds under management: " + Object.keys(this.managedWorlds));
    };
    WorldManagerClass.prototype.manageExistingWorld = function (world) {
        var worldname = world.name;
        var playername = isPlayerWorld
            ? worldname.split(playerPrefix)[1]
            : undefined;
        var newlyManagedWorld = new ManagedWorld_1.default(world, playername);
        this.registerPlayerLeftWorldListener(worldname, playername);
        this.managedWorlds[worldname] = newlyManagedWorld;
        log("Managed Worlds: " + Object.keys(this.managedWorlds));
        return newlyManagedWorld;
    };
    /**
     * Delete worlds for players who are not on the server.
     * Called when the code loads up.
     */
    WorldManagerClass.prototype.cullWorldsForAbsentPlayers = function () {
        var _this = this;
        utils
            .worlds()
            .filter(isPlayerWorld)
            .forEach(function (w) {
            var playername = playernameFromWorld(w);
            var playerIsOnline = !!utils.player(playername);
            if (!playerIsOnline) {
                _this.deleteWorldsForPlayer(playername);
            }
        });
    };
    WorldManagerClass.prototype.registerPlayerLeftWorldListener = function (worldname, playername) {
        var _this = this;
        var isMultiplayerWorld = playername === undefined;
        if (isMultiplayerWorld) {
            return;
        }
        this.unregisterPlayerLeftWorldListener(worldname);
        this.listeners[worldname] = events.playerChangedWorld(function (event) {
            var isThisWorld = event.from.name == worldname && event.player.name == playername;
            if (isThisWorld) {
                log("WorldManager player quit world handler");
                setTimeout(function () { return _this.deleteWorld(worldname); }, 3000);
            }
        });
    };
    WorldManagerClass.prototype.unregisterPlayerLeftWorldListener = function (worldname) {
        if (this.listeners[worldname]) {
            this.listeners[worldname].unregister();
        }
    };
    return WorldManagerClass;
}());
exports.default = new WorldManagerClass();
