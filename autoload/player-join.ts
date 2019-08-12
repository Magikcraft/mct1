import * as events from 'events'
import { Logger } from '../log'
import { questCommand } from '../quests'
const log = Logger(__filename)

log('Registering Player Join event handler')

events.playerJoin(({ player }) => {
    setTimeout(() => {
        // Initial join is a bit chaotic
        echo(
            player,
            `Hi ${player.name}. Welcome to MC:T1, made with <3 by Magikcraft.io`
        )
        echo(player, 'Satrting the gmae in 5 seconds...')

        setTimeout(
            () =>
                questCommand({
                    method: 'start',
                    opts: {
                        verbose: false,
                    },
                    player,
                    questName: 'mct1',
                }),
            5000
        )
    }, 1000)
})
