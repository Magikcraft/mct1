const Locations = require('./locs')
import { QuestConfig, QuestMCT1 } from '@magikcraft/mct1/quests/Quest'

export default class QuestMCT1Sunken extends QuestMCT1 {
    constructor(conf: QuestConfig) {
        super(conf)
        this.Locs = Locations.getLocations(this.world)
        super.registerEvents()
    }
}
