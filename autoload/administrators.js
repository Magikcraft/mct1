"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("utils");
var server = require("../utils/server");
var log_1 = require("../log");
var log = log_1.Logger('plugins/magikcraft/users');
var administrators = ['triyuga', 'sitapati'];
// Create all users when Scriptcraft starts.
var players = utils.players();
players.forEach(opPlayer);
// server.executeCommand(`mv clone mct1-sunken-v2 test3 normal`)
// Create a new user when player joins.
// events.playerJoin(({player}) => setTimeout(() => opPlayer(player), 100))
function opPlayer(player) {
    if (administrators.includes(player.name)) {
        log("opped " + player.name);
        server.executeCommand("op " + player.name);
    }
}
