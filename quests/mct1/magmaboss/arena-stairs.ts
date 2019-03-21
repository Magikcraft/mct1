import { Vector3 } from "@magikcraft/mct1/vector3";
import { Region } from "@magikcraft/mct1/regions";
import utils = require('utils');

import { Logger } from '@magikcraft/mct1/log'
const log = Logger(__filename)

const Material = Java.type('org.bukkit.Material')
const Effect = Java.type('org.bukkit.Effect')
const Sound = Java.type('org.bukkit.Sound')

export default class ArenaStairs {

    region: Region;
    blocks: any[];

    constructor(region) {
        this.blocks = [];
        this.region = region;
        this.saveRegion();
        this.hideRegion();
        this.replaceRegion();
    }

    saveRegion() {
        // Make schematic
        const startLoc: Vector3 = new Vector3(
            Math.min(...this.region.xArray()),
            Math.min(...this.region.yArray()),
            Math.min(...this.region.zArray())
        )
        const world = utils.world(this.region.getWorld());
        let layer = 0;
        for (let y = startLoc.y; y <= startLoc.y + this.region.yLength(); y++) {
            for (let x = startLoc.x; x <= startLoc.x + this.region.xLength(); x++) {
                for (let z = startLoc.z; z <= startLoc.z + this.region.zLength(); z++) {
                    const block = world.getBlockAt(x, y, z)
                    this.blocks.push({
                        type: block.type,
                        location: block.location,
                        data: block.data,
                    });
                }
            }
        }
    }

    hideRegion() {
        const world = utils.world(this.region.getWorld());
        this.blocks.forEach((block) => {
            const loc = block.location;
            loc.block.setType(Material.AIR)
        });
    }

    replaceRegion() {
        const world = utils.world(this.region.getWorld());
        this.blocks.forEach((block) => {
            const loc = block.location;
            loc.block.setType(block.type)
            loc.block.setData(block.data)
        });
    }
}
