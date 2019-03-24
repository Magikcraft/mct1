import { Logger } from '../log'
import * as fs from '../utils/fs'
const log = Logger(__filename)

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

const Multiverse = (): MultiverseCore =>
    __plugin.server.getPluginManager().getPlugin('Multiverse-Core')

const getWorldContainer = () => __plugin.server.getWorldContainer()

export const cloneWorld = (source: string, target: string) =>
    Multiverse().cloneWorld(source, target, 'normal')

export const destroyWorld = (name: string) =>
    new Promise(resolve => {
        log('Time I Am, Destroyer of Worlds')
        Multiverse()
            .getMVWorldManager()
            .deleteWorld(name, true, true)
        const worldFilePath = getWorldContainer() + `/${name}`
        if (fs.exists(worldFilePath)) {
            log(`Removing folder ${worldFilePath}...`)
            fs.remove(worldFilePath)
        }
        resolve()
    })
