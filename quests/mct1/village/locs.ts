const Location = Java.type('org.bukkit.Location')

export const getLocations = world => {
    return {
        world: world,
        locations: {
            spawn: new Location(world, 348, 69, -309, 94, 22),
        },
        regions: {
            endPortal: [
                new Location(world, 349, 69, -316),
                new Location(world, 351, 86, -303),
            ],
        },
    }
}
