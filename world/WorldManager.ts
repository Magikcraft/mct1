import * as events from 'events'
import * as utils from 'utils'
import { Logger } from '../log'
import ManagedWorld from './ManagedWorld'
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
    private managedWorlds: { [worldname: string]: ManagedWorld }
    private listeners: { [worldname: string]: any }

    constructor() {
        this.managedWorlds = {}
        this.listeners = {}

        // This handler destroys all player-specific worlds when a player quits the server.
        // Prevents the memory leak that has been crashing the server.
        events.playerQuit(({ player }) => {
            log(`WorldManager player quit server handler`)
            this.deleteWorldsForPlayer(player.name)
        })

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

        // Case 0: We are already managing this world.
        const managedWorld = this.getWorldByWorldName(managedWorldName)
        const worldAlreadyUnderManagement = !!managedWorld
        if (worldAlreadyUnderManagement) {
            return managedWorld
        }

        // Case 1: World exists, but we are not managing it yet.
        const unmanagedWorld = utils.world(managedWorldName)
        const unmanagedWorldAlreadyExists = !!unmanagedWorld

        if (unmanagedWorldAlreadyExists) {
            return this.manageExistingWorld(unmanagedWorld)
        }

        // Case 2: World does not exist yet.
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

        const world = this.getWorldByWorldName(managedWorldName)!
        return world
    }

    /**
     * @param world The world to delete
     */
    public deleteWorld(worldname: string) {
        const managedWorld = this.getWorldByWorldName(worldname)
        if (managedWorld) {
            managedWorld.destroy()
            this.unregisterPlayerLeftWorldListener(worldname)
            Multiverse.destroyWorld(worldname)
            // Remove the world from the in-memory state
            delete this.managedWorlds[worldname]
        }
    }

    public deleteWorldsForPlayer(playername: string) {
        log(`Deleting worlds for ${playername}`)
        this.getWorldsForPlayer(playername).forEach(worldname =>
            this.deleteWorld(worldname)
        )
    }

    private getWorldsForPlayer(playername: string) {
        return Object.keys(this.managedWorlds).filter(
            n =>
                this.managedWorlds[n] &&
                this.managedWorlds[n].playername == playername
        )
    }

    private getWorldByWorldName(name: string) {
        log(`Retrieving ${name}...`)
        return this.managedWorlds[name]
    }

    /**
     * Bring all existing worlds under management. This is used to rebuild the in-memory state of the WorldManager when it has been reloaded.
     */
    private rebuildManagementState() {
        utils
            .worlds()
            .filter(isManagedWorld)
            .forEach(w => this.manageExistingWorld(w))
        log(`Worlds under management: ${Object.keys(this.managedWorlds)}`)
    }

    private manageExistingWorld(world: BukkitWorld) {
        const worldname = world.name
        const playername = isPlayerWorld
            ? worldname.split(playerPrefix)[1]
            : undefined
        const newlyManagedWorld = new ManagedWorld(world, playername)

        this.registerPlayerLeftWorldListener(worldname, playername)

        this.managedWorlds[worldname] = newlyManagedWorld
        log(`Managed Worlds: ${Object.keys(this.managedWorlds)}`)
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
                log(`WorldManager player quit world handler`)
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
