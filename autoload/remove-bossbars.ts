import * as utils from 'utils'
import { Logger } from '../log'
import * as environment from '../utils/environment'

const log = Logger(__filename)

if (environment.HAS_BOSSBAR) {
    if (environment.HAS_BOSSBAR_BUKKIT) {
        const BossBarAPI = Java.type('org.inventivetalent.bossbar.BossBarAPI')
        log('Removing all Boss Bars')
        // Cancel all BossBars on plugin refresh()
        utils.players().forEach(player => {
            log(`Removing Boss Bars for ${player.name}`)
            BossBarAPI.removeAllBars(player)
        })
    }
}
