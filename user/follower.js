"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events = require("events");
var utils = require("utils");
var Follower = /** @class */ (function () {
    function Follower(user) {
        var _this = this;
        this.eventHandlers = [];
        this.listener = function (event) {
            var isTarget = function (t) { return t.name == _this.following.name; };
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
                _this.user.tell(event.who.name + " quit the server");
                return _this.stopFollowing();
            }
            if (playerQuit && event.who.name == _this.user.player.name) {
                _this._unregisterEventHandlers();
            }
        };
        this.user = user;
    }
    Follower.prototype._registerEventHandlers = function () {
        this.eventHandlers = [
            events.playerChangedWorld(this.listener),
            events.playerRespawn(this.listener),
            events.playerQuit(this.listener)
        ];
    };
    Follower.prototype._unregisterEventHandlers = function () {
        this.eventHandlers.forEach(function (e) { return e.unregister(); });
    };
    Follower.prototype._follow = function () {
        var _this = this;
        this.user.gmc();
        this.user.gmsp();
        this.user.teleport(this.following);
        var TELEPORT_RESETTLE_DELAY = 750;
        setTimeout(function () { return _this.user.player.setSpectatorTarget(_this.following); }, TELEPORT_RESETTLE_DELAY);
    };
    Follower.prototype.startFollowing = function (whoToFollow) {
        var nooneToFollow = (!!whoToFollow || !utils.player(whoToFollow));
        if (nooneToFollow) {
            return;
        }
        this.stopFollowing();
        this.following = whoToFollow;
        this._registerEventHandlers();
        this._follow();
        this.user.tell("Following " + whoToFollow.name);
    };
    Follower.prototype.stopFollowing = function () {
        if (this.following) {
            this._unregisterEventHandlers();
            this.user.gmc();
            this.following = undefined;
            this.user.tell("Follow mode off");
        }
    };
    return Follower;
}());
exports.default = Follower;
