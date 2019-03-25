import * as utils from 'utils'
import { Logger } from '../log'
import * as fs from '../utils/fs'
import { executeCommand } from './../utils/server'

const log = Logger(__filename)

const server = __plugin.server

class MultiverseInterface {
    private multiversePlugin: MultiverseCorePlugin
    private worldmanager: WorldManager
    constructor() {
        this.multiversePlugin = server
            .getPluginManager()
            .getPlugin('Multiverse-Core')
        if (!this.multiversePlugin) {
            throw new Error(
                'Multiverse-Core plugin not found! Is it installed on this server?'
            )
        }
        this.worldmanager = this.multiversePlugin.getMVWorldManager()
    }

    public destroyWorld(name: string) {
        log(`Time I Am, Destroyer of Worlds: destroying ${name}`)
        if (this.worldmanager.getMVWorld(name)) {
            this.worldmanager.deleteWorld(name, true, true)
        }
        if (this.worldExistsOnDisk(name)) {
            fs.remove(this.getWorldPath(name))
        } else {
            setTimeout(() => log('Oh yeah, it was deleted.'), 5000)
        }
    }

    public importWorld(worldName: string) {
        log('Checking if world already imported', worldName)
        const worldAlreadyImported = this.worldmanager.getMVWorld(worldName)
        if (worldAlreadyImported) {
            return utils.world(worldName)
        }
        if (!this.worldExistsOnDisk(worldName)) {
            throw new Error(`Cannot import world ${worldName}: file not found`)
        }
        executeCommand(`mv import ${worldName} normal`)
        return utils.world(worldName)
    }

    public async cloneWorld(worldName: string, templateWorldName: string) {
        await this.destroyWorld(worldName)
        log(`Cloning ${worldName}`)
        const imported = this.importWorld(templateWorldName)
        if (!imported) {
            log(`Cannot clone ${worldName}. ${templateWorldName} not found.`)
            return
        }
        const cloned = this.multiversePlugin.cloneWorld(
            templateWorldName,
            worldName,
            'normal'
        )
        if (!cloned) {
            log(`Failed to clone world ${templateWorldName}`)
            return
        }
        const world = utils.world(worldName)
        log(`World clone complete for ${worldName}`)
        return new Promise(resolve => setTimeout(() => resolve(world), 1))
    }

    private worldExistsOnDisk(worldName: string) {
        const path = this.getWorldPath(worldName)
        return fs.exists(path)
    }

    private getWorldPath(worldName: string) {
        const worldDir = server.getWorldContainer()
        const path = `./${worldDir}/${worldName}`
        return path
    }
}

export const multiverse = new MultiverseInterface()

interface MultiverseCorePlugin {
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
    getMVWorld(name: string): BukkitWorld | null
}
