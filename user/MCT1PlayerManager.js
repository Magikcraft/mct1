"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events = require("events");
var log_1 = require("../log");
var BarManager_1 = require("../mct1/BarManager");
var MCT1Player_1 = require("./MCT1Player");
var log = log_1.Logger(__filename);
var MCT1PlayerManagerClass = /** @class */ (function () {
    function MCT1PlayerManagerClass() {
        var _this = this;
        this.cache = {};
        this.flushMct1Player = function (player) {
            _this.deleteMct1Player(player);
            return _this.getMct1Player(player);
        };
        this.onPlayerJoin = function (_a) {
            var player = _a.player;
            return setTimeout(function () {
                log('playerJoin', player.name);
                _this.flushMct1Player(player);
            }, 100);
        };
        this.onPlayerQuit = function (_a) {
            var player = _a.player;
            return setTimeout(function () {
                log("MCT1PlayerManager player quit handler");
                _this.deleteMct1Player(player);
                log("Deleted MCT1 Player for " + player.name);
                BarManager_1.default.removeBars(player);
            }, 100);
        };
        events.playerQuit(function (event) { return _this.onPlayerQuit(event); });
        events.playerJoin(function (event) { return _this.onPlayerJoin(event); });
    }
    MCT1PlayerManagerClass.prototype.getMct1Player = function (player) {
        if (!player) {
            throw new Error('No Player passed in!');
        }
        if (!this.cache[player.name]) {
            this.cache[player.name] = new MCT1Player_1.default(player);
            log("Created MCT1 Player for " + player.name);
        }
        return this.cache[player.name];
    };
    MCT1PlayerManagerClass.prototype.deleteMct1Player = function (player) {
        if (this.cache[player.name]) {
            this.cache[player.name].cleanse();
            delete this.cache[player.name];
        }
    };
    return MCT1PlayerManagerClass;
}());
var MCT1PlayerManager = new MCT1PlayerManagerClass();
exports.default = MCT1PlayerManager;
