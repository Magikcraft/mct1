const Location = Java.type('org.bukkit.Location')
import { Logger } from '@magikcraft/mct1/log'
const log = Logger(__filename)

export const getLocations = world => {
    return {
        world: world,
        locations: {
            spawn: new Location(world, 220, 44, 356, 159, 3),
            // spawn: new Location(world, 208, 66, 131, 3, -4), // portal
        },
        regions: {
            endPortal: [
                new Location(world, 213, 83, 126),
                new Location(world, 202, 68, 130),
            ],
        },
    }
}
