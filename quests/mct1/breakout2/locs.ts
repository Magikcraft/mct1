const Location = Java.type('org.bukkit.Location')

export const getLocations = world => {
    return {
        locations: {
            spawn: new Location(world, 208, 66, 131, 3, -4),
        },
        regions: {
            endPortal: [
                new Location(world, 213, 83, 126),
                new Location(world, 202, 68, 130),
            ],
        },
        world,
    }
}
