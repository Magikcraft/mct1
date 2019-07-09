import { QuestConfig } from '../../../quests/Quest'
import { QuestMCT1 } from '../../../quests/QuestMCT1'
import * as Locations from './locs'

export default class QuestMCT1Breakout2 extends QuestMCT1 {
    constructor(conf: QuestConfig) {
        super(conf)
        this.Locs = Locations.getLocations(this.world)
        super.registerEvents()
    }

    public start() {
        super.start()
        this.world.setSun()
        this.setMCT1SuperPowers(true)
    }
}
