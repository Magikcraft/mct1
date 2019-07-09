import * as events from 'events'
import { Logger } from '../log'
import { isAdminUser, isTestUser, MCT1PlayerCache } from '../user'
import * as server from '../utils/server'
const log = Logger(__filename)

const commandWhitelist = [
    '/jsp quest',
    '/jsp cast',
    '/jsp mct1',
    '/jsp spellbook',
    '/jsp spells',
]

events.playerCommandPreprocess(event => {
    const { message, player } = event
    const command = message
    const commandStr = command.replace('jsp ', '')

    const mct1Player = MCT1PlayerCache.getMct1Player(player)

    if (command === '/heal') {
        if (mct1Player.mct1.isStarted) {
            mct1Player.mct1.bgl = 5
            mct1Player.mct1.insulin = 0
            mct1Player.mct1.digestionQueue = []
        }
    }

    if (command === '/js refresh()') {
        if (isTestUser(player)) {
            log(`command "${commandStr}" allowed for ${player.name}`)
            echo(player, `Rebooting ScriptCraft plugin...`)
            server.executeCommand(command.replace('/', ''))
            event.setCancelled(true)
            return
        }
    }

    if (isAdminUser(player)) {
        log(`command "${commandStr}" allowed for ${player.name}`)
        return
    }

    let allowed = false
    commandWhitelist.forEach(c => {
        if (command.substring(0, c.length) === c) allowed = true
    })

    if (!allowed) {
        const cmdExists = __plugin.server.getPluginCommand(
            command.replace('/', '')
        )
        if (cmdExists) {
            echo(player, `You do not have the power run command ${commandStr}`)
        } else {
            echo(player, `Unknown command ${commandStr}`)
        }
        log(`command "${commandStr}" NOT allowed for ${player.name}`)
        event.setCancelled(true)
    } else {
        log(`command "${commandStr}" allowed for ${player.name}`)
    }
})
