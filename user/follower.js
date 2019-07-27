"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events = require("events");
var utils = require("utils");
var Follower = /** @class */ (function () {
    function Follower(mct1Player) {
        var _this = this;
        this.eventHandlers = [];
        this.listener = function (event) {
            var isTarget = function (t) { return _this.following && t.name == _this.following.name; };
            var playerChangedWorld = !!event.player; // playerChangedWorld has a player field
            if (playerChangedWorld && isTarget(event.player)) {
                return _this._follow();
            }
            var playerRespawned = !!event.respawnPlayer; // playerRespawn has an respawnPlayer field
            if (playerRespawned && isTarget(event.respawnPlayer)) {
                return _this._follow();
            }
            var playerQuit = !!event.who; // playerQuit has a who field,
            if (playerQuit && isTarget(event.who)) {
                _this.mct1Player.tell(event.who.name + " quit the server");
                return _this.stopFollowing();
            }
            if (playerQuit && event.who.name == _this.mct1Player.player.name) {
                _this._unregisterEventHandlers();
            }
        };
        this.mct1Player = mct1Player;
    }
    Follower.prototype.startFollowing = function (whoToFollow) {
        var nooneToFollow = !!whoToFollow || !utils.player(whoToFollow);
        if (nooneToFollow) {
            return;
        }
        this.stopFollowing();
        this.following = whoToFollow;
        this._registerEventHandlers();
        this._follow();
        this.mct1Player.tell("Following " + whoToFollow.name);
    };
    Follower.prototype.stopFollowing = function () {
        if (this.following) {
            this._unregisterEventHandlers();
            this.mct1Player.gmc();
            this.following = undefined;
            this.mct1Player.tell("Follow mode off");
        }
    };
    Follower.prototype._registerEventHandlers = function () {
        this.eventHandlers = [
            events.playerChangedWorld(this.listener),
            events.playerRespawn(this.listener),
            events.playerQuit(this.listener),
        ];
    };
    Follower.prototype._unregisterEventHandlers = function () {
        this.eventHandlers.forEach(function (e) { return e.unregister(); });
    };
    Follower.prototype._follow = function () {
        var _this = this;
        this.mct1Player.gmc();
        this.mct1Player.gmsp();
        this.mct1Player.teleport(this.following);
        var TELEPORT_RESETTLE_DELAY = 750;
        setTimeout(function () {
            return _this.mct1Player.player.setSpectatorTarget(_this
                .following);
        }, TELEPORT_RESETTLE_DELAY);
    };
    return Follower;
}());
exports.default = Follower;
