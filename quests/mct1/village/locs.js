"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Location = Java.type('org.bukkit.Location');
exports.getLocations = function (bukkitWorld) {
    return {
        locations: {
            spawn: new Location(bukkitWorld, 348, 69, -309, 94, 22),
        },
        regions: {
            endPortal: [
                new Location(bukkitWorld, 349, 69, -316),
                new Location(bukkitWorld, 351, 86, -303),
            ],
        },
        world: bukkitWorld,
    };
};
