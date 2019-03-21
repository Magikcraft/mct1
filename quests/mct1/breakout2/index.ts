const Locations = require('./locs')
import { worldly } from 'mct1/world'
import { QuestConfig, QuestMCT1 } from 'mct1/quests/Quest'

export default class QuestMCT1Breakout2 extends QuestMCT1 {
    constructor(conf: QuestConfig) {
        super(conf)
        this.Locs = Locations.getLocations(this.world)
        super.registerEvents()
    }

    start() {
        super.start()
        const { world } = this
        worldly(world).setSun()
        this.setMCT1SuperPowers(true)
    }
}