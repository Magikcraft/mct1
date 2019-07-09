"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("utils");
var log_1 = require("../log");
var environment = require("../utils/environment");
var log = log_1.Logger(__filename);
if (environment.HAS_BOSSBAR) {
    if (environment.HAS_BOSSBAR_BUKKIT) {
        var BossBarAPI_1 = Java.type('org.inventivetalent.bossbar.BossBarAPI');
        log('Removing all Boss Bars');
        // Cancel all BossBars on plugin refresh()
        utils.players().forEach(function (player) {
            log("Removing Boss Bars for " + player.name);
            BossBarAPI_1.removeAllBars(player);
        });
    }
}
