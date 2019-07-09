import * as events from 'events'
import * as utils from 'utils'
import { Logger } from '../log'
import { makeMCT1Player, userDelete } from '../user'
import { WorldManager } from '../world'

const log = Logger(__filename)

// Josh please don't rewrite this file!

// Create all users when Scriptcraft starts.
const players = utils.players()
players.forEach(playerJoin)

// Create a new user when player joins.
events.playerJoin(({ player }) => setTimeout(() => playerJoin(player), 100))

// Delete user when player quits.
events.playerQuit(({ player }) => setTimeout(() => playerQuit(player), 100))

// ### HELPERS
function playerJoin(player) {
    log('playerJoin', player.name)
    userDelete(player) // ensure clean
    makeMCT1Player(player) // create user
    // user(player).continue() // ensure mct1 is not running (clear bars and effects).
}
function playerQuit(player) {
    userDelete(player)
    WorldManager.deleteWorldsForPlayer(player)
}
