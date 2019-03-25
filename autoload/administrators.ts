import * as events from 'events'
import utils = require('utils')
import * as server from '../utils/server'
import { Logger } from '../log'
const log = Logger('plugins/magikcraft/users')

const administrators = ['triyuga', 'sitapati']

// Create all users when Scriptcraft starts.
const players = utils.players()
players.forEach(opPlayer)

// Op admins on join
events.playerJoin(({ player }) => setTimeout(() => opPlayer(player), 100))

function opPlayer(player) {
    if (administrators.includes(player.name)) {
        log(`opped ${player.name}`)
        server.executeCommand(`op ${player.name}`)
    }
}
