import { Vector3 } from "@magikcraft/mct1/vector3";
import util = require("utils");

// ------------------------------------------
// THIS FILE IS NOT SUPPOSED TO BE WORLD EDIT
// PLESE FIND THESE FUNCTIONS ELSE WHERE
// SUPPOSED TO BE A FUNCTION FILE FOR EASILY
// EDITING THE WORLD
// ------------------------------------------

export class EditCore {

    static putBlock(x, y, z, blockId, metadata, world, update) {
        if (typeof metadata == 'undefined') {
            metadata = 0;
        }
        var block = world.getBlockAt(x, y, z);
        block.setTypeIdAndData(blockId, metadata, false);
        block.data = metadata;
        return block;
    }

    static getBlock(location: Vector3) {
        return util.getWorld(location.getWorld()).getBlockAt(location.x, location.y, location.z);
    };

}