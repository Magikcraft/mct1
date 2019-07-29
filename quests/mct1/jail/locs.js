"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vector3_1 = require("../../..//vector3");
var regions_1 = require("../../../regions");
var Location = Java.type('org.bukkit.Location');
exports.getLocations = function (World) {
    return {
        world: World,
        waypoints: {
            combolock: {
                region: [
                    new Location(World, 211, 66, 231),
                    new Location(World, 217, 61, 224),
                ],
                saveLocation: new Location(World, 212, 61, 230, -122.7, -5.4),
            },
        },
        locations: {
            spawn: new Location(World, 215, 84, 319, 124, 7),
            // spawn: new Location(world, 215, 55, 144), // end
            journal: new Location(World, 216, 84, 315),
            chest1: new Location(World, 215, 82, 318),
            endChest: new Location(World, 208, 56, 142),
            jailGuard: new Location(World, 209, 83, 315),
            jailBrawl: new Location(World, 207, 83, 331),
            jailGuardLure: new Location(World, 203, 83, 331),
            jailDoor: new Location(World, 210, 83, 313),
        },
        regions: {
            jailHall: [
                new Location(World, 205, 83, 304),
                new Location(World, 209, 87, 324),
            ],
            endPortal: [
                new Location(World, 214, 55, 136),
                new Location(World, 216, 57, 130),
            ],
            endGate: [
                new Location(World, 214, 55, 139),
                new Location(World, 216, 57, 139),
            ],
            rockfall: new regions_1.Region(new vector3_1.Vector3(210, 83, 315, World.name), new vector3_1.Vector3(205, 87, 330, World.name), World.name),
        },
    };
};
