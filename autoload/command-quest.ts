import { Logger } from '@magikcraft/mct1/log'
import { questCommand } from '@magikcraft/mct1/quests'
import commando from '@magikcraft/mct1/utils/commando'
import * as utils from 'utils'

// import { isAdminUser } from 'magikcraft/user';

const log = Logger(__filename)

function parseOptions(args: string[], playername: string) {
    const parsed = {
        questName: args.shift(),
        method: 'start',
        options: {
            verbose: false,
        },
        playername,
    }

    const isOption = s => s.includes(':')

    const hasMoreArgs = !!args[0]
    const firstArgIsOption = hasMoreArgs ? isOption(args[0]) : false

    parsed.method = hasMoreArgs && !firstArgIsOption ? args.shift()! : 'start'

    args.forEach(arg => {
        if (isOption(arg)) {
            const [key, value] = arg.split(':')
            parsed.options[key] = value
        } else {
            parsed.playername = arg
        }
    })
    return parsed
}

// Format: /quest <command> [playername?] [...option:value?]
commando('quest', (args, player) => {
    log('/quest - args: ' + args)

    const parsed = parseOptions(args, player.name)

    if (parsed.questName == 'mct1') {
        echo(player, 'You are about to start the MCT1 quest!')
    }

    // allow admins to run the quest command for other users like /quest mct1 start <player>
    // let playername = player.name
    // if (args[0] && !args[0].includes(':') && isAdminUser(player.name)) {
    //     playername = args.shift()!
    // }

    // For now, let any player start the quest for another
    const questPlayer = utils.player(parsed.playername)

    questCommand({
        method: parsed.method,
        opts: parsed.options,
        player: questPlayer,
        questName: parsed.questName,
    })
})
