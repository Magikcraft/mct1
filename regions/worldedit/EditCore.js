"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("utils");
// ------------------------------------------
// THIS FILE IS NOT SUPPOSED TO BE WORLD EDIT
// PLESE FIND THESE FUNCTIONS ELSE WHERE
// SUPPOSED TO BE A FUNCTION FILE FOR EASILY
// EDITING THE WORLD
// ------------------------------------------
var EditCore = /** @class */ (function () {
    function EditCore() {
    }
    EditCore.putBlock = function (x, y, z, blockId, metadata, world, update) {
        if (typeof metadata == 'undefined') {
            metadata = 0;
        }
        var block = world.getBlockAt(x, y, z);
        block.setTypeIdAndData(blockId, metadata, false);
        block.data = metadata;
        return block;
    };
    EditCore.getBlock = function (location) {
        return util.getWorld(location.getWorld()).getBlockAt(location.x, location.y, location.z);
    };
    ;
    return EditCore;
}());
exports.EditCore = EditCore;
