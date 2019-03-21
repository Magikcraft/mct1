import * as events from 'events'
import { Logger } from '@magikcraft/mct1/log'
const log = Logger(__filename)

log('Registering Player Join event handler')

events.playerJoin(({ player }) => {
    setTimeout(() => {
        // Initial join is a bit chaotic
        echo(
            player,
            `Hi ${player.name}. Welcome to MC:T1, made with <3 by Magikcraft.io`
        )
        echo(player, '')
        echo(player, `Type /quest mct1 to start the quest!`)
    }, 1000)
})
