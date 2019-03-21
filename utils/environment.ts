// Cannot log from here because circular dependency
// We log out the environment settings in engines.ts

// __engine_name__ is set to the player by the Java plugin when an engine is created in multi-engine mode.
declare const __engine_name__: string;

// The various plugins
const pluginManager = __plugin.server.pluginManager
export const plugins = {
    BossBarAPI: pluginManager.getPlugin('BossBarAPI'),
    DurableMap: pluginManager.getPlugin('DurableMap'),
    Pokkit: pluginManager.getPlugin('Pokkit'),
    Scriptcraft: pluginManager.getPlugin('Scriptcraft'),
    ScriptcraftMultiEngine: undefined,
}

// IS_POKKIT - when running in the Nukkit Pocket Edition server via the Pokkit plugin
export const IS_NUKKIT = plugins.Pokkit != null

// IS_SCRIPTCRAFT - when using the Scriptcraft plugin
export const IS_SCRIPTCRAFT = plugins.Scriptcraft != null

// IS_MAGIKCRAFT - when using the Magikcraft plugin
export const IS_SCRIPTCRAFT_MULTI_ENGINE = false

// SINGLE_ENGINE_MODE - when using Scriptcraft plugin, or multiengine plugin in single engine mode
export const SINGLE_ENGINE_MODE = true

// MULTI_ENGINE_MODE - when using multi-engine plugin in multi-engine mode
export const MULTI_ENGINE_MODE = false

// HAS_DURABLEMAP - the DurableMap plugin is loaded
export const HAS_DURABLEMAP = plugins.DurableMap != null

// HAS_BOSSBAR - when the BossBar plugin is loaded
// Test not only for the plugin, but that it's loaded.
export const BUKKIT_BOSSBAR_TYPE = 'org.inventivetalent.bossbar.BossBarAPI'
export const NUKKIT_BOSSBAR_TYPE = 'io.magikcraft.BossBarAPI.BossBar'

let hasBossBar = plugins.BossBarAPI != null
let bossBarBukkit = false
let bossBarNukkit = false

// Here we test if the plugin is loaded. It can be present but not loaded, so we instantiate it
// to ensure that it really is loaded.
if (hasBossBar) {
    try {
        Java.type(BUKKIT_BOSSBAR_TYPE)
        hasBossBar = true
        bossBarBukkit = true
    } catch (e) {
        bossBarBukkit = false
    }

    try {
        Java.type(NUKKIT_BOSSBAR_TYPE)
        hasBossBar = true
        bossBarNukkit = true
    } catch (e) {
        bossBarNukkit = false
    }
}
export const HAS_BOSSBAR = hasBossBar
export const HAS_BOSSBAR_BUKKIT = bossBarBukkit
export const HAS_BOSSBAR_NUKKIT = bossBarNukkit

// Healthchecks.io
export const HEALTHCHECKS_IO_URL = java.lang.System.getenv('HEALTHCHECKS_IO_URL')

// DISABLE_WATCH_RELOAD - don't reload the engine(s) when JS files change on disk
export const DISABLE_WATCH_RELOAD =
    java.lang.System.getenv('DISABLE_WATCH_RELOAD') === 'true'


global.__engine_name__ = '/mk.io\\'

export const ENGINE_ID = (typeof global.__engine_id__ === 'undefined') ? 0 : global.__engine_id__

export const ENGINE_NAME = __engine_name__

export const IS_MASTER_ENGINE = true

export const IS_NOT_MASTER_ENGINE = !IS_MASTER_ENGINE

// ENDPOINT_URL
export const ENDPOINT_URL = java.lang.System.getenv('ENDPOINT_URL')

