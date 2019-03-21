"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vector3_1 = require("@magikcraft/mct1/vector3");
var regions_1 = require("@magikcraft/mct1/regions");
/**
 * @class Schematic
 *
 * Stores all of the block data, names, IDs, locations etc of the saved region
 */
var Schematic = /** @class */ (function () {
    function Schematic(region) {
        // Main storage array
        this.blocks = [];
        // When the blocks will be placed from. Will always be the min point of the region
        this.start = new vector3_1.Vector3(0, 0, 0);
        // Equivilent as to where the player is standing, when copying with world edit
        this.copiedFrom = new vector3_1.Vector3(0, 0, 0);
        // Name of schematic, incase of future ID referencing
        this.name = '';
        // Storage of the region it was copied from, just in case.
        this.region = new regions_1.Region(vector3_1.Vector3.zero, vector3_1.Vector3.zero);
        this.region = region;
    }
    Schematic.prototype.addBlock = function (blockData) {
        this.blocks.push(blockData);
    };
    return Schematic;
}());
exports.Schematic = Schematic;
