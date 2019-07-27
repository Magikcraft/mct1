import { QuestConfig } from '../../Quest'
import { QuestMCT1 } from '../../QuestMCT1'
import * as Locations from './locs'

export default class QuestMCT1Sunken extends QuestMCT1 {
    constructor(conf: QuestConfig) {
        super(conf)
        this.Locs = Locations.getLocations(this.world.getWorld())
        super.registerEvents()
    }
}
