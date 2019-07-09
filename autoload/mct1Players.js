"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events = require("events");
var utils = require("utils");
var log_1 = require("../log");
var world_1 = require("../world");
var user_1 = require("./../user");
var log = log_1.Logger(__filename);
// Josh please don't rewrite this file!
// Create all mct1Players when Scriptcraft starts.
var players = utils.players();
players.forEach(onPlayerJoin);
// Create a new mct1Player when player joins.
events.playerJoin(function (_a) {
    var player = _a.player;
    return setTimeout(function () { return onPlayerJoin(player); }, 100);
});
// Delete mct1Player when player quits.
events.playerQuit(function (_a) {
    var player = _a.player;
    return setTimeout(function () { return onPlayerQuit(player); }, 100);
});
// ### HELPERS
function onPlayerJoin(player) {
    log('playerJoin', player.name);
    user_1.MCT1PlayerCache.deleteMct1Player(player); // ensure clean
    user_1.MCT1PlayerCache.getMct1Player(player); // create MCT1Player
    // user(player).continue() // ensure mct1 is not running (clear bars and effects).
}
function onPlayerQuit(player) {
    user_1.MCT1PlayerCache.deleteMct1Player(player);
    world_1.WorldManager.deleteWorldsForPlayer(player);
}
