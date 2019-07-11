import { Logger } from '../log'
import { MCT1PlayerCache } from '../user'
import commando from '../utils/commando'

const log = Logger(__filename)
// import LightningSuperStrike = require('magikcraft/fx/lightning-super-strike')

commando('mct1', (args, player) => {
    const method = args[0] || 'start'
    const level = Number(args[1]) || 1

    echo(player, `MCT1 command: ${method}`)
    const mct1Player = MCT1PlayerCache.getMct1Player(player)

    switch (method) {
        case 'start':
            // LightningSuperStrike.kaboom(player.location, 5, 20)
            mct1Player.mct1.start()
            break
        case 'stop':
            mct1Player.mct1.stop()
            break
        case 'inventory':
        case 'i':
            mct1Player.mct1.setDemoInventory()
            break
        case 'debug':
        case 'd':
            mct1Player.mct1.setDebugMode(true)
            break
        default:
            echo(player, `Unknown /mct1 arg "${args[0]}"`)
            break
    }
})
