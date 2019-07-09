import { Vector3 } from '../../..//vector3'
import { Region } from '../../../regions'
const Location = Java.type('org.bukkit.Location')

export const getLocations = world => {
    return {
        world,
        waypoints: {
            combolock: {
                region: [
                    new Location(world, 211, 66, 231),
                    new Location(world, 217, 61, 224),
                ],
                saveLocation: new Location(world, 212, 61, 230, -122.7, -5.4),
            },
        },
        locations: {
            spawn: new Location(world, 215, 84, 319, 124, 7),
            // spawn: new Location(world, 215, 55, 144), // end
            journal: new Location(world, 216, 84, 315),
            chest1: new Location(world, 215, 82, 318),
            endChest: new Location(world, 208, 56, 142),
            jailGuard: new Location(world, 209, 83, 315),
            jailBrawl: new Location(world, 207, 83, 331),
            jailGuardLure: new Location(world, 203, 83, 331),
            jailDoor: new Location(world, 210, 83, 313),
        },
        regions: {
            jailHall: [
                new Location(world, 205, 83, 304),
                new Location(world, 209, 87, 324),
            ],
            endPortal: [
                new Location(world, 214, 55, 136),
                new Location(world, 216, 57, 130),
            ],
            endGate: [
                new Location(world, 214, 55, 139),
                new Location(world, 216, 57, 139),
            ],
            rockfall: new Region(
                new Vector3(210, 83, 315, world.name),
                new Vector3(205, 87, 330, world.name),
                world.name
            ),
        },
    }
}
