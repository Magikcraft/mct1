"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events = require("events");
var utils = require("utils");
var log_1 = require("../log");
var user_1 = require("../user");
var world_1 = require("../world");
var log = log_1.Logger('plugins/magikcraft/users');
// Josh please don't rewrite this file!
// Create all users when Scriptcraft starts.
var players = utils.players();
players.forEach(playerJoin);
// Create a new user when player joins.
events.playerJoin(function (_a) {
    var player = _a.player;
    return setTimeout(function () { return playerJoin(player); }, 100);
});
// Delete user when player quits.
events.playerQuit(function (_a) {
    var player = _a.player;
    return setTimeout(function () { return playerQuit(player); }, 100);
});
// ### HELPERS
function playerJoin(player) {
    log('playerJoin', player.name);
    user_1.userDelete(player); // ensure clean
    user_1.makeMCT1Player(player); // create user
    // user(player).continue() // ensure mct1 is not running (clear bars and effects).
}
function playerQuit(player) {
    user_1.userDelete(player);
    world_1.WorldManager.deleteWorldsForPlayer(player);
}
