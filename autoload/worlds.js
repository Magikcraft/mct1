"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("utils");
var events = require("events");
var log_1 = require("../log");
var log = log_1.Logger('plugins/magikcraft/worlds');
var world_1 = require("../world");
var worlds = utils['worlds']();
// maybeCleanUpWorld(s)
worlds.forEach(maybeCleanUpWorld);
// Init world event listeners
worlds.forEach(onWorldLoad);
events.worldUnload(function (event) { return onWorldUnload(event.world); });
events.worldLoad(function (event) { return onWorldLoad(event.world); });
// ### HELPERS
function onWorldLoad(world) {
    world_1.worldlyDelete(world); // ensure clean
    world_1.worldly(world); // create world
}
function onWorldUnload(world) {
    world_1.worldlyDelete(world);
}
function maybeCleanUpWorld(world) {
    // @TODO if its an abandoned player quest world, delete it
    var isQuestWorld = world.name.includes('--');
    var containsPlayers = world.getPlayers().length > 0;
    if (isQuestWorld && !containsPlayers) {
        log("Deleting abandoned quest world " + world.name);
        world_1.Multiverse.destroyWorld(world.name);
    }
}
