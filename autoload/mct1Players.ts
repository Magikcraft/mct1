import * as events from 'events'
import * as utils from 'utils'
import { Logger } from '../log'
import { MCT1PlayerCache } from '../user'
import { WorldManager } from '../world'

const log = Logger(__filename)

// Josh please don't rewrite this file!

// Create all mct1Players when Scriptcraft starts.
const players = utils.players()
players.forEach(onPlayerJoin)

// Create a new mct1Player when player joins.
events.playerJoin(({ player }) => setTimeout(() => onPlayerJoin(player), 100))

// Delete mct1Player when player quits.
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
