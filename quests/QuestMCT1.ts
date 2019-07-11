import { ChestItems } from './mct1/chest-items'
import { Inventories } from './mct1/inventories'
import { QuestBase, QuestConfig } from './Quest'
import * as questTools from './quest-tools'

export { QuestConfig } from './Quest'
// #################### MCT1 Quest #######################
export class QuestMCT1 extends QuestBase {
    public mct1QuestName: string
    public endGateRegion?: any[]
    public endChestLocation?: any
    public endChestContents?: any[]
    constructor(conf: QuestConfig) {
        super(conf)
        if (this.name === 'mct1') {
            this.name = 'mct1-prologue'
        }
        this.mct1QuestName = this.name.replace('mct1-', '')
        if (Inventories[this.mct1QuestName]) {
            this.inventory = Inventories[this.mct1QuestName]
        }
    }
    public start() {
        // Set defaults for MCT1 quests.
        const { locations, regions } = this.Locs
        if (ChestItems[this.mct1QuestName]) {
            this.endChestContents = ChestItems[this.mct1QuestName]
        }
        if (locations.endChest) {
            this.endChestLocation = locations.endChest
        }
        if (regions.endGate) {
            this.endGateRegion = regions.endGate
        }
        if (regions.endPortal) {
            this.endPortalRegion = regions.endPortal
        }
        // Do this here ...
        super.start()

        this.mct1Player.teleport(locations.spawn)
        this.mct1Player.saveSpawn(locations.spawn)
        this.mct1Player.setRespawnAtSpawnLocation(true)
        this.mct1Player.gma() // ADVENTURE!
        this.mct1Player.effects.cancel('LEVITATION') // Just in case
        if (this.inventory) {
            this.mct1Player.inventory.set(this.inventory)
        }
        this.mct1Player.inventory.saveCurrent()
        this.mct1Player.inventory.setReloadAtSpawn(true)
        this.setMCT1SuperPowers(false)
        this.mct1Player.mct1.start()
        this.mct1Player.mct1.setInfiniteInsulin(true)
        this.log('setInfiniteInsulin')
        this.world.killAll('mobs')
        // world.setSpawnFlags(false, true)
        this.world.setNight()
        this.world.setStorm()
        this.world.preventMobSpawning(['HUSK'])
        // worldly(world).setDestroyWorldIfEmpty(true, 3000)
        // setup endchest contents
        if (this.endChestLocation && this.endChestContents) {
            questTools.putItemsInChest(
                this.endChestLocation,
                this.endChestContents
            )
        }
        // Where are we importing the worlds now??
        if (this.nextQuestName) {
            // pre-import world to make quest start more snappy
            // questCommand(this.nextQuestName, 'import', player, options)
        }
    }
    public stop() {
        super.stop()
    }
    public complete() {
        super.complete()
    }
    public setMCT1SuperPowers(bool) {
        if (bool) {
            this.mct1Player.mct1.setSuperCharged(false)
            this.mct1Player.mct1.setInfiniteSnowballs(true)
            this.mct1Player.mct1.setSuperJump(true)
            this.mct1Player.mct1.setSuperSpeed(true)
            this.mct1Player.mct1.setNightVision(false)
            // user(player).mct1.start()
        } else {
            this.mct1Player.mct1.setSuperCharged(false)
            this.mct1Player.mct1.setInfiniteSnowballs(false)
            this.mct1Player.mct1.setSuperJump(false)
            this.mct1Player.mct1.setSuperSpeed(false)
            this.mct1Player.mct1.setNightVision(false)
            // user(player).mct1.start()
        }
    }
    public openEndGate() {
        // if (this.nextQuestName) {
        // 	// pre-import world to make quest start more snappy
        // 	questCommand(nextQuestName, 'import', player, options)
        // }
        if (this.endGateRegion) {
            // End gate effect
            const reg = this.endGateRegion
            questTools.replaceRegion(reg[0], reg[1], 'AIR')
            questTools.playEffectInRegion(reg[0], reg[1], 'DRAGON_BREATH')
            // this.setInterval(() => {
            //     questTools.playEffectInRegion(reg[0], reg[1], 'PORTAL')
            // }, 500)
        }
    }
    public registerEvents() {
        super.registerEvents()
        if (this.endChestLocation) {
            // inventoryClose
            this.registerEvent('inventoryClose', event => {
                if (event.player.name != this.player.name) {
                    return
                }
                if (event.inventory.type != 'CHEST') {
                    return
                }
                // end chest close...
                const cLoc = event.inventory.location
                const ecLoc = this.endChestLocation
                if (
                    cLoc.x === ecLoc.x &&
                    cLoc.y === ecLoc.y &&
                    cLoc.z === ecLoc.z
                ) {
                    this.openEndGate()
                }
            })
        }
    }
}
