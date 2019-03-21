"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vector3_1 = require("@magikcraft/mct1/vector3");
var utils = require("utils");
var log_1 = require("@magikcraft/mct1/log");
var log = log_1.Logger(__filename);
var Material = Java.type('org.bukkit.Material');
var Effect = Java.type('org.bukkit.Effect');
var Sound = Java.type('org.bukkit.Sound');
var ArenaStairs = /** @class */ (function () {
    function ArenaStairs(region) {
        this.blocks = [];
        this.region = region;
        this.saveRegion();
        this.hideRegion();
        this.replaceRegion();
    }
    ArenaStairs.prototype.saveRegion = function () {
        // Make schematic
        var startLoc = new vector3_1.Vector3(Math.min.apply(Math, this.region.xArray()), Math.min.apply(Math, this.region.yArray()), Math.min.apply(Math, this.region.zArray()));
        var world = utils.world(this.region.getWorld());
        var layer = 0;
        for (var y = startLoc.y; y <= startLoc.y + this.region.yLength(); y++) {
            for (var x = startLoc.x; x <= startLoc.x + this.region.xLength(); x++) {
                for (var z = startLoc.z; z <= startLoc.z + this.region.zLength(); z++) {
                    var block = world.getBlockAt(x, y, z);
                    this.blocks.push({
                        type: block.type,
                        location: block.location,
                        data: block.data,
                    });
                }
            }
        }
    };
    ArenaStairs.prototype.hideRegion = function () {
        var world = utils.world(this.region.getWorld());
        this.blocks.forEach(function (block) {
            var loc = block.location;
            loc.block.setType(Material.AIR);
        });
    };
    ArenaStairs.prototype.replaceRegion = function () {
        var world = utils.world(this.region.getWorld());
        this.blocks.forEach(function (block) {
            var loc = block.location;
            loc.block.setType(block.type);
            loc.block.setData(block.data);
        });
    };
    return ArenaStairs;
}());
exports.default = ArenaStairs;
