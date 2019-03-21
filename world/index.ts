export * from './biome'
export * from './multiverse'
import { Logger } from '@magikcraft/mct1/log'
const log = Logger(__filename)
import World from '@magikcraft/mct1/world/world'

// We have used the "world" namespace for this to distinguish it from the "world".

// Stores all world instances by world names.
export const Worlds: any = {}

// Main getter method for a world.
// Example usage: `world(world).preventBlockBreak()`
export function worldly(world): World {
    if (!Worlds[world.name]) {
        log(`######## worldly: ${world.name}`)
        Worlds[world.name] = new World(world)
    }
    return Worlds[world.name]
}

// Deletes the world.
export function worldDelete(world) {
    if (Worlds[world.name]) {
        Worlds[world.name].cleanse()
        delete Worlds[world.name]
    }
}
