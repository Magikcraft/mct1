const Location = Java.type('org.bukkit.Location')

export const getLocations = (bukkitWorld: BukkitWorld) => {
    return {
        world: bukkitWorld,
        locations: {
            spawn: new Location(bukkitWorld, 0, 118, 2, 178, 13),
            endChest: new Location(bukkitWorld, 36, 117, -137),
        },
        regions: {
            endPortal: [
                new Location(bukkitWorld, 41, 116, -146),
                new Location(bukkitWorld, 51, 121, -156),
            ],
            endGate: [
                new Location(bukkitWorld, 44, 117, -145),
                new Location(bukkitWorld, 48, 119, -145),
            ],
        },
    }
}
