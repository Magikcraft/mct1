"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require('utils');
var regions_1 = require("@magikcraft/mct1/regions");
var vector3_1 = require("@magikcraft/mct1/vector3");
var Location = Java.type('org.bukkit.Location');
var log_1 = require("@magikcraft/mct1/log");
var log = log_1.Logger(__filename);
exports.getLocations = function (world) {
    return {
        world: world,
        locations: {
            spawn: new Location(world, 177, 77, -293, -97, -30),
            portalSpawn: new Location(world, 348, 69, -309, 94, 22),
            villageCenter: new Location(world, 219, 84, -306),
            mobSpawnPoints: [
                // new Location(world, 230, 68, -392), // north
                new Location(world, 239, 78, -365),
                // new Location(world, 302, 63, -316), // east
                new Location(world, 274, 74, -308),
                // new Location(world, 224, 71, -236), // south
                new Location(world, 241, 77, -271),
                // new Location(world, 160, 72, -310), // west
                new Location(world, 184, 79, -306),
            ],
        },
        regions: {
            lightning: new regions_1.Region(new vector3_1.Vector3(170, 50, -250, world.name), new vector3_1.Vector3(300, 100, -400, world.name), world.name),
            wither: new regions_1.Region(new vector3_1.Vector3(200, 100, -280, world.name), new vector3_1.Vector3(250, 110, -330, world.name), world.name),
            portal: new regions_1.Region(new vector3_1.Vector3(349, 69, -316, world.name), new vector3_1.Vector3(351, 86, -303, world.name), world.name),
            portalOuter: new regions_1.Region(new vector3_1.Vector3(352, 85, -301, world.name), new vector3_1.Vector3(346, 66, -319, world.name), world.name),
            portalGround: new regions_1.Region(new vector3_1.Vector3(352, 65, -301, world.name), new vector3_1.Vector3(346, 65, -319, world.name), world.name)
        },
    };
};
