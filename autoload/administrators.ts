import * as events from 'events'
import utils = require('utils')
import * as server from '../utils/server'
import { Logger } from '../log'
const log = Logger('plugins/magikcraft/users')

const administrators = ['triyuga', 'sitapati']

// Create all users when Scriptcraft starts.
const players = utils.players()
players.forEach(opPlayer)

// server.executeCommand(`mv clone mct1-sunken-v2 test3 normal`)

// Create a new user when player joins.
// events.playerJoin(({player}) => setTimeout(() => opPlayer(player), 100))

function opPlayer(player) {
    if (administrators.includes(player.name)) {
        log(`opped ${player.name}`)
        server.executeCommand(`op ${player.name}`)
    }
}
