import * as events from 'events'
import * as utils from 'utils'
import { Logger } from '../log'
import MCT1Player from './MCT1Player'

const log = Logger(__filename)

class MCT1PlayerManagerClass {
    private cache: {
        [playername: string]: MCT1Player
    } = {}

    constructor() {
        const players = utils.players()
        players.forEach(this.flushMct1Player)
        events.playerQuit(this.onPlayerQuit)
        events.playerJoin(this.onPlayerJoin)
    }

    public getMct1Player(player: BukkitPlayer) {
        if (!player) {
            throw new Error('No Player passed in!')
        }
        if (!this.cache[player.name]) {
            this.cache[player.name] = new MCT1Player(player)
            log(`Created MCT1 Player for ${player.name}`)
        }
        return this.cache[player.name]
    }

    public deleteMct1Player(player: BukkitPlayer) {
        if (this.cache[player.name]) {
            this.cache[player.name].cleanse()
            this.cache[player.name] = undefined as any
        }
    }

    public flushMct1Player(player: BukkitPlayer) {
        this.deleteMct1Player(player)
        return this.getMct1Player(player)
    }

    private onPlayerJoin = ({ player }) =>
        setTimeout(() => {
            log('playerJoin', player.name)
            this.flushMct1Player(player)
        }, 100)

    private onPlayerQuit = ({ player }) =>
        setTimeout(() => {
            this.deleteMct1Player(player)
            log(`Deleted MCT1 Player for ${player.name}`)
        }, 100)
}

const MCT1PlayerManager = new MCT1PlayerManagerClass()

export default MCT1PlayerManager
