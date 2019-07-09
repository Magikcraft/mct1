import * as events from 'events'
import * as utils from 'utils'
import MCT1Player from './MCT1Player'

export default class Follower {
    private eventHandlers: any[] = []
    private following: BukkitPlayer
    private mct1Player: MCT1Player

    constructor(mct1Player: MCT1Player) {
        this.mct1Player = mct1Player
    }

    public startFollowing(whoToFollow: BukkitPlayer) {
        const nooneToFollow = !!whoToFollow || !utils.player(whoToFollow)
        if (nooneToFollow) {
            return
        }
        this.stopFollowing()
        this.following = whoToFollow
        this._registerEventHandlers()
        this._follow()
        this.mct1Player.tell(`Following ${whoToFollow.name}`)
    }

    public stopFollowing() {
        if (this.following) {
            this._unregisterEventHandlers()
            this.mct1Player.gmc()
            this.following = undefined
            this.mct1Player.tell(`Follow mode off`)
        }
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
            this.mct1Player.tell(`${event.who.name} quit the server`)
            return this.stopFollowing()
        }
        if (playerQuit && event.who.name == this.mct1Player.player.name) {
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
        this.mct1Player.gmc()
        this.mct1Player.gmsp()
        this.mct1Player.teleport(this.following)
        const TELEPORT_RESETTLE_DELAY = 750
        setTimeout(
            () => this.mct1Player.player.setSpectatorTarget(this.following),
            TELEPORT_RESETTLE_DELAY
        )
    }
}
