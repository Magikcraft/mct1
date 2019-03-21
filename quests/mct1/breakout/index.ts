import Locations = require('./locs')
import { QuestConfig, QuestMCT1 } from '@magikcraft/mct1/quests/Quest'
import { worldly } from '@magikcraft/mct1/world'

export default class QuestMCT1Breakout extends QuestMCT1 {
    constructor(conf: QuestConfig) {
        super(conf)
        this.Locs = Locations.getLocations(this.world)
        this.endPortalRegion = this.Locs.regions.endPortal
    }

    start() {
        super.start()
        super.registerEvents()
        this.setMCT1SuperPowers(true)
        worldly(this.world).allowMobSpawning()
    }
}
