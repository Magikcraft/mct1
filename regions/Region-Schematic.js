"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vector3_1 = require("@magikcraft/mct1/vector3");
var schematic_1 = require("@magikcraft/mct1/regions/schematic");
var worldedit_1 = require("@magikcraft/mct1/regions/worldedit");
var util = require("utils");
var Region_Schematic = /** @class */ (function () {
    function Region_Schematic() {
    }
    /**
     * saveRegion
     * @param region - Selected region to save
     * @return {Schematic} - The generated region information
     *
     * Will export a schematic class based on the region that you have given
     */
    Region_Schematic.saveRegion = function (region) {
        // Make schematic
        var schematic = new schematic_1.Schematic(region);
        var startLoc = new vector3_1.Vector3(Math.min.apply(Math, region.xArray()), Math.min.apply(Math, region.yArray()), Math.min.apply(Math, region.zArray()));
        var world = util.getWorld(schematic.region.getWorld());
        for (var x = startLoc.x; x < startLoc.x + region.xLength(); x++) {
            for (var y = startLoc.y; y < startLoc.y + region.yLength(); y++) {
                for (var z = startLoc.z; z < startLoc.z + region.zLength(); z++) {
                    schematic.addBlock({
                        block: world.getBlockAt(x, y, z),
                        meta: 0,
                        locationRelative: startLoc
                    });
                }
            }
        }
        return schematic;
    };
    /**
     * writeSchematic
     * @param schematic - Given schematic data (blocks, size, etc)
     * @param world - The world to place the schematic in.
     * @param location - Start location to base block placement off
     *
     * Will place a schematic block data, relative to the location vector, on the world given
     */
    Region_Schematic.writeSchematic = function (schematic, world, location, physics) {
        if (physics === void 0) { physics = false; }
        var worldActual = util.getWorld(world);
        schematic.blocks.forEach(function (block) {
            worldedit_1.EditCore.putBlock(block.locationRelative.x + location.x, // x
            block.locationRelative.y + location.y, // y
            block.locationRelative.z + location.z, // z
            block.block, block.meta, worldActual, physics);
        });
    };
    return Region_Schematic;
}());
exports.Region_Schematic = Region_Schematic;
