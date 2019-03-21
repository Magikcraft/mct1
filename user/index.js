"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var user_1 = require("./user");
__export(require("./permissions"));
__export(require("./effects"));
// We have used the "user" namespace for this to distinguish it from the "player".
// Stores all user instances by player names.
var Users = {};
// Main getter method for a user.
// Example usage: `user(player).mct1.start()`
function user(player) {
    if (!player) {
        throw (new Error('No Player passed in!'));
    }
    if (!Users[player.name]) {
        Users[player.name] = new user_1.default(player);
    }
    return Users[player.name];
}
exports.user = user;
// Deletes the user.
function userDelete(player) {
    if (Users[player.name]) {
        Users[player.name].cleanse();
        delete Users[player.name];
    }
}
exports.userDelete = userDelete;
