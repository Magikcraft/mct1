"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("@magikcraft/mct1/log");
var tools = require("@magikcraft/mct1/tools");
var user_1 = require("@magikcraft/mct1/user");
var events = require("events");
var items = require("items");
var log = log_1.Logger(__filename);
var indexMap = {
    hotbarFirst: 0,
    hotbarLast: 8,
    inventoryFirst: 9,
    inventoryLast: 35,
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
};
var PlayerInventory = /** @class */ (function () {
    function PlayerInventory(player) {
        this.events = {};
        // indexMap: any
        this.indexMap = {
            hotbarFirst: 0,
            hotbarLast: 8,
            inventoryFirst: 9,
            inventoryLast: 35,
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
        };
        this.exportToJSON = function (itemStacks) {
            // Important - using .map causes problems when this is called from
            // inside an event listener, use forEach instead to be safe!
            var itemStacksJSON = [];
            itemStacks.forEach(function (itemStack) {
                if (itemStack)
                    itemStacksJSON.push(tools.itemStackToJSON(itemStack));
                else
                    itemStacksJSON.push(undefined);
            });
            return itemStacksJSON;
        };
        this.player = player;
    }
    PlayerInventory.prototype.logOutAll = function () {
        var _this = this;
        this.getAllitemStacks().forEach(function (itemStack, i) {
            if (itemStack) {
                log(_this.player.name + " inventory slot " + i + " contains " + itemStack.amount + " " + itemStack.type);
            }
            else {
                log(_this.player.name + " inventory slot " + i + " is EMPTY");
            }
        });
    };
    PlayerInventory.prototype.getAllitemStacks = function () {
        var itemStacks = [];
        for (var i = 0; i <= 40; i++) {
            var itemStack = this.getItem(i) || undefined;
            itemStacks.push(itemStack);
        }
        return itemStacks;
    };
    PlayerInventory.prototype.importFromJSON = function (itemStacksJSON) {
        // Important - using .map causes problems when this is called from
        // inside an event listener, use forEach instead to be safe!
        var itemStacks = [];
        itemStacksJSON.forEach(function (itemStackJSON) {
            if (itemStackJSON)
                itemStacks.push(tools.itemStackFromJSON(itemStackJSON));
            else
                itemStacks.push(undefined);
        });
        return itemStacks;
    };
    PlayerInventory.prototype.clear = function () {
        this.player.inventory.clear();
    };
    PlayerInventory.prototype.set = function (itemStacks) {
        var _this = this;
        this.clear();
        itemStacks.forEach(function (itemStack, i) {
            if (itemStack)
                _this.setItem(i, itemStack);
            else
                _this.setEmpty(i);
        });
    };
    PlayerInventory.prototype.save = function (itemStacks) {
        user_1.user(this.player).db.set('savedInventory', this.exportToJSON(itemStacks));
    };
    PlayerInventory.prototype.saveCurrent = function () {
        this.save(this.getAllitemStacks());
    };
    PlayerInventory.prototype.loadSaved = function () {
        var itemStacksJSON = user_1.user(this.player).db.get('savedInventory') || [];
        this.set(this.importFromJSON(itemStacksJSON));
    };
    PlayerInventory.prototype.getItem = function (slotIndex) {
        return this.player.inventory.getItem(slotIndex);
    };
    PlayerInventory.prototype.setItem = function (slotIndex, itemStack) {
        this.player.inventory.setItem(slotIndex, itemStack);
    };
    PlayerInventory.prototype.setEmpty = function (slotIndex) {
        this.setItem(slotIndex, items.air(1));
    };
    // Inject itemStack at slotIndex, and if necessary bump exising items along to accomodate.
    PlayerInventory.prototype.bumpItemIntoSlot = function (slotIndex, itemStack) {
        if (this.getItem(slotIndex)) {
            if (this.getItem(slotIndex).type != itemStack.type) {
                this.bumpItemIntoSlot(slotIndex + 1, this.getItem(slotIndex));
            }
        }
        this.setItem(slotIndex, itemStack);
    };
    PlayerInventory.prototype.setHeldItemSlot = function (slotIndex) {
        this.player.inventory.setHeldItemSlot(slotIndex);
    };
    PlayerInventory.prototype.setReloadAtSpawn = function (bool) {
        var _this = this;
        var key = 'setReloadAtSpawn.playerRespawn';
        if (bool) {
            if (!this.events[key]) {
                this.registerEvent('playerRespawn', function (event) {
                    if (event.player.name !== _this.player.name)
                        return;
                    _this.loadSaved();
                }, key);
            }
        }
        else {
            if (this.events[key]) {
                this.unregisterEvent(key);
            }
        }
        // Also
        this.setCleanupDeathDrops(bool);
    };
    PlayerInventory.prototype.setCleanupDeathDrops = function (bool) {
        var _this = this;
        var key = 'setCleanupDeathDrops.playerDeath';
        if (bool) {
            if (!this.events[key]) {
                this.registerEvent('playerDeath', function (event) {
                    if (event.entity.type != 'PLAYER')
                        return;
                    if (event.entity.name !== _this.player.name)
                        return;
                    setTimeout(function () {
                        // Clean-up dropped items
                        event.entity
                            .getNearbyEntities(2, 2, 2)
                            .forEach(function (entity) {
                            if (entity.type == 'DROPPED_ITEM')
                                entity.remove();
                        });
                    }, 500);
                }, key);
            }
        }
        else {
            if (this.events[key]) {
                this.unregisterEvent(key);
            }
        }
    };
    PlayerInventory.prototype.registerEvent = function (type, callback, key) {
        var k = key || type;
        this.unregisterEvent(k);
        this.events[k] = events[type](callback);
    };
    PlayerInventory.prototype.unregisterEvent = function (key) {
        if (this.events[key])
            this.events[key].unregister();
    };
    return PlayerInventory;
}());
exports.default = PlayerInventory;
