import utils = require('utils')
import events = require('events')

import { Logger } from '../log'
const log = Logger('plugins/magikcraft/worlds')

import { worldly, worldlyDelete, Worlds, Multiverse } from '../world'

// Create all worlds when Scriptcraft starts.
const worlds = utils['worlds']()
worlds.forEach(unloadIfUnused)

// Init world event listeners
worlds.forEach(onWorldLoad)
events.worldUnload(event => onWorldUnload(event.world))
events.worldLoad(event => onWorldLoad(event.world))

// ### HELPERS
function onWorldLoad(world) {
    worldlyDelete(world) // ensure clean
    worldly(world) // create world
}
function onWorldUnload(world) {
    worldlyDelete(world)
}

function unloadIfUnused(world) {
    // Multiverse.
}
