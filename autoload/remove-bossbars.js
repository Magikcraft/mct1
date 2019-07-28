"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@magikcraft/core");
var log_1 = require("../log");
var environment = require("../utils/environment");
var log = log_1.Logger(__filename);
if (environment.HAS_BOSSBAR) {
    if (environment.HAS_BOSSBAR_BUKKIT) {
        log('Removing all Boss Bars');
        core_1.BossBar.removeAll();
    }
}
