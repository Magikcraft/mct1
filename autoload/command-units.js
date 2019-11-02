"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var user_1 = require("../user");
var commando_1 = require("../utils/commando");
commando_1.default('units', function (args, player) {
    var mct1Player = user_1.MCT1PlayerCache.getMct1Player(player);
    var currentUnit = mct1Player.mct1.isUSA ? 'mgdl' : 'mmolL';
    echo(player, "Currently using " + currentUnit);
    if (args[0] === 'mmol') {
        mct1Player.mct1.isUSA = false;
        echo(player, 'Now using mmolL');
        return true;
    }
    if (args[0] === 'mgdl') {
        mct1Player.mct1.isUSA = true;
        echo(player, 'Now using mgdl');
        return true;
    }
    echo(player, 'Usage: /units <mmol | mgdl>');
    return true;
});
