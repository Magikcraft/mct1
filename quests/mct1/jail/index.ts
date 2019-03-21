const Location = Java.type('org.bukkit.Location');
const Locations = require('./locs')

import { Journals } from 'mct1/quests/mct1/journals'
import { ChestItems } from 'mct1/quests/mct1/chest-items'

import * as questTools from '../../quest-tools'

import { worldly } from 'mct1/world'
import { user } from 'mct1/user'

const Rockfall = require('./rockfall').default;
const MobTools = require('mct1/mobs')
const items = require('items')
import JailBrawl from './jail-brawl'

import { QuestConfig, QuestMCT1 } from 'mct1/quests/Quest'

export default class QuestMCT1Prologue extends QuestMCT1 {
    jailGuard: any
    rockfall: any

    constructor(conf: QuestConfig) {
        super(conf)
        this.Locs = Locations.getLocations(this.world)
        this.state = {
            hasJournal1: false,
            hasInfiniteInsulin: false,
            jailBreakStarted: false,
            combolockOpen: false,
        }
    }

    start() {
        super.start();
        const { player, world, log, options, Locs, state } = this;
        const { regions } = Locs;

        user(player).mct1.setFoodLevel(5)
        user(player).mct1.setHealth(5)
        user(player).mct1.bgl = 5
        user(player).mct1.insulin = 0

        user(player).inventory.set([])

        // Region: jailHall.. Save player inventory
        worldly(world).registerRegion('jailHall', Locs.regions.jailHall[0], Locs.regions.jailHall[1]);
        worldly(world).registerPlayerEnterRegionEvent('jailHall', (event) => {
            user(player).inventory.save(ChestItems.jailCell.concat([Journals.jail1]))
        })

        // Close jail door
        questTools.closeDoorAtLocation(Locs.locations.jailDoor, false);

        // Setup Journal 1
        const bookDrop = Locs.world.dropItem(Locs.locations.journal, Journals.jail1)
        bookDrop.setVelocity(bookDrop.getVelocity().zero());

        // Setup jailGuard
        this.jailGuard = MobTools.spawn('husk', Locs.locations.jailGuard);
        this.jailGuard.getEquipment().setItemInHand(items['diamondSword'](1));
        this.jailGuard.getEquipment().setHelmet(items['diamondHelmet'](1));

        // Setup rockfall
        this.rockfall = new Rockfall(Locs.regions.rockfall);

        // Setup chest1
        questTools.putItemsInChest(Locs.locations.chest1, ChestItems.jailCell)
    }

    registerEvents() {
        super.registerEvents()
        const { player, world, log, options, Locs, state } = this;

        // playerInteract
        this.registerEvent('playerInteract', (event) => {
            if (event.player.name != player.name) return
            if (event.action == 'RIGHT_CLICK_BLOCK' && event.clickedBlock.type == 'STONE_BUTTON') {
                if (state.combolockOpen) {
                    event.setCancelled(true);
                }
            }
            if (event.action != 'RIGHT_CLICK_BLOCK') return
            if (event.clickedBlock.type != 'CHEST') return
            // chest1 open
            if (event.clickedBlock.y === 82 && !state.hasJournal1) {
                // Can only open chest after hasJournal1
                log('Can\'t open chest until hasJournal1!')
                event.setCancelled(true);
            }
        })

        // playerPickupItem
        this.registerEvent('playerPickupItem', (event) => {
            if (event.player.name != player.name) return;
            if (event.player.world.name != world.name) return;
            // Set hasJournal1 true on journal1 pickup
            if (event.item.itemStack.type == 'WRITTEN_BOOK') {
                log('Picked up hasJournal1!')
                state.hasJournal1 = true
                this.debug('state', JSON.stringify(state))
            }
        })

        // inventoryClick
        this.registerEvent('inventoryClick', (event) => {
            if (event.whoClicked.name != player.name) return
            log('event.clickedInventory', event.clickedInventory)
            if (event.clickedInventory && event.clickedInventory.type) {
                log('event.clickedInventory.type', event.clickedInventory.type)
            }
            if (event.clickedInventory && event.clickedInventory.type != 'PLAYER') return

            log('inventoryClick 1')
            // When player moves Insulin from chest to inventory, set insulinSlot and setInfiniteInsulin true.
            log('event.cursor', event.cursor)
            log('event.cursor.type', event.cursor.type)
            if (event.cursor && event.cursor.type) {
                log('inventoryClick 2.1')
                log('user(player).mct1.isInsulinStack(event.cursor)', user(player).mct1.isInsulinStack(event.cursor) ? 'true' : 'false')
                if (user(player).mct1.isInsulinStack(event.cursor)) {
                    log('inventoryClick 2.2')
                    if (event.slot === -999 || event.slot > 8) {
                        event.setCancelled(true)
                    }
                    else {
                        user(player).mct1.insulinSlot = event.slot
                        log('inventoryClick 3')
                        this.setTimeout(() => {
                            user(player).mct1.setInfiniteInsulin(true)
                            state.hasInfiniteInsulin = true
                            log('Enable infinite Insulin!')
                            log('state', JSON.stringify(state))
                        }, 100)
                    }

                }
            }
        })

        // playerDropItem
        this.registerEvent('playerDropItem', (event) => {
            if (event.player.name != player.name) return
            if (event.itemDrop.type == 'DROPPED_ITEM' && event.itemDrop.itemStack) {
                // Handle case where Insulin is cursor item and chest closed via esc key
                if (user(player).mct1.isInsulinStack(event.itemDrop.itemStack)) {
                    if (!state.hasInfiniteInsulin) {
                        // Cancel dropping insulin, instead move to inventory and setInfiniteInsulin(true).
                        event.setCancelled(true)
                        this.setTimeout(() => {
                            user(player).mct1.setInfiniteInsulin(true)
                            state.hasInfiniteInsulin = true
                            log('Enable infinite Insulin!')
                            log('state', JSON.stringify(state))
                        }, 100)
                    }
                }
            }
        })

        // inventoryClose
        this.registerEvent('inventoryClose', (event) => {
            if (event.player.name != player.name) return
            if (event.inventory.type != 'CHEST') return

            // chest1 close...
            if (event.inventory.location.y === 82) {
                // if (state.hasInfiniteInsulin && !state.jailBreakStarted) {
                if (!state.jailBreakStarted) {
                    log(`startJailBreakSequence`)
                    this.startJailBreak();
                    state.jailBreakStarted = true
                    this.debug('state', JSON.stringify(state))
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

    startJailBreak() {
        const { player, world, log, options, Locs, state } = this;
        const jailBrawl = new JailBrawl(Locs, this.jailGuard)
        jailBrawl.start()

        this.setTimeout(() => {
            this.rockfall.doRockfall();
        }, 7000)

        this.setTimeout(() => {
            this.jailGuard.remove()
            questTools.openDoorAtLocation(Locs.locations.jailDoor)
        }, 10000)
    }
}