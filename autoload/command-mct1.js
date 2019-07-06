"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commando_1 = require("@magikcraft/mct1/utils/commando");
var log_1 = require("../log");
var user_1 = require("../user");
var log = log_1.Logger('plugins/magikcraft/command-mct1');
// import LightningSuperStrike = require('magikcraft/fx/lightning-super-strike')
commando_1.default('mct1', function (args, player) {
    var method = args[0] || 'start';
    var level = Number(args[1]) || 1;
    echo(player, "MCT1 command: " + method);
    switch (method) {
        case 'start':
            // LightningSuperStrike.kaboom(player.location, 5, 20)
            user_1.user(player).mct1.start();
            break;
        case 'stop':
            user_1.user(player).mct1.stop();
            break;
        case 'inventory':
        case 'i':
            user_1.user(player).mct1.setDemoInventory();
            break;
        case 'debug':
        case 'd':
            user_1.user(player).mct1.setDebugMode(true);
            break;
        default:
            echo(player, "Unknown /mct1 arg \"" + args[0] + "\"");
            break;
    }
});
