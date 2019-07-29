"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@magikcraft/core");
var utils = require("utils");
var log_1 = require("../log");
var quests_1 = require("../quests");
var commando_1 = require("../utils/commando");
// import { isAdminUser } from 'magikcraft/user';
var log = log_1.Logger(__filename);
function parseOptions(args, playername) {
    var parsed = {
        questName: args.shift(),
        method: 'start',
        options: {
            verbose: false,
        },
        playername: playername,
    };
    var isOption = function (s) { return s.includes(':'); };
    var hasMoreArgs = !!args[0];
    var firstArgIsOption = hasMoreArgs ? isOption(args[0]) : false;
    parsed.method = hasMoreArgs && !firstArgIsOption ? args.shift() : 'start';
    args.forEach(function (arg) {
        if (isOption(arg)) {
            var _a = arg.split(':'), key = _a[0], value = _a[1];
            parsed.options[key] = value;
        }
        else {
            parsed.playername = arg;
        }
    });
    return parsed;
}
// Format: /quest <command> [playername?] [...option:value?]
commando_1.default('quest', function (args, player) {
    log('/quest - args: ' + args);
    var parsed = parseOptions(args, player.name);
    if (parsed.questName == 'mct1') {
        core_1.actionbar(player, 'You are about to start the MCT1 quest!', core_1.TextColor.MAGIC);
    }
    // allow admins to run the quest command for other users like /quest mct1 start <player>
    // let playername = player.name
    // if (args[0] && !args[0].includes(':') && isAdminUser(player.name)) {
    //     playername = args.shift()!
    // }
    // For now, let any player start the quest for another
    var questPlayer = utils.player(parsed.playername);
    quests_1.questCommand({
        method: parsed.method,
        opts: parsed.options,
        player: questPlayer,
        questName: parsed.questName,
    });
});
