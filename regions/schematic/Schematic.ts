import { Vector3 } from "mct1/vector3";
import { Region } from "mct1/regions";

/**
 * @interface BlockData
 *
 * This is a helper to correctly marshal the data needed to correctly store a block position
 */
export interface BlockData {
    block: any;
    meta: any;
    locationRelative: Vector3;
}

/**
 * @class Schematic
 *
 * Stores all of the block data, names, IDs, locations etc of the saved region
*/
export class Schematic {

    // Main storage array
    blocks: BlockData[] = [];
    // When the blocks will be placed from. Will always be the min point of the region
    start: Vector3 = new Vector3(0, 0, 0);
    // Equivilent as to where the player is standing, when copying with world edit
    copiedFrom: Vector3 = new Vector3(0, 0, 0);
    // Name of schematic, incase of future ID referencing
    name: String = '';
    // Storage of the region it was copied from, just in case.
    region: Region = new Region(Vector3.zero, Vector3.zero);

    constructor(region: Region) {
        this.region = region;
    }

    addBlock(blockData: BlockData) {
        this.blocks.push(blockData);
    }
}