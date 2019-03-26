"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events = require("events");
var log_1 = require("../log");
var log = log_1.Logger('player-quit-event');
var server = require("../utils/server");
var user_1 = require("../user");
var commandWhitelist = [
    '/jsp quest',
    '/jsp cast',
    '/jsp mct1',
    '/jsp spellbook',
    '/jsp spells',
];
events.playerCommandPreprocess(function (event) {
    var message = event.message, player = event.player;
    var command = message;
    var commandStr = command.replace('jsp ', '');
    if (command === '/heal') {
        if (user_1.user(player).mct1.isStarted) {
            user_1.user(player).mct1.bgl = 5;
            user_1.user(player).mct1.insulin = 0;
            user_1.user(player).mct1.digestionQueue = [];
        }
    }
    if (command === '/js refresh()') {
        if (user_1.isTestUser(player)) {
            log("command \"" + commandStr + "\" allowed for " + player.name);
            echo(player, "Rebooting ScriptCraft plugin...");
            server.executeCommand(command.replace('/', ''));
            event.setCancelled(true);
            return;
        }
    }
    if (user_1.isAdminUser(player)) {
        log("command \"" + commandStr + "\" allowed for " + player.name);
        return;
    }
    var allowed = false;
    commandWhitelist.forEach(function (c) {
        if (command.substring(0, c.length) === c)
            allowed = true;
    });
    if (!allowed) {
        var cmdExists = __plugin.server.getPluginCommand(command.replace('/', ''));
        if (cmdExists) {
            echo(player, "You do not have the power run command " + commandStr);
        }
        else {
            echo(player, "Unknown command " + commandStr);
        }
        log("command \"" + commandStr + "\" NOT allowed for " + player.name);
        event.setCancelled(true);
    }
    else {
        log("command \"" + commandStr + "\" allowed for " + player.name);
    }
});
