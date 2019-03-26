import * as events from 'events'
import utils = require('utils')
import * as server from '../utils/server'
import { Logger } from '../log'
const log = Logger('plugins/magikcraft/users')

import { isAdminUser } from '../user'

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
