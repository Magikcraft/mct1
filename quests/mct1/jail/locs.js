"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vector3_1 = require("../../..//vector3");
var regions_1 = require("../../../regions");
var Location = Java.type('org.bukkit.Location');
exports.getLocations = function (bukkitWorld) {
    return {
        world: bukkitWorld,
        waypoints: {
            combolock: {
                region: [
                    new Location(bukkitWorld, 211, 66, 231),
                    new Location(bukkitWorld, 217, 61, 224),
                ],
                saveLocation: new Location(bukkitWorld, 212, 61, 230, -122.7, -5.4),
            },
        },
        locations: {
            spawn: new Location(bukkitWorld, 215, 84, 319, 124, 7),
            // spawn: new Location(world, 215, 55, 144), // end
            journal: new Location(bukkitWorld, 216, 84, 315),
            chest1: new Location(bukkitWorld, 215, 82, 318),
            endChest: new Location(bukkitWorld, 208, 56, 142),
            jailGuard: new Location(bukkitWorld, 209, 83, 315),
            jailBrawl: new Location(bukkitWorld, 207, 83, 331),
            jailGuardLure: new Location(bukkitWorld, 203, 83, 331),
            jailDoor: new Location(bukkitWorld, 210, 83, 313),
        },
        regions: {
            jailHall: [
                new Location(bukkitWorld, 205, 83, 304),
                new Location(bukkitWorld, 209, 87, 324),
            ],
            endPortal: [
                new Location(bukkitWorld, 214, 55, 136),
                new Location(bukkitWorld, 216, 57, 130),
            ],
            endGate: [
                new Location(bukkitWorld, 214, 55, 139),
                new Location(bukkitWorld, 216, 57, 139),
            ],
            rockfall: new regions_1.Region(new vector3_1.Vector3(210, 83, 315, bukkitWorld.name), new vector3_1.Vector3(205, 87, 330, bukkitWorld.name), bukkitWorld.name),
        },
    };
};
