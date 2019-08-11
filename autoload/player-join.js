"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events = require("events");
var log_1 = require("../log");
var quests_1 = require("../quests");
var log = log_1.Logger(__filename);
log('Registering Player Join event handler');
events.playerJoin(function (_a) {
    var player = _a.player;
    setTimeout(function () {
        // Initial join is a bit chaotic
        echo(player, "Hi " + player.name + ". Welcome to MC:T1, made with <3 by Magikcraft.io");
        echo(player, '');
        quests_1.questCommand({
            method: 'start',
            opts: {
                verbose: false,
            },
            player: player,
            questName: 'mct1',
        });
    }, 1000);
});
