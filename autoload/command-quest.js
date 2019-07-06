"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("@magikcraft/mct1/log");
var quests_1 = require("@magikcraft/mct1/quests");
var commando_1 = require("@magikcraft/mct1/utils/commando");
var utils = require("utils");
// import { isAdminUser } from 'magikcraft/user';
var log = log_1.Logger(__filename);
commando_1.default('quest', function (args, player) {
    log('/quest - args: ' + args);
    var questName = args.shift();
    if (questName == 'mct1') {
        echo(player, 'You are about to start the MCT1 quest!');
    }
    var method = 'start';
    if (args[0] && !args[0].includes(':')) {
        method = args.shift();
    }
    // allow admins to run the quest command for other users like /quest mct1 start <player>
    // let playername = player.name
    // if (args[0] && !args[0].includes(':') && isAdminUser(player.name)) {
    //     playername = args.shift()!
    // }
    // For now, let any player start the quest for another
    var playername = player.name;
    if (args[0] && !args[0].includes(':')) {
        playername = args.shift();
    }
    var questPlayer = utils.player(playername);
    // Remaining args should be options.
    var opts = {};
    args.forEach(function (arg) {
        if (!arg.includes(':')) {
            log("unknown option '" + arg + "' in command /quest " + questName + " " + method + " " + args.join(' '));
            return;
        }
        else {
            opts[arg.split(':')[0]] = arg.split(':')[1];
        }
    });
    opts.mode = opts.mode || 'single'; // single | multi
    opts.verbose = opts.verbose || false;
    quests_1.questCommand(questName, method, questPlayer, opts);
});
