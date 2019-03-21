"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Location = Java.type('org.bukkit.Location');
var log_1 = require("mct1/log");
var log = log_1.Logger("" + [__dirname, __filename].join('/'));
function kaboom(loc, distance, delay) {
    if (distance === void 0) { distance = 10; }
    if (delay === void 0) { delay = 100; }
    setTimeout(function () {
        var d = distance;
        var locs = [
            new Location(loc.world, loc.x + d, loc.y + 0, loc.z + d),
            new Location(loc.world, loc.x - d, loc.y + 0, loc.z + d),
            new Location(loc.world, loc.x + d, loc.y + 0, loc.z - d),
            new Location(loc.world, loc.x - d, loc.y + 0, loc.z - d),
            new Location(loc.world, loc.x + d, loc.y + 0, loc.z + 0),
            new Location(loc.world, loc.x - d, loc.y + 0, loc.z + 0),
            new Location(loc.world, loc.x + 0, loc.y + 0, loc.z + d),
            new Location(loc.world, loc.x + 0, loc.y + 0, loc.z - d),
        ];
        locs.forEach(function (location) {
            location.world.strikeLightning(location);
        });
        if (distance > 0) {
            distance--;
            kaboom(loc, distance, delay);
        }
    }, delay);
}
exports.kaboom = kaboom;
