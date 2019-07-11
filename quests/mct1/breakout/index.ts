import { QuestConfig } from '../../Quest'
import { QuestMCT1 } from '../../QuestMCT1'
import * as Locations from './locs'

export default class QuestMCT1Breakout extends QuestMCT1 {
    constructor(conf: QuestConfig) {
        super(conf)
        this.Locs = Locations.getLocations(this.world)
        this.endPortalRegion = this.Locs.regions.endPortal
    }

    public start() {
        super.start()
        super.registerEvents()
        this.setMCT1SuperPowers(true)
        this.world.allowMobSpawning()
    }
}
