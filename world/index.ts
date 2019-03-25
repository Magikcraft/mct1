export * from './biome'
export * from './multiverse'
import { Logger } from '../log'
const log = Logger(__filename)
import World from './world'

// We have used the "worldly" namespace for this to distinguish it from the "world".

// Stores all world instances by world names.
export const Worlds: any = {}

// Main getter method for a world.
// Example usage: `worldly(world).preventBlockBreak()`
export function worldly(world): World {
    if (!Worlds[world.name]) {
        log(`######## worldly: ${world.name}`)
        Worlds[world.name] = new World(world)
    }
    return Worlds[world.name]
}

// Deletes the world.
export function worldlyDelete(world) {
    log(`######## worldlyDelete: ${world.name}`)
    if (Worlds[world.name]) {
        Worlds[world.name].cleanse()
        delete Worlds[world.name]
    }
}
