"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var regions_1 = require("@magikcraft/mct1/regions");
var vector3_1 = require("@magikcraft/mct1/vector3");
var Location = Java.type('org.bukkit.Location');
exports.getLocations = function (bukkitWorld) {
    return {
        world: bukkitWorld,
        locations: {
            spawn: new Location(bukkitWorld, 177, 77, -293, -97, -30),
            portalSpawn: new Location(bukkitWorld, 348, 69, -309, 94, 22),
            villageCenter: new Location(bukkitWorld, 219, 84, -306),
            mobSpawnPoints: [
                // new Location(world, 230, 68, -392), // north
                new Location(bukkitWorld, 239, 78, -365),
                // new Location(world, 302, 63, -316), // east
                new Location(bukkitWorld, 274, 74, -308),
                // new Location(world, 224, 71, -236), // south
                new Location(bukkitWorld, 241, 77, -271),
                // new Location(world, 160, 72, -310), // west
                new Location(bukkitWorld, 184, 79, -306),
            ],
        },
        regions: {
            lightning: new regions_1.Region(new vector3_1.Vector3(170, 50, -250, bukkitWorld.name), new vector3_1.Vector3(300, 100, -400, bukkitWorld.name), bukkitWorld.name),
            wither: new regions_1.Region(new vector3_1.Vector3(200, 100, -280, bukkitWorld.name), new vector3_1.Vector3(250, 110, -330, bukkitWorld.name), bukkitWorld.name),
            portal: new regions_1.Region(new vector3_1.Vector3(349, 69, -316, bukkitWorld.name), new vector3_1.Vector3(351, 86, -303, bukkitWorld.name), bukkitWorld.name),
            portalOuter: new regions_1.Region(new vector3_1.Vector3(352, 85, -301, bukkitWorld.name), new vector3_1.Vector3(346, 66, -319, bukkitWorld.name), bukkitWorld.name),
            portalGround: new regions_1.Region(new vector3_1.Vector3(352, 65, -301, bukkitWorld.name), new vector3_1.Vector3(346, 65, -319, bukkitWorld.name), bukkitWorld.name),
        },
    };
};
