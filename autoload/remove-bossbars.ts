import { BossBar } from '@magikcraft/core'
import { Logger } from '../log'
import * as environment from '../utils/environment'

const log = Logger(__filename)

if (environment.HAS_BOSSBAR) {
    if (environment.HAS_BOSSBAR_BUKKIT) {
        log('Removing all Boss Bars')
        BossBar.removeAll()
    }
}
