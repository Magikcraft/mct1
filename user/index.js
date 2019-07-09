"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var MCT1Player_1 = require("./MCT1Player");
__export(require("./effects"));
__export(require("./permissions"));
// We have used the "user" namespace for this to distinguish it from the "player".
// Stores all user instances by player names.
var MCT1Players = {};
// Main getter method for a user.
// Example usage: `user(player).mct1.start()`
function makeMCT1Player(player) {
    if (!player) {
        throw new Error('No Player passed in!');
    }
    if (!MCT1Players[player.name]) {
        MCT1Players[player.name] = new MCT1Player_1.default(player);
    }
    return MCT1Players[player.name];
}
exports.makeMCT1Player = makeMCT1Player;
// Deletes the user.
function userDelete(player) {
    if (MCT1Players[player.name]) {
        MCT1Players[player.name].cleanse();
        delete MCT1Players[player.name];
    }
}
exports.userDelete = userDelete;
