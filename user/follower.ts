import * as events from 'events'
import * as utils from 'utils'
import User from './user'

export default class Follower {
    private eventHandlers: any[] = []
    private following: BukkitPlayer
    private user: User

    constructor(user) {
        this.user = user
    }

    private listener = event => {
        const isTarget = t => t.name == this.following.name

        const playerChangedWorld = !!event.player // playerChangedWorld has a player field
        if (playerChangedWorld && isTarget(event.player)) {
            return this._follow()
        }
        const playerRespawned = !!event.respawnPlayer // playerRespawn has an respawnPlayer field
        if (playerRespawned && isTarget(event.respawnPlayer)) {
            return this._follow()
        }
        const playerQuit = !!event.who // playerQuit has a who field,
        if (playerQuit && isTarget(event.who)) {
            this.user.tell(`${event.who.name} quit the server`)
            return this.stopFollowing()
        }
        if (playerQuit && event.who.name == this.user.player.name) {
            this._unregisterEventHandlers()
        }
    }

    private _registerEventHandlers() {
        this.eventHandlers = [
            events.playerChangedWorld(this.listener),
            events.playerRespawn(this.listener),
            events.playerQuit(this.listener),
        ]
    }

    private _unregisterEventHandlers() {
        this.eventHandlers.forEach(e => e.unregister())
    }

    private _follow() {
        this.user.gmc()
        this.user.gmsp()
        this.user.teleport(this.following)
        const TELEPORT_RESETTLE_DELAY = 750
        setTimeout(
            () => this.user.player.setSpectatorTarget(this.following),
            TELEPORT_RESETTLE_DELAY
        )
    }

    startFollowing(whoToFollow: BukkitPlayer) {
        const nooneToFollow = !!whoToFollow || !utils.player(whoToFollow)
        if (nooneToFollow) {
            return
        }
        this.stopFollowing()
        this.following = whoToFollow
        this._registerEventHandlers()
        this._follow()
        this.user.tell(`Following ${whoToFollow.name}`)
    }

    stopFollowing() {
        if (this.following) {
            this._unregisterEventHandlers()
            this.user.gmc()
            this.following = undefined
            this.user.tell(`Follow mode off`)
        }
    }
}
