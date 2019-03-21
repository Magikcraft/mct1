"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Location = Java.type('org.bukkit.Location');
var log_1 = require("mct1/log");
var log = log_1.Logger("" + [__dirname, __filename].join('/'));
exports.getLocations = function (world) {
    return {
        world: world,
        locations: {
            spawn: new Location(world, 220, 44, 356, 159, 3),
        },
        regions: {
            endPortal: [
                new Location(world, 213, 83, 126),
                new Location(world, 202, 68, 130),
            ],
        },
    };
};
