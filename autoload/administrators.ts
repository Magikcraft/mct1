import * as events from 'events'
import * as utils from 'utils'
import { Logger } from '../log'
import { isAdminUser } from '../user'
import * as server from '../utils/server'

const log = Logger(__filename)

// Create all users when Scriptcraft starts.
const players = utils.players()
players.forEach(opPlayer)

// Op admins on join
events.playerJoin(({ player }) => setTimeout(() => opPlayer(player), 100))

function opPlayer(player) {
    if (isAdminUser(player)) {
        log(`opped ${player.name}`)
        server.executeCommand(`op ${player.name}`)
    }
}
