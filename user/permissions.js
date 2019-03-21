"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AdminUsers = [
    'triyuga',
    'sitapati',
    // 'RedMoonWT1',
    'Purpsta',
];
var TestUsers = ['Luwak_kopi'].concat(AdminUsers);
exports.isAdminUser = function (player) {
    return !!AdminUsers.find(function (u) { return u === player.name; });
};
exports.isTestUser = function (player) {
    return !!TestUsers.find(function (u) { return u === player.name; });
};
