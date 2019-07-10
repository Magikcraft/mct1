import * as events from 'events'
import * as utils from 'utils'
import { Logger } from '../log'
import World from './ManagedWorld'
import { Multiverse } from './multiverse'

const log = Logger(__filename)

/**
 * The World Manager is responsible for loading and unloading worlds.
 * It creates ManagedWorlds - cloned worlds with additional helper methods for
 * use by quests.
 * Worlds are deleted when a player leaves the world, or when they leave the server.
 *
 * Multiplayer worlds are not fully implemented yet. The focus is on
 * centralising the logic around the single-player worlds that we currently
 * use. The motivation for this refactor was a bug in the previous implementation
 * that caused OOM errors over time by not deleting worlds when players quit the
 * server. With the previous division of responsibility it was not clear
 * where to implement the fix.
 *
 */

// We use this to detect worlds that should be managed when reloading the code
const managedPrefix = '_m_'
// We use this to know which player a world is for
const playerPrefix = '--player:'

const isManagedWorld = (w: BukkitWorld) => w.name.startsWith(managedPrefix)
const isPlayerWorld = (w: BukkitWorld) => w.name.includes(playerPrefix)
const playernameFromWorld = (w: BukkitWorld) => w.name.split(playerPrefix)[1]

class WorldManagerClass {
    private managedWorlds: World[]
    private listeners: { [worldname: string]: any }

    constructor() {
        this.managedWorlds = []
        this.listeners = {}

        // This handler destroys all player-specific worlds when a player quits the server.
        // Prevents the memory leak that has been crashing the server.
        events.playerQuit(({ player }) =>
            this.deleteWorldsForPlayer(player.name)
        )

        this.rebuildManagementState()
        this.cullWorldsForAbsentPlayers()
    }

    /**
     * Create a managed world for a specific player, or a multiplayer world
     * @param templateWorldname The template world to clone from
     * @param playername The name of the player to create the world for. Pass in undefined for a multiplayer world
     */
    public async createManagedWorld(
        templateWorldname: string,
        playername?: string
    ) {
        const managedWorldName = playername
            ? `${managedPrefix}-${templateWorldname}${playerPrefix}${playername}`
            : `${managedPrefix}-${templateWorldname}-multi`

        log('managedWorldName', managedWorldName) // @DEBUG
        // Case 0: We are already managing this world.
        const managedWorld = this.getWorldByWorldName(managedWorldName)
        const worldAlreadyUnderManagement = !!managedWorld
        if (worldAlreadyUnderManagement) {
            log('Case 0') // @DEBUG
            return managedWorld
        }

        // Case 1: World exists, but we are not managing it yet.
        const unmanagedWorld = utils.world(managedWorldName)
        const unmanagedWorldAlreadyExists = !!unmanagedWorld

        if (unmanagedWorldAlreadyExists) {
            log('Case 1') // @DEBUG

            return this.manageExistingWorld(unmanagedWorld)
        }

        // Case 2: World does not exist yet.
        log('Case 2') // @DEBUG

        const newWorld = await Multiverse.cloneWorld({
            targetWorldname: managedWorldName,
            templateWorldname,
        })
        if (!newWorld) {
            log(`Failed to setup world ${managedWorldName}. Aborting.`)
            return undefined
        }

        log(`Quest world ${managedWorldName} intialized.`)
        this.manageExistingWorld(newWorld)

        return this.getWorldByWorldName(managedWorldName)!
    }

    /**
     * @param world The world to delete
     */
    public deleteWorld(worldname: string) {
        const managedWorld = this.getWorldByWorldName(worldname)
        if (managedWorld) {
            managedWorld.cleanse()
            Multiverse.destroyWorld(worldname)
            // I think the above command accomplishes the below
            // server.executeCommand(`mv delete ${this.world.name}`)
            // server.executeCommand(`mvconfirm`)

            this.unregisterPlayerLeftWorldListener(worldname)
            // Remove the world from the in-memory state
            this.managedWorlds = this.managedWorlds.filter(
                w => w.worldname != worldname
            )
        }
    }

    public deleteWorldsForPlayer(playername: string) {
        this.getWorldsForPlayer(playername).forEach(w =>
            this.deleteWorld(w.getName())
        )
    }

    private getWorldsForPlayer(playername: string) {
        return this.managedWorlds.filter(
            w => w.playername && w.playername == playername
        )
    }

    private getWorldByWorldName(name: string) {
        log('managedWorlds', this.managedWorlds)
        const worlds = this.managedWorlds.filter(w => w.worldname == name)
        log('worlds', worlds)
        return worlds.length > 0 ? worlds[0] : undefined
    }

    /**
     * Bring all existing worlds under management. This is used to rebuild the in-memory state of the WorldManager when it has been reloaded.
     */
    private rebuildManagementState() {
        utils
            .worlds()
            .filter(isManagedWorld)
            .forEach(w => this.manageExistingWorld(w))
    }

    private manageExistingWorld(world: BukkitWorld) {
        const worldname = world.name
        const playername = isPlayerWorld
            ? worldname.split(playerPrefix)[1]
            : undefined
        const newlyManagedWorld = new World(world, playername)

        this.registerPlayerLeftWorldListener(worldname, playername)

        this.managedWorlds.push(newlyManagedWorld)
        return newlyManagedWorld
    }

    /**
     * Delete worlds for players who are not on the server.
     * Called when the code loads up.
     */
    private cullWorldsForAbsentPlayers() {
        utils
            .worlds()
            .filter(isPlayerWorld)
            .forEach(w => {
                const playername = playernameFromWorld(w)
                const playerIsOnline = !!utils.player(playername)
                if (!playerIsOnline) {
                    this.deleteWorldsForPlayer(playername)
                }
            })
    }

    private registerPlayerLeftWorldListener(
        worldname: string,
        playername: string
    ) {
        const isMultiplayerWorld = playername === undefined
        if (isMultiplayerWorld) {
            return
        }
        this.unregisterPlayerLeftWorldListener(worldname)
        this.listeners[worldname] = events.playerChangedWorld(event => {
            const isThisWorld =
                event.from.name == worldname && event.player.name == playername
            if (isThisWorld) {
                setTimeout(() => this.deleteWorld(worldname), 3000)
            }
        })
    }

    private unregisterPlayerLeftWorldListener(worldname: string) {
        if (this.listeners[worldname]) {
            this.listeners[worldname].unregister()
        }
    }
}

export default new WorldManagerClass()
