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
var utils = require("utils");
var log_1 = require("../log");
var fs = require("../utils/fs");
var server_1 = require("./../utils/server");
var log = log_1.Logger(__filename);
var server = __plugin.server;
var MultiverseInterface = /** @class */ (function () {
    function MultiverseInterface() {
        this.multiversePlugin = server
            .getPluginManager()
            .getPlugin('Multiverse-Core');
        if (!this.multiversePlugin) {
            throw new Error('Multiverse-Core plugin not found! Is it installed on this server?');
        }
        this.worldmanager = this.multiversePlugin.getMVWorldManager();
    }
    MultiverseInterface.prototype.destroyWorld = function (name) {
        log("Time I Am, Destroyer of Worlds: destroying " + name);
        if (this.worldmanager.getMVWorld(name)) {
            this.worldmanager.deleteWorld(name, true, true);
        }
        if (this.worldExistsOnDisk(name)) {
            fs.remove(this.getWorldPath(name));
        }
        else {
            setTimeout(function () { return log('Oh yeah, it was deleted.'); }, 5000);
        }
    };
    MultiverseInterface.prototype.importWorld = function (worldName) {
        log('Checking if world already imported', worldName);
        var worldAlreadyImported = this.worldmanager.getMVWorld(worldName);
        if (worldAlreadyImported) {
            return utils.world(worldName);
        }
        if (!this.worldExistsOnDisk(worldName)) {
            throw new Error("Cannot import world " + worldName + ": file not found");
        }
        server_1.executeCommand("mv import " + worldName + " normal");
        return utils.world(worldName);
    };
    MultiverseInterface.prototype.cloneWorld = function (worldName, templateWorldName) {
        return __awaiter(this, void 0, void 0, function () {
            var imported, cloned, world;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.destroyWorld(worldName)];
                    case 1:
                        _a.sent();
                        log("Cloning " + worldName);
                        imported = this.importWorld(templateWorldName);
                        if (!imported) {
                            log("Cannot clone " + worldName + ". " + templateWorldName + " not found.");
                            return [2 /*return*/];
                        }
                        cloned = this.multiversePlugin.cloneWorld(templateWorldName, worldName, 'normal');
                        if (!cloned) {
                            log("Failed to clone world " + templateWorldName);
                            return [2 /*return*/];
                        }
                        world = utils.world(worldName);
                        log("World clone complete for " + worldName);
                        return [2 /*return*/, new Promise(function (resolve) { return setTimeout(function () { return resolve(world); }, 1); })];
                }
            });
        });
    };
    MultiverseInterface.prototype.worldExistsOnDisk = function (worldName) {
        var path = this.getWorldPath(worldName);
        return fs.exists(path);
    };
    MultiverseInterface.prototype.getWorldPath = function (worldName) {
        var worldDir = server.getWorldContainer();
        var path = "./" + worldDir + "/" + worldName;
        return path;
    };
    return MultiverseInterface;
}());
exports.multiverse = new MultiverseInterface();
