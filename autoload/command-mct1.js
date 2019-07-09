"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("../log");
var user_1 = require("../user");
var commando_1 = require("../utils/commando");
var log = log_1.Logger(__filename);
// import LightningSuperStrike = require('magikcraft/fx/lightning-super-strike')
commando_1.default('mct1', function (args, player) {
    var method = args[0] || 'start';
    var level = Number(args[1]) || 1;
    echo(player, "MCT1 command: " + method);
    var mct1Player = user_1.MCT1PlayerCache.getMct1Player(player);
    switch (method) {
        case 'start':
            // LightningSuperStrike.kaboom(player.location, 5, 20)
            mct1Player.mct1.start();
            break;
        case 'stop':
            mct1Player.mct1.stop();
            break;
        case 'inventory':
        case 'i':
            mct1Player.mct1.setDemoInventory();
            break;
        case 'debug':
        case 'd':
            mct1Player.mct1.setDebugMode(true);
            break;
        default:
            echo(player, "Unknown /mct1 arg \"" + args[0] + "\"");
            break;
    }
});
