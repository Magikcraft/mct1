"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events = require("events");
var utils = require("utils");
var log_1 = require("../log");
var user_1 = require("../user");
var server = require("../utils/server");
var log = log_1.Logger(__filename);
// Create all users when Scriptcraft starts.
var players = utils.players();
players.forEach(opPlayer);
// Op admins on join
events.playerJoin(function (_a) {
    var player = _a.player;
    return setTimeout(function () { return opPlayer(player); }, 100);
});
function opPlayer(player) {
    if (user_1.isAdminUser(player)) {
        log("opped " + player.name);
        server.executeCommand("op " + player.name);
    }
}
