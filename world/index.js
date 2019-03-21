"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./biome"));
__export(require("./multiverse"));
var log_1 = require("@magikcraft/mct1/log");
var log = log_1.Logger(__filename);
var world_1 = require("@magikcraft/mct1/world/world");
// We have used the "world" namespace for this to distinguish it from the "world".
// Stores all world instances by world names.
exports.Worlds = {};
// Main getter method for a world.
// Example usage: `world(world).preventBlockBreak()`
function worldly(world) {
    if (!exports.Worlds[world.name]) {
        log("######## worldly: " + world.name);
        exports.Worlds[world.name] = new world_1.default(world);
    }
    return exports.Worlds[world.name];
}
exports.worldly = worldly;
// Deletes the world.
function worldDelete(world) {
    if (exports.Worlds[world.name]) {
        exports.Worlds[world.name].cleanse();
        delete exports.Worlds[world.name];
    }
}
exports.worldDelete = worldDelete;
