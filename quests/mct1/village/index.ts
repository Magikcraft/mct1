const Locations = require('./locs')
import { worldly } from '@magikcraft/mct1/world'
import { QuestConfig, QuestMCT1 } from '@magikcraft/mct1/quests/Quest'

export default class QuestMCT1Village extends QuestMCT1 {
    constructor(conf: QuestConfig) {
        super(conf)
        this.Locs = Locations.getLocations(this.world)
        super.registerEvents()
    }

    start() {
        super.start()
        const { world } = this
        worldly(world).setDay()
        worldly(world).setSun()
        this.setMCT1SuperPowers(true)
    }
}