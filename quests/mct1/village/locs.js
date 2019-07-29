"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Location = Java.type('org.bukkit.Location');
exports.getLocations = function (World) {
    return {
        locations: {
            spawn: new Location(World, 348, 69, -309, 94, 22),
        },
        regions: {
            endPortal: [
                new Location(World, 349, 69, -316),
                new Location(World, 351, 86, -303),
            ],
        },
        world: World,
    };
};
