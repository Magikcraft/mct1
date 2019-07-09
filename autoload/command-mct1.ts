import { Logger } from '../log'
import { makeMCT1Player } from '../user'
import commando from '../utils/commando'

const log = Logger(__filename)
// import LightningSuperStrike = require('magikcraft/fx/lightning-super-strike')

commando('mct1', (args, player) => {
    const method = args[0] || 'start'
    const level = Number(args[1]) || 1

    echo(player, `MCT1 command: ${method}`)

    switch (method) {
        case 'start':
            // LightningSuperStrike.kaboom(player.location, 5, 20)
            makeMCT1Player(player).mct1.start()
            break
        case 'stop':
            makeMCT1Player(player).mct1.stop()
            break
        case 'inventory':
        case 'i':
            makeMCT1Player(player).mct1.setDemoInventory()
            break
        case 'debug':
        case 'd':
            makeMCT1Player(player).mct1.setDebugMode(true)
            break
        default:
            echo(player, `Unknown /mct1 arg "${args[0]}"`)
            break
    }
})
