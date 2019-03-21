"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var entities = require('entities');
var items = require('items');
var Vector = Java.type('org.bukkit.util.Vector');
var log_1 = require("@magikcraft/mct1/log");
var log = log_1.Logger(__filename);
function vexBoss(loc) {
    // const mob = loc.world.spawnEntity(loc, entities['wither_skeleton']());
    var mob = loc.world.spawnEntity(loc, entities['vex']());
    mob.getEquipment().setItemInHand(items['goldSword'](1));
    // behavior loop
    function loop() {
        // Keep looping while mob is alive.
        if (mob.isDead()) {
            return;
        }
        else {
            setTimeout(function () {
                loop();
            }, 5000);
        }
        // Fireball Attack! (when haz target).
        var target = mob.getTarget();
        if (target && target.type == 'PLAYER') {
            var fb = Java.type('org.bukkit.entity.LargeFireball').class;
            var pl = target.location;
            var ml = mob.location;
            var vec = new Vector(pl.x - ml.x, pl.y - ml.y, pl.z - ml.z).normalize();
            mob.launchProjectile(fb, vec);
        }
    }
    loop();
    return mob;
}
exports.vexBoss = vexBoss;
