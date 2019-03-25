import * as utils from 'utils'
import { Logger } from '../log'
const log = Logger(__filename)

const server = __plugin.server

const Multiverse = (): MultiverseCore =>
    server.getPluginManager().getPlugin('Multiverse-Core')

export const destroyWorld = (name: string) =>
    new Promise(resolve => {
        log(`Time I Am, Destroyer of Worlds: destroying ${name}`)
        Multiverse()
            .getMVWorldManager()
            .deleteWorld(name, true, true)
        resolve()
    })

export function importWorld(templateWorldName: string) {
    server.executeCommand(`mv import ${templateWorldName} normal`)
}

export async function cloneWorld(worldName: string, templateWorldName: string) {
    await destroyWorld(worldName)
    log(`Cloning ${worldName}`)
    server.executeCommand(`mv import ${templateWorldName} normal`)
    const success = Multiverse().cloneWorld(
        templateWorldName,
        worldName,
        'normal'
    )
    if (!success) {
        return log(`Failed to clone world ${templateWorldName}`)
    }
    const world = utils.world(worldName)
    log(`World clone complete for ${worldName}`)
    return new Promise(resolve => setTimeout(() => resolve(world), 1))
}

interface MultiverseCore {
    cloneWorld(
        templateWorldName: string,
        worldName: string,
        mode: 'normal'
    ): BukkitWorld
    getMVWorldManager(): WorldManager
}

interface WorldManager {
    deleteWorld(
        worldName: string,
        removeFromConfig: boolean,
        deleteWorldFolder: boolean
    )
}
