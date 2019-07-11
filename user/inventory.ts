import * as events from 'events'
import * as items from 'items'
import { Logger } from '../log'
import * as tools from '../tools'
import { MCT1PlayerCache } from '../user'

const log = Logger(__filename)

const indexMap = {
    hotbarFirst: 0,
    hotbarLast: 8,
    inventoryFirst: 9, // top right
    inventoryLast: 35, // bottom right
    // inventory row 1
    inventoryRow1First: 9,
    inventoryRow1Last: 17,
    // inventory row 2
    inventoryRow2First: 18,
    inventoryRow2Last: 26,
    // inventory row 3
    inventoryRow3First: 27,
    inventoryRow3Last: 35,
    // equipment
    boots: 36,
    leggings: 37,
    chest: 38,
    helmet: 39,
    shield: 40,
}

export default class PlayerInventory {
    public player
    // indexMap: any

    public indexMap = {
        hotbarFirst: 0,
        hotbarLast: 8,
        inventoryFirst: 9, // top right
        inventoryLast: 35, // bottom right
        // inventory row 1
        inventoryRow1First: 9,
        inventoryRow1Last: 17,
        // inventory row 2
        inventoryRow2First: 18,
        inventoryRow2Last: 26,
        // inventory row 3
        inventoryRow3First: 27,
        inventoryRow3Last: 35,
        // equipment
        boots: 36,
        leggings: 37,
        chest: 38,
        helmet: 39,
        shield: 40,
    }

    private events = {}

    constructor(player) {
        this.player = player
    }

    public logOutAll() {
        this.getAllitemStacks().forEach((itemStack, i) => {
            if (itemStack) {
                log(
                    `${this.player.name} inventory slot ${i} contains ${
                        itemStack.amount
                    } ${itemStack.type}`
                )
            } else {
                log(`${this.player.name} inventory slot ${i} is EMPTY`)
            }
        })
    }

    public getAllitemStacks() {
        const itemStacks: any[] = []
        for (let i = 0; i <= 40; i++) {
            const itemStack = this.getItem(i) || undefined
            itemStacks.push(itemStack)
        }
        return itemStacks
    }

    public exportToJSON = itemStacks => {
        // Important - using .map causes problems when this is called from
        // inside an event listener, use forEach instead to be safe!
        const itemStacksJSON: any[] = []
        itemStacks.forEach(itemStack => {
            if (itemStack) {
                itemStacksJSON.push(tools.itemStackToJSON(itemStack))
            } else {
                itemStacksJSON.push(undefined)
            }
        })
        return itemStacksJSON
    }

    public importFromJSON(itemStacksJSON) {
        // Important - using .map causes problems when this is called from
        // inside an event listener, use forEach instead to be safe!
        const itemStacks: any[] = []
        itemStacksJSON.forEach(itemStackJSON => {
            if (itemStackJSON) {
                itemStacks.push(tools.itemStackFromJSON(itemStackJSON))
            } else {
                itemStacks.push(undefined)
            }
        })
        return itemStacks
    }

    public clear() {
        this.player.inventory.clear()
    }

    public set(itemStacks: any[]) {
        this.clear()
        itemStacks.forEach((itemStack, i) => {
            if (itemStack) {
                this.setItem(i, itemStack)
            } else {
                this.setEmpty(i)
            }
        })
    }

    public save(itemStacks: any[]) {
        MCT1PlayerCache.getMct1Player(this.player).db.set(
            'savedInventory',
            this.exportToJSON(itemStacks)
        )
    }

    public saveCurrent() {
        this.save(this.getAllitemStacks())
    }

    public loadSaved() {
        const itemStacksJSON =
            MCT1PlayerCache.getMct1Player(this.player).db.get(
                'savedInventory'
            ) || []
        this.set(this.importFromJSON(itemStacksJSON))
    }

    public getItem(slotIndex) {
        return this.player.inventory.getItem(slotIndex)
    }

    public setItem(slotIndex: number, itemStack) {
        this.player.inventory.setItem(slotIndex, itemStack)
    }

    public setEmpty(slotIndex: number) {
        this.setItem(slotIndex, items.air(1))
    }

    // Inject itemStack at slotIndex, and if necessary bump exising items along to accomodate.
    public bumpItemIntoSlot(slotIndex: number, itemStack) {
        if (this.getItem(slotIndex)) {
            if (this.getItem(slotIndex).type != itemStack.type) {
                this.bumpItemIntoSlot(slotIndex + 1, this.getItem(slotIndex))
            }
        }
        this.setItem(slotIndex, itemStack)
    }

    public setHeldItemSlot(slotIndex: number) {
        this.player.inventory.setHeldItemSlot(slotIndex)
    }

    public setReloadAtSpawn(bool: boolean) {
        const key = 'setReloadAtSpawn.playerRespawn'
        if (bool) {
            if (!this.events[key]) {
                this.registerEvent(
                    'playerRespawn',
                    event => {
                        if (event.player.name !== this.player.name) {
                            return
                        }
                        this.loadSaved()
                    },
                    key
                )
            }
        } else {
            if (this.events[key]) {
                this.unregisterEvent(key)
            }
        }
        // Also
        this.setCleanupDeathDrops(bool)
    }

    public setCleanupDeathDrops(bool: boolean) {
        const key = 'setCleanupDeathDrops.playerDeath'
        if (bool) {
            if (!this.events[key]) {
                this.registerEvent(
                    'playerDeath',
                    event => {
                        if (event.entity.type != 'PLAYER') {
                            return
                        }
                        if (event.entity.name !== this.player.name) {
                            return
                        }
                        setTimeout(() => {
                            // Clean-up dropped items
                            event.entity
                                .getNearbyEntities(2, 2, 2)
                                .forEach(entity => {
                                    if (entity.type == 'DROPPED_ITEM') {
                                        entity.remove()
                                    }
                                })
                        }, 500)
                    },
                    key
                )
            }
        } else {
            if (this.events[key]) {
                this.unregisterEvent(key)
            }
        }
    }

    private registerEvent(type: string, callback: any, key?: string) {
        const k = key || type
        this.unregisterEvent(k)
        this.events[k] = events[type](callback)
    }

    private unregisterEvent(key: string) {
        if (this.events[key]) {
            this.events[key].unregister()
        }
    }
}
