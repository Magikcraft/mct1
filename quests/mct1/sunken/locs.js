"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Location = Java.type('org.bukkit.Location');
exports.getLocations = function (world) {
    return {
        world: world,
        locations: {
            spawn: new Location(world, 0, 118, 2, 178, 13),
            endChest: new Location(world, 36, 117, -137),
        },
        regions: {
            endPortal: [
                new Location(world, 41, 116, -146),
                new Location(world, 51, 121, -156),
            ],
            endGate: [
                new Location(world, 44, 117, -145),
                new Location(world, 48, 119, -145),
            ],
        },
    };
};
