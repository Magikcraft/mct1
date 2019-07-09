"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('MCT1 is loaded!');
var log_1 = require("../log");
var environment = require("../utils/environment");
var log = log_1.Logger(__filename);
var WATCH_RELOAD_STATE = environment.DISABLE_WATCH_RELOAD
    ? 'disabled'
    : 'enabled';
var ENGINE_MODE = environment.SINGLE_ENGINE_MODE
    ? 'Single Engine Mode'
    : 'Multi Engine Mode';
var server = __plugin.server;
log('=== Configuration');
log('Server: ', server.getName() + ' ' + server.getVersion());
if (environment.IS_NUKKIT) {
    log('Pocket Edition Minecraft server');
}
if (environment.IS_SCRIPTCRAFT) {
    log('Scriptcraft classic plugin');
}
if (environment.IS_SCRIPTCRAFT_MULTI_ENGINE) {
    log('Scriptcraft Multi-engine plugin');
    log("|--- running in " + ENGINE_MODE);
}
log('JavaScript watch reload is ' + WATCH_RELOAD_STATE);
var durableMapIsLoaded = environment.HAS_DURABLEMAP ? '' : 'not ';
log("Durable Map plugin " + durableMapIsLoaded + "loaded");
var BossBarMsg = 'No BossBarAPI loaded';
if (environment.HAS_BOSSBAR_BUKKIT) {
    BossBarMsg = 'Bukkit BossBar loaded';
}
if (environment.HAS_BOSSBAR_NUKKIT) {
    BossBarMsg = 'Nukkit BossBar loaded';
}
log(BossBarMsg);
log('============================');
