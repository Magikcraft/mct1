import * as events from 'events'
import * as utils from 'utils'
import { Logger } from '../log'
import { WorldManager } from '../world'
import { MCT1PlayerCache } from './../user'

const log = Logger(__filename)

// Josh please don't rewrite this file!

// Create all users when Scriptcraft starts.
const players = utils.players()
players.forEach(onPlayerJoin)

// Create a new user when player joins.
events.playerJoin(({ player }) => setTimeout(() => onPlayerJoin(player), 100))

// Delete user when player quits.
events.playerQuit(({ player }) => setTimeout(() => onPlayerQuit(player), 100))

// ### HELPERS
function onPlayerJoin(player) {
    log('playerJoin', player.name)
    MCT1PlayerCache.deleteMct1Player(player) // ensure clean
    MCT1PlayerCache.getMct1Player(player) // create MCT1Player
    // user(player).continue() // ensure mct1 is not running (clear bars and effects).
}
function onPlayerQuit(player) {
    MCT1PlayerCache.deleteMct1Player(player)
    WorldManager.deleteWorldsForPlayer(player)
}
