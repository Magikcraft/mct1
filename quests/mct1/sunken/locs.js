"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Location = Java.type('org.bukkit.Location');
exports.getLocations = function (World) {
    return {
        world: World,
        locations: {
            spawn: new Location(World, 0, 118, 2, 178, 13),
            endChest: new Location(World, 36, 117, -137),
        },
        regions: {
            endPortal: [
                new Location(World, 41, 116, -146),
                new Location(World, 51, 121, -156),
            ],
            endGate: [
                new Location(World, 44, 117, -145),
                new Location(World, 48, 119, -145),
            ],
        },
    };
};
