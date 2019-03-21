"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vector3_1 = require("@magikcraft/mct1/vector3");
var Vector3_WorldUtil_1 = require("@magikcraft/mct1/vector3/Vector3-WorldUtil");
var Mobs = require("@magikcraft/mct1/mobs");
var teleport = require('teleport');
var log_1 = require("@magikcraft/mct1/log");
var log = log_1.Logger(__filename);
var Wither = /** @class */ (function () {
    function Wither(region) {
        this.region = region;
    }
    Wither.prototype.start = function () {
        // Spawn wither
        this.mob = Mobs.spawn('wither', this.region.randomPoint().toLocation());
        this.setTarget();
    };
    Wither.prototype.stop = function () {
        if (this.mob)
            this.mob.remove();
    };
    Wither.prototype.setPhase = function (num) {
        this.phase = num;
    };
    Wither.prototype.setTarget = function () {
        var _this = this;
        var _a = this, region = _a.region, mob = _a.mob, phase = _a.phase;
        switch (phase) {
            case 1: // attack random
                if (this.target)
                    this.target.remove();
                var loc = region.randomPoint();
                this.target = Mobs.spawn('armor_stand', Vector3_WorldUtil_1.Vector3World.GetSunPos(loc).toLocation());
                this.target.setVisible(false);
                mob.setTarget(this.target);
                break;
            case 2:
            default:
                // Hunt players
                var nearbyPlayer_1;
                mob.getNearbyEntities(40, 40, 40).forEach(function (entity) {
                    if (nearbyPlayer_1)
                        return;
                    if (entity.type == 'PLAYER')
                        nearbyPlayer_1 = entity;
                });
                if (nearbyPlayer_1) {
                    log("Make wither hunt nearby player " + nearbyPlayer_1.name + "!");
                    mob.setTarget(nearbyPlayer_1);
                    break; // early return
                }
                // No Players near mob! Look for playerInWorld...
                var playerInWorld_1;
                mob.world.players.forEach(function (player) {
                    if (playerInWorld_1)
                        return;
                    playerInWorld_1 = player;
                });
                if (playerInWorld_1) {
                    // Teleport wither near playerInWorld and attack!
                    log("Make wither teleport to and hunt player " + playerInWorld_1.name + "!");
                    var randPointNearPlayer = vector3_1.Vector3.GetRandomPointAround(vector3_1.Vector3.FromLocation(playerInWorld_1.location), 16).toLocation();
                    teleport(mob, randPointNearPlayer);
                    mob.setTarget(playerInWorld_1);
                }
                break;
        }
        if (!mob.isDead()) {
            setTimeout(function () {
                _this.setTarget();
            }, 5000);
        }
    };
    return Wither;
}());
exports.default = Wither;
