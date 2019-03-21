import { Vector3 } from "mct1/vector3";
import { Region } from "mct1/regions";
import { Schematic } from "mct1/regions/schematic";
import { EditCore } from "mct1/regions/worldedit";
var util = require('utils')


export class Region_Schematic {

    /**
     * saveRegion
     * @param region - Selected region to save
     * @return {Schematic} - The generated region information
     *
     * Will export a schematic class based on the region that you have given
     */
    static saveRegion(region: Region): Schematic {
        // Make schematic
        const schematic: Schematic = new Schematic(region);
        const startLoc: Vector3 = new Vector3(
            Math.min(...region.xArray()),
            Math.min(...region.yArray()),
            Math.min(...region.zArray())
        )
        const world = util.getWorld(schematic.region.getWorld());
        for (let x = startLoc.x; x < startLoc.x + region.xLength(); x++) {
            for (let y = startLoc.y; y < startLoc.y + region.yLength(); y++) {
                for (let z = startLoc.z; z < startLoc.z + region.zLength(); z++) {
                    schematic.addBlock({
                        block: world.getBlockAt(x, y, z),
                        meta: 0, // CHANGE THIS TO HAVE META DATA COMING FROM THE BLOCK!
                        locationRelative: startLoc
                    });
                }
            }
        }
        return schematic;
    }

    /**
     * writeSchematic
     * @param schematic - Given schematic data (blocks, size, etc)
     * @param world - The world to place the schematic in.
     * @param location - Start location to base block placement off
     *
     * Will place a schematic block data, relative to the location vector, on the world given
     */
    static writeSchematic(schematic: Schematic, world: string, location: Vector3, physics = false) {
        const worldActual = util.getWorld(world);
        schematic.blocks.forEach((block) => {
            EditCore.putBlock(
                block.locationRelative.x + location.x, // x
                block.locationRelative.y + location.y, // y
                block.locationRelative.z + location.z, // z
                block.block,
                block.meta,
                worldActual,
                physics
            );
        });
    }
}

