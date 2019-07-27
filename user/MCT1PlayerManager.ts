import * as events from 'events'
import { Logger } from '../log'
import MCT1Player from './MCT1Player'

const log = Logger(__filename)

class MCT1PlayerManagerClass {
    private cache: {
        [playername: string]: MCT1Player
    } = {}

    constructor() {
        events.playerQuit(event => this.onPlayerQuit(event))
        events.playerJoin(event => this.onPlayerJoin(event))
    }

    public getMct1Player(player: Player) {
        if (!player) {
            throw new Error('No Player passed in!')
        }
        if (!this.cache[player.name]) {
            this.cache[player.name] = new MCT1Player(player)
            log(`Created MCT1 Player for ${player.name}`)
        }
        return this.cache[player.name]
    }

    public deleteMct1Player(player: Player) {
        if (this.cache[player.name]) {
            this.cache[player.name].cleanse()
            delete this.cache[player.name]
        }
    }

    public flushMct1Player = (player: Player) => {
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
            log(`MCT1PlayerManager player quit handler`)
            this.deleteMct1Player(player)
            log(`Deleted MCT1 Player for ${player.name}`)
        }, 100)
}

const MCT1PlayerManager = new MCT1PlayerManagerClass()

export default MCT1PlayerManager
