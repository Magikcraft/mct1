"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vector3_1 = require("@magikcraft/mct1/vector3");
var utils = require('utils');
var log_1 = require("@magikcraft/mct1/log");
var log = log_1.Logger(__filename);
var Material = Java.type('org.bukkit.Material');
var Effect = Java.type('org.bukkit.Effect');
var Sound = Java.type('org.bukkit.Sound');
var Rockfall = /** @class */ (function () {
    function Rockfall(region) {
        this.blocks = [];
        this.region = region;
        this.upperY =
            this.region.vectorA.y > this.region.vectorB.y
                ? this.region.vectorA.y
                : this.region.vectorB.y;
        this.saveRegion();
        this.replaceRegion();
    }
    Rockfall.prototype.saveRegion = function () {
        // Make schematic
        var startLoc = new vector3_1.Vector3(Math.min.apply(Math, this.region.xArray()), Math.min.apply(Math, this.region.yArray()), Math.min.apply(Math, this.region.zArray()));
        var world = utils.world(this.region.getWorld());
        var layer = 0;
        for (var y = startLoc.y; y < startLoc.y + this.region.yLength(); y++) {
            layer++;
            for (var x = startLoc.x; x < startLoc.x + this.region.xLength(); x++) {
                for (var z = startLoc.z; z < startLoc.z + this.region.zLength(); z++) {
                    var block = world.getBlockAt(x, y, z);
                    this.blocks.push({
                        layer: layer,
                        type: block.type,
                        location: block.location,
                        data: block.data,
                    });
                }
            }
        }
    };
    Rockfall.prototype.replaceRegion = function () {
        var startLoc = new vector3_1.Vector3(Math.min.apply(Math, this.region.xArray()), Math.min.apply(Math, this.region.yArray()), Math.min.apply(Math, this.region.zArray()));
        var world = utils.world(this.region.getWorld());
        for (var y = startLoc.y; y < startLoc.y + this.region.yLength(); y++) {
            for (var x = startLoc.x; x < startLoc.x + this.region.xLength(); x++) {
                for (var z = startLoc.z; z < startLoc.z + this.region.zLength(); z++) {
                    world.getBlockAt(x, y, z).setType(Material.AIR);
                }
            }
        }
    };
    Rockfall.prototype.doRockfall = function () {
        var _this = this;
        var world = utils.world(this.region.getWorld());
        var soundIndex = 0;
        var sounds = [
            Sound.BLOCK_GRAVEL_FALL,
            undefined,
            // undefined, undefined,
            Sound.BLOCK_SAND_FALL,
            undefined,
            // undefined, undefined,
            Sound.ENTITY_DRAGON_FIREBALL_EXPLODE,
            undefined,
        ];
        var interval = 0;
        this.blocks.forEach(function (block) {
            interval = Math.floor(Math.random() * 100) * 5 + block.layer * 500;
            var sound = sounds[soundIndex];
            soundIndex++;
            if (soundIndex === sounds.length)
                soundIndex = 0;
            setTimeout(function () {
                var loc = block.location;
                var dropLoc = loc;
                dropLoc.setY(_this.upperY - 1);
                dropLoc.setX(loc.x + 0.5);
                dropLoc.setZ(loc.z + 0.5);
                world.spawnFallingBlock(dropLoc, block.type, block.data);
                loc.world.playEffect(loc, Effect.WITHER_BREAK_BLOCK, 100);
                if (sound)
                    loc.world.playSound(loc, sound, 5, 1);
                // BLOCK_STONE_FALL
                // world.createExplosion(loc.x, loc.y, loc.z, 1, false, false);
            }, interval);
        });
        // After rockfall is complete...
        setTimeout(function () {
            world.entities.forEach(function (entity) {
                if (entity.type == 'DROPPED_ITEM') {
                    entity.remove();
                }
            });
            log('rockfall complete!');
        }, interval + 1000);
    };
    return Rockfall;
}());
exports.default = Rockfall;
