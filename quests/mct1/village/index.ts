import { QuestConfig, QuestMCT1 } from '../../../quests/QuestMCT1'
import * as Locations from './locs'

export default class QuestMCT1Village extends QuestMCT1 {
    constructor(conf: QuestConfig) {
        super(conf)
        this.Locs = Locations.getLocations(this.world.getBukkitWorld())
        super.registerEvents()
    }

    public start() {
        super.start()
        this.world.setDay()
        this.world.setSun()
        this.setMCT1SuperPowers(true)
    }
}
