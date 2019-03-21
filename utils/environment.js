"use strict";
// Cannot log from here because circular dependency
// We log out the environment settings in engines.ts
Object.defineProperty(exports, "__esModule", { value: true });
// The various plugins
var pluginManager = __plugin.server.pluginManager;
exports.plugins = {
    BossBarAPI: pluginManager.getPlugin('BossBarAPI'),
    DurableMap: pluginManager.getPlugin('DurableMap'),
    Pokkit: pluginManager.getPlugin('Pokkit'),
    Scriptcraft: pluginManager.getPlugin('Scriptcraft'),
    ScriptcraftMultiEngine: undefined,
};
// IS_POKKIT - when running in the Nukkit Pocket Edition server via the Pokkit plugin
exports.IS_NUKKIT = exports.plugins.Pokkit != null;
// IS_SCRIPTCRAFT - when using the Scriptcraft plugin
exports.IS_SCRIPTCRAFT = exports.plugins.Scriptcraft != null;
// IS_MAGIKCRAFT - when using the Magikcraft plugin
exports.IS_SCRIPTCRAFT_MULTI_ENGINE = false;
// SINGLE_ENGINE_MODE - when using Scriptcraft plugin, or multiengine plugin in single engine mode
exports.SINGLE_ENGINE_MODE = true;
// MULTI_ENGINE_MODE - when using multi-engine plugin in multi-engine mode
exports.MULTI_ENGINE_MODE = false;
// HAS_DURABLEMAP - the DurableMap plugin is loaded
exports.HAS_DURABLEMAP = exports.plugins.DurableMap != null;
// HAS_BOSSBAR - when the BossBar plugin is loaded
// Test not only for the plugin, but that it's loaded.
exports.BUKKIT_BOSSBAR_TYPE = 'org.inventivetalent.bossbar.BossBarAPI';
exports.NUKKIT_BOSSBAR_TYPE = 'io.magikcraft.BossBarAPI.BossBar';
var hasBossBar = exports.plugins.BossBarAPI != null;
var bossBarBukkit = false;
var bossBarNukkit = false;
// Here we test if the plugin is loaded. It can be present but not loaded, so we instantiate it
// to ensure that it really is loaded.
if (hasBossBar) {
    try {
        Java.type(exports.BUKKIT_BOSSBAR_TYPE);
        hasBossBar = true;
        bossBarBukkit = true;
    }
    catch (e) {
        bossBarBukkit = false;
    }
    try {
        Java.type(exports.NUKKIT_BOSSBAR_TYPE);
        hasBossBar = true;
        bossBarNukkit = true;
    }
    catch (e) {
        bossBarNukkit = false;
    }
}
exports.HAS_BOSSBAR = hasBossBar;
exports.HAS_BOSSBAR_BUKKIT = bossBarBukkit;
exports.HAS_BOSSBAR_NUKKIT = bossBarNukkit;
// Healthchecks.io
exports.HEALTHCHECKS_IO_URL = java.lang.System.getenv('HEALTHCHECKS_IO_URL');
// DISABLE_WATCH_RELOAD - don't reload the engine(s) when JS files change on disk
exports.DISABLE_WATCH_RELOAD = java.lang.System.getenv('DISABLE_WATCH_RELOAD') === 'true';
global.__engine_name__ = '/mk.io\\';
exports.ENGINE_ID = (typeof global.__engine_id__ === 'undefined') ? 0 : global.__engine_id__;
exports.ENGINE_NAME = __engine_name__;
exports.IS_MASTER_ENGINE = true;
exports.IS_NOT_MASTER_ENGINE = !exports.IS_MASTER_ENGINE;
// ENDPOINT_URL
exports.ENDPOINT_URL = java.lang.System.getenv('ENDPOINT_URL');
