import { Region } from '@magikcraft/mct1/regions'
import { Vector3 } from '@magikcraft/mct1/vector3'
const Location = Java.type('org.bukkit.Location')

export const getLocations = (World: World) => {
    return {
        world: World,
        locations: {
            spawn: new Location(World, 177, 77, -293, -97, -30),
            portalSpawn: new Location(World, 348, 69, -309, 94, 22),
            villageCenter: new Location(World, 219, 84, -306),
            mobSpawnPoints: [
                // new Location(world, 230, 68, -392), // north
                new Location(World, 239, 78, -365), // north

                // new Location(world, 302, 63, -316), // east
                new Location(World, 274, 74, -308), // east

                // new Location(world, 224, 71, -236), // south
                new Location(World, 241, 77, -271), // south

                // new Location(world, 160, 72, -310), // west
                new Location(World, 184, 79, -306), // west
            ],
        },
        regions: {
            lightning: new Region(
                new Vector3(170, 50, -250, World.name),
                new Vector3(300, 100, -400, World.name),
                World.name
            ),
            wither: new Region(
                new Vector3(200, 100, -280, World.name),
                new Vector3(250, 110, -330, World.name),
                World.name
            ),
            portal: new Region(
                new Vector3(349, 69, -316, World.name),
                new Vector3(351, 86, -303, World.name),
                World.name
            ),
            portalOuter: new Region(
                new Vector3(352, 85, -301, World.name),
                new Vector3(346, 66, -319, World.name),
                World.name
            ),
            portalGround: new Region(
                new Vector3(352, 65, -301, World.name),
                new Vector3(346, 65, -319, World.name),
                World.name
            ),
        },
    }
}
