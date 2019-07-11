import { Logger } from '../log'
import * as environment from '../utils/environment'

const log = Logger(__filename)

log('MCT1 is loaded!')

const WATCH_RELOAD_STATE = environment.DISABLE_WATCH_RELOAD
    ? 'disabled'
    : 'enabled'

const ENGINE_MODE = environment.SINGLE_ENGINE_MODE
    ? 'Single Engine Mode'
    : 'Multi Engine Mode'

const server = __plugin.server

log('=== Configuration')
log('Server: ', server.getName() + ' ' + server.getVersion())
if (environment.IS_NUKKIT) {
    log('Pocket Edition Minecraft server')
}
if (environment.IS_SCRIPTCRAFT) {
    log('Scriptcraft classic plugin')
}
if (environment.IS_SCRIPTCRAFT_MULTI_ENGINE) {
    log('Scriptcraft Multi-engine plugin')
    log(`|--- running in ${ENGINE_MODE}`)
}

log('JavaScript watch reload is ' + WATCH_RELOAD_STATE)

const durableMapIsLoaded = environment.HAS_DURABLEMAP ? '' : 'not '
log(`Durable Map plugin ${durableMapIsLoaded}loaded`)

let BossBarMsg = 'No BossBarAPI loaded'
if (environment.HAS_BOSSBAR_BUKKIT) {
    BossBarMsg = 'Bukkit BossBar loaded'
}
if (environment.HAS_BOSSBAR_NUKKIT) {
    BossBarMsg = 'Nukkit BossBar loaded'
}
log(BossBarMsg)

log('============================')
