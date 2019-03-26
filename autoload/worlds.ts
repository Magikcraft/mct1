import utils = require('utils')
import events = require('events')

import { Logger } from '../log'
const log = Logger('plugins/magikcraft/worlds')

import { worldly, worldlyDelete, Multiverse } from '../world'

const worlds = utils['worlds']()

// maybeCleanUpWorld(s)
worlds.forEach(maybeCleanUpWorld)

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

function maybeCleanUpWorld(world) {
    // @TODO if its an abandoned player quest world, delete it
    const isQuestWorld = world.name.includes('--')
    const containsPlayers = world.getPlayers().length > 0
    if (isQuestWorld && !containsPlayers) {
        log(`Deleting abandoned quest world ${world.name}`)
        Multiverse.destroyWorld(world.name)
    }
}
