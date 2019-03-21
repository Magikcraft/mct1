"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vector3_1 = require("mct1/vector3");
var regions_1 = require("mct1/regions");
var testRegion = new regions_1.Region(new vector3_1.Vector3(209, 83, 315, 'mct1-jail'), new vector3_1.Vector3(205, 86, 330, 'mct1-jail'));
function testRegionSchematic() {
    var schematic = regions_1.Region_Schematic.saveRegion(testRegion);
    regions_1.Region_Schematic.writeSchematic(schematic, testRegion.getWorld(), new vector3_1.Vector3(100, 100, 100));
}
exports.default = testRegionSchematic;
