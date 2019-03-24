import { Logger } from '../log'
const log = Logger(__filename)
// export function Multiverse() {

// }

// const Multiverse = __plugin.server
//         .getPluginManager()
//         .getPlugin('Multiverse-Core')

interface MultiverseCore {
    cloneWorld(
        templateWorldName: string,
        worldName: string,
        mode: 'normal'
    ): BukkitWorld
    deleteWorld(worldName: string)
    getMVWorldManager(): WorldManager
}

interface WorldManager {
    cloneWorld(source: string, target: string)
    deleteWorld(
        worldName: string,
        removeFromConfig: boolean,
        deleteWorldFolder: boolean
    )
    unloadWorld(name: string)
}

export const Multiverse = (): MultiverseCore =>
    __plugin.server.getPluginManager().getPlugin('Multiverse-Core')

export const destroyWorld = (name: string) =>
    new Promise(resolve => {
        log('Time I Am, Destroyer of Worlds')
        Multiverse()
            .getMVWorldManager()
            .deleteWorld(name, true, true)
        resolve()
    })
