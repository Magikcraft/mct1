import { questCommand } from 'mct1/quests'
import { Logger } from 'mct1/log'
import * as utils from 'utils'

import { commando } from 'mct1/utils/commando'
// import { isAdminUser } from 'magikcraft/user';

const log = Logger(`${[__dirname, __filename].join('/')}`)

commando('quest', (args, player) => {
    log('/quest - args: ' + args)

    const questName = args.shift()

    let method = 'start'
    if (args[0] && !args[0].includes(':')) {
        method = args.shift()!
    }

    // allow admins to run the quest command for other users like /quest mct1 start <player>
    // let playername = player.name
    // if (args[0] && !args[0].includes(':') && isAdminUser(player.name)) {
    //     playername = args.shift()!
    // }

    // For now, let any player start the quest for another
    let playername = player.name
    if (args[0] && !args[0].includes(':')) {
        playername = args.shift()!
    }

    const questPlayer = utils.player(playername)

    // Remaining args should be options.
    const opts: any = {}
    args.forEach((arg) => {
        if (!arg.includes(':')) {
            log(`unknown option '${arg}' in command /quest ${questName} ${method} ${args.join(' ')}`)
            return
        }
        else {
            opts[arg.split(':')[0]] = arg.split(':')[1]
        }
    });

    opts.mode = opts.mode || 'single' // single | multi
    opts.verbose = opts.verbose || false

    questCommand(questName, method, questPlayer, opts)
})