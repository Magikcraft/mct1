const utils = require('utils');
import { Region } from '@magikcraft/mct1/regions';
import { Vector3 } from '@magikcraft/mct1/vector3';
const Location = Java.type('org.bukkit.Location');
import { Logger } from '@magikcraft/mct1/log'
const log = Logger(__filename)

export const getLocations = (world) => {
    return {
        world: world,
        locations: {
            spawn: new Location(world, 177, 77, -293, -97, -30),
            portalSpawn: new Location(world, 348, 69, -309, 94, 22),
            villageCenter: new Location(world, 219, 84, -306),
            mobSpawnPoints: [
                // new Location(world, 230, 68, -392), // north
                new Location(world, 239, 78, -365), // north

                // new Location(world, 302, 63, -316), // east
                new Location(world, 274, 74, -308), // east

                // new Location(world, 224, 71, -236), // south
                new Location(world, 241, 77, -271), // south

                // new Location(world, 160, 72, -310), // west
                new Location(world, 184, 79, -306), // west
            ],
        },
        regions: {
            lightning: new Region(
                new Vector3(170, 50, -250, world.name),
                new Vector3(300, 100, -400, world.name),
                world.name,
            ),
            wither: new Region(
                new Vector3(200, 100, -280, world.name),
                new Vector3(250, 110, -330, world.name),
                world.name
            ),
            portal: new Region(
                new Vector3(349, 69, -316, world.name),
                new Vector3(351, 86, -303, world.name),
                world.name
            ),
            portalOuter: new Region(
                new Vector3(352, 85, -301, world.name),
                new Vector3(346, 66, -319, world.name),
                world.name
            ),
            portalGround: new Region(
                new Vector3(352, 65, -301, world.name),
                new Vector3(346, 65, -319, world.name),
                world.name
            )
        },

    }
}
