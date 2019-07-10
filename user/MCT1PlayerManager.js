"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events = require("events");
var utils = require("utils");
var log_1 = require("../log");
var MCT1Player_1 = require("./MCT1Player");
var log = log_1.Logger(__filename);
var MCT1PlayerManagerClass = /** @class */ (function () {
    function MCT1PlayerManagerClass() {
        var _this = this;
        this.cache = {};
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
                _this.deleteMct1Player(player);
                log("Deleted MCT1 Player for " + player.name);
            }, 100);
        };
        var players = utils.players();
        players.forEach(this.flushMct1Player);
        events.playerQuit(this.onPlayerQuit);
        events.playerJoin(this.onPlayerJoin);
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
            this.cache[player.name] = undefined;
        }
    };
    MCT1PlayerManagerClass.prototype.flushMct1Player = function (player) {
        this.deleteMct1Player(player);
        return this.getMct1Player(player);
    };
    return MCT1PlayerManagerClass;
}());
var MCT1PlayerManager = new MCT1PlayerManagerClass();
exports.default = MCT1PlayerManager;