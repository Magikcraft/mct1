import * as items from 'items'
import * as MobTools from '../../../mobs'
import { QuestConfig } from '../../Quest'
import * as questTools from '../../quest-tools'
import { QuestMCT1 } from '../../QuestMCT1'
import { ChestItems } from '../chest-items'
import { Journals } from '../journals'
import JailBrawl from './jail-brawl'
import * as Locations from './locs'
import Rockfall from './rockfall'

export default class QuestMCT1Prologue extends QuestMCT1 {
    public jailGuard: any
    public rockfall: any

    constructor(conf: QuestConfig) {
        super(conf)
        this.Locs = Locations.getLocations(this.world.getBukkitWorld())
        this.state = {
            combolockOpen: false,
            hasInfiniteInsulin: false,
            hasJournal1: false,
            jailBreakStarted: false,
        }
    }

    public start() {
        super.start()
        const { regions } = this.Locs

        this.mct1Player.mct1.setFoodLevel(5)
        this.mct1Player.mct1.setHealth(5)
        this.mct1Player.mct1.bgl = 5
        this.mct1Player.mct1.insulin = 0

        this.mct1Player.inventory.set([])

        // Region: jailHall.. Save player inventory
        this.world.registerRegion(
            'jailHall',
            this.Locs.regions.jailHall[0],
            this.Locs.regions.jailHall[1]
        )
        this.world.registerPlayerEnterRegionEvent('jailHall', event => {
            this.mct1Player.inventory.save(
                ChestItems.jailCell.concat([Journals.jail1])
            )
        })

        // Close jail door
        questTools.closeDoorAtLocation(this.Locs.locations.jailDoor, false)

        // Setup Journal 1
        const bookDrop = this.Locs.world.dropItem(
            this.Locs.locations.journal,
            Journals.jail1
        )
        bookDrop.setVelocity(bookDrop.getVelocity().zero())

        // Setup jailGuard
        this.jailGuard = MobTools.spawn('husk', this.Locs.locations.jailGuard)
        this.jailGuard.getEquipment().setItemInHand(items.diamondSword(1))
        this.jailGuard.getEquipment().setHelmet(items.diamondHelmet(1))

        // Setup rockfall
        this.rockfall = new Rockfall(this.Locs.regions.rockfall)

        // Setup chest1
        questTools.putItemsInChest(
            this.Locs.locations.chest1,
            ChestItems.jailCell
        )
    }

    public registerEvents() {
        super.registerEvents()

        // playerInteract
        this.registerEvent('playerInteract', event => {
            if (event.player.name != this.player.name) {
                return
            }
            if (
                event.action == 'RIGHT_CLICK_BLOCK' &&
                event.clickedBlock.type == 'STONE_BUTTON'
            ) {
                if (this.state.combolockOpen) {
                    event.setCancelled(true)
                }
            }
            if (event.action != 'RIGHT_CLICK_BLOCK') {
                return
            }
            if (event.clickedBlock.type != 'CHEST') {
                return
            }
            // chest1 open
            if (event.clickedBlock.y === 82 && !this.state.hasJournal1) {
                // Can only open chest after hasJournal1
                this.log("Can't open chest until hasJournal1!")
                event.setCancelled(true)
            }
        })

        // playerPickupItem
        this.registerEvent('playerPickupItem', event => {
            const isThisPlayer = event.player.name == this.player.name
            const isThisWorld = event.player.world.name == this.world.getName()
            if (!isThisPlayer || !isThisWorld) {
                return
            }

            // Set hasJournal1 true on journal1 pickup
            if (event.item.itemStack.type == 'WRITTEN_BOOK') {
                this.log('Picked up hasJournal1!')
                this.state.hasJournal1 = true
                this.debug('state', JSON.stringify(this.state))
            }
        })

        // inventoryClick
        this.registerEvent('inventoryClick', event => {
            if (event.whoClicked.name != this.player.name) {
                return
            }
            this.log('event.clickedInventory', event.clickedInventory)
            if (event.clickedInventory && event.clickedInventory.type) {
                this.log(
                    'event.clickedInventory.type',
                    event.clickedInventory.type
                )
            }
            if (
                event.clickedInventory &&
                event.clickedInventory.type != 'PLAYER'
            ) {
                return
            }

            this.log('inventoryClick 1')
            // When player moves Insulin from chest to inventory, set insulinSlot and setInfiniteInsulin true.
            this.log('event.cursor', event.cursor)
            this.log('event.cursor.type', event.cursor.type)
            if (event.cursor && event.cursor.type) {
                this.log('inventoryClick 2.1')
                this.log(
                    'user(player).mct1.isInsulinStack(event.cursor)',
                    this.mct1Player.mct1.isInsulinStack(event.cursor)
                        ? 'true'
                        : 'false'
                )
                if (this.mct1Player.mct1.isInsulinStack(event.cursor)) {
                    this.log('inventoryClick 2.2')
                    if (event.slot === -999 || event.slot > 8) {
                        event.setCancelled(true)
                    } else {
                        this.mct1Player.mct1.insulinSlot = event.slot
                        this.log('inventoryClick 3')
                        this.setTimeout(() => {
                            this.mct1Player.mct1.setInfiniteInsulin(true)
                            this.state.hasInfiniteInsulin = true
                            this.log('Enable infinite Insulin!')
                            this.log('state', JSON.stringify(this.state))
                        }, 100)
                    }
                }
            }
        })

        // playerDropItem
        this.registerEvent('playerDropItem', event => {
            if (event.player.name != this.player.name) {
                return
            }
            if (
                event.itemDrop.type == 'DROPPED_ITEM' &&
                event.itemDrop.itemStack
            ) {
                // Handle case where Insulin is cursor item and chest closed via esc key
                if (
                    this.mct1Player.mct1.isInsulinStack(
                        event.itemDrop.itemStack
                    )
                ) {
                    if (!this.state.hasInfiniteInsulin) {
                        // Cancel dropping insulin, instead move to inventory and setInfiniteInsulin(true).
                        event.setCancelled(true)
                        this.setTimeout(() => {
                            this.mct1Player.mct1.setInfiniteInsulin(true)
                            this.state.hasInfiniteInsulin = true
                            this.log('Enable infinite Insulin!')
                            this.log('state', JSON.stringify(this.state))
                        }, 100)
                    }
                }
            }
        })

        // inventoryClose
        this.registerEvent('inventoryClose', event => {
            if (event.player.name != this.player.name) {
                return
            }
            if (event.inventory.type != 'CHEST') {
                return
            }

            // chest1 close...
            if (event.inventory.location.y === 82) {
                // if (state.hasInfiniteInsulin && !state.jailBreakStarted) {
                if (!this.state.jailBreakStarted) {
                    this.log(`startJailBreakSequence`)
                    this.startJailBreak()
                    this.state.jailBreakStarted = true
                    this.debug('state', JSON.stringify(this.state))
                }
            }
        })

        // blockPistonRetract
        // this.registerEvent('blockPistonRetract', (event) => {
        // 	if (event.block.location.world.name !== world.name) return
        // 	const loc = event.block.location
        // 	if (loc.x === 217 && loc.y === 61 && loc.z === 222) {
        // 		this.setTimeout(() => {
        // 			const doorBlock = loc.world.getBlockAt(215, 61, 222)
        // 			if (doorBlock.type == 'AIR') {
        // 				log('Combolock Open!')
        // 				state.combolockOpen = true
        // 				questTools.playSoundAtLocation(doorBlock.location, 'BLOCK_NOTE_XYLOPHONE')
        // 			}
        // 		}, 1000) // needs to be greater than 500
        // 	}
        // })
    }

    public startJailBreak() {
        const jailBrawl = new JailBrawl(this.Locs, this.jailGuard)
        jailBrawl.start()

        this.setTimeout(() => {
            this.rockfall.doRockfall()
        }, 7000)

        this.setTimeout(() => {
            this.jailGuard.remove()
            questTools.openDoorAtLocation(this.Locs.locations.jailDoor)
        }, 10000)
    }
}
