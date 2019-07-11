"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var items = require("items");
var MobTools = require("../../../mobs");
var questTools = require("../../quest-tools");
var QuestMCT1_1 = require("../../QuestMCT1");
var chest_items_1 = require("../chest-items");
var journals_1 = require("../journals");
var jail_brawl_1 = require("./jail-brawl");
var Locations = require("./locs");
var rockfall_1 = require("./rockfall");
var QuestMCT1Prologue = /** @class */ (function (_super) {
    __extends(QuestMCT1Prologue, _super);
    function QuestMCT1Prologue(conf) {
        var _this = _super.call(this, conf) || this;
        _this.Locs = Locations.getLocations(_this.world.getBukkitWorld());
        _this.state = {
            combolockOpen: false,
            hasInfiniteInsulin: false,
            hasJournal1: false,
            jailBreakStarted: false,
        };
        return _this;
    }
    QuestMCT1Prologue.prototype.start = function () {
        var _this = this;
        _super.prototype.start.call(this);
        var regions = this.Locs.regions;
        this.mct1Player.mct1.setFoodLevel(5);
        this.mct1Player.mct1.setHealth(5);
        this.mct1Player.mct1.bgl = 5;
        this.mct1Player.mct1.insulin = 0;
        this.mct1Player.inventory.set([]);
        // Region: jailHall.. Save player inventory
        this.world.registerRegion('jailHall', this.Locs.regions.jailHall[0], this.Locs.regions.jailHall[1]);
        this.world.registerPlayerEnterRegionEvent('jailHall', function (event) {
            _this.mct1Player.inventory.save(chest_items_1.ChestItems.jailCell.concat([journals_1.Journals.jail1]));
        });
        // Close jail door
        questTools.closeDoorAtLocation(this.Locs.locations.jailDoor, false);
        // Setup Journal 1
        var bookDrop = this.Locs.world.dropItem(this.Locs.locations.journal, journals_1.Journals.jail1);
        bookDrop.setVelocity(bookDrop.getVelocity().zero());
        // Setup jailGuard
        this.jailGuard = MobTools.spawn('husk', this.Locs.locations.jailGuard);
        this.jailGuard.getEquipment().setItemInHand(items.diamondSword(1));
        this.jailGuard.getEquipment().setHelmet(items.diamondHelmet(1));
        // Setup rockfall
        this.rockfall = new rockfall_1.default(this.Locs.regions.rockfall);
        // Setup chest1
        questTools.putItemsInChest(this.Locs.locations.chest1, chest_items_1.ChestItems.jailCell);
    };
    QuestMCT1Prologue.prototype.registerEvents = function () {
        var _this = this;
        _super.prototype.registerEvents.call(this);
        // playerInteract
        this.registerEvent('playerInteract', function (event) {
            if (event.player.name != _this.player.name) {
                return;
            }
            if (event.action == 'RIGHT_CLICK_BLOCK' &&
                event.clickedBlock.type == 'STONE_BUTTON') {
                if (_this.state.combolockOpen) {
                    event.setCancelled(true);
                }
            }
            if (event.action != 'RIGHT_CLICK_BLOCK') {
                return;
            }
            if (event.clickedBlock.type != 'CHEST') {
                return;
            }
            // chest1 open
            if (event.clickedBlock.y === 82 && !_this.state.hasJournal1) {
                // Can only open chest after hasJournal1
                _this.log("Can't open chest until hasJournal1!");
                event.setCancelled(true);
            }
        });
        // playerPickupItem
        this.registerEvent('playerPickupItem', function (event) {
            var isThisPlayer = event.player.name == _this.player.name;
            var isThisWorld = event.player.world.name == _this.world.getName();
            if (!isThisPlayer || !isThisWorld) {
                return;
            }
            // Set hasJournal1 true on journal1 pickup
            if (event.item.itemStack.type == 'WRITTEN_BOOK') {
                _this.log('Picked up hasJournal1!');
                _this.state.hasJournal1 = true;
                _this.debug('state', JSON.stringify(_this.state));
            }
        });
        // inventoryClick
        this.registerEvent('inventoryClick', function (event) {
            if (event.whoClicked.name != _this.player.name) {
                return;
            }
            _this.log('event.clickedInventory', event.clickedInventory);
            if (event.clickedInventory && event.clickedInventory.type) {
                _this.log('event.clickedInventory.type', event.clickedInventory.type);
            }
            if (event.clickedInventory &&
                event.clickedInventory.type != 'PLAYER') {
                return;
            }
            _this.log('inventoryClick 1');
            // When player moves Insulin from chest to inventory, set insulinSlot and setInfiniteInsulin true.
            _this.log('event.cursor', event.cursor);
            _this.log('event.cursor.type', event.cursor.type);
            if (event.cursor && event.cursor.type) {
                _this.log('inventoryClick 2.1');
                _this.log('user(player).mct1.isInsulinStack(event.cursor)', _this.mct1Player.mct1.isInsulinStack(event.cursor)
                    ? 'true'
                    : 'false');
                if (_this.mct1Player.mct1.isInsulinStack(event.cursor)) {
                    _this.log('inventoryClick 2.2');
                    if (event.slot === -999 || event.slot > 8) {
                        event.setCancelled(true);
                    }
                    else {
                        _this.mct1Player.mct1.insulinSlot = event.slot;
                        _this.log('inventoryClick 3');
                        _this.setTimeout(function () {
                            _this.mct1Player.mct1.setInfiniteInsulin(true);
                            _this.state.hasInfiniteInsulin = true;
                            _this.log('Enable infinite Insulin!');
                            _this.log('state', JSON.stringify(_this.state));
                        }, 100);
                    }
                }
            }
        });
        // playerDropItem
        this.registerEvent('playerDropItem', function (event) {
            if (event.player.name != _this.player.name) {
                return;
            }
            if (event.itemDrop.type == 'DROPPED_ITEM' &&
                event.itemDrop.itemStack) {
                // Handle case where Insulin is cursor item and chest closed via esc key
                if (_this.mct1Player.mct1.isInsulinStack(event.itemDrop.itemStack)) {
                    if (!_this.state.hasInfiniteInsulin) {
                        // Cancel dropping insulin, instead move to inventory and setInfiniteInsulin(true).
                        event.setCancelled(true);
                        _this.setTimeout(function () {
                            _this.mct1Player.mct1.setInfiniteInsulin(true);
                            _this.state.hasInfiniteInsulin = true;
                            _this.log('Enable infinite Insulin!');
                            _this.log('state', JSON.stringify(_this.state));
                        }, 100);
                    }
                }
            }
        });
        // inventoryClose
        this.registerEvent('inventoryClose', function (event) {
            if (event.player.name != _this.player.name) {
                return;
            }
            if (event.inventory.type != 'CHEST') {
                return;
            }
            // chest1 close...
            if (event.inventory.location.y === 82) {
                // if (state.hasInfiniteInsulin && !state.jailBreakStarted) {
                if (!_this.state.jailBreakStarted) {
                    _this.log("startJailBreakSequence");
                    _this.startJailBreak();
                    _this.state.jailBreakStarted = true;
                    _this.debug('state', JSON.stringify(_this.state));
                }
            }
        });
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
    };
    QuestMCT1Prologue.prototype.startJailBreak = function () {
        var _this = this;
        var jailBrawl = new jail_brawl_1.default(this.Locs, this.jailGuard);
        jailBrawl.start();
        this.setTimeout(function () {
            _this.rockfall.doRockfall();
        }, 7000);
        this.setTimeout(function () {
            _this.jailGuard.remove();
            questTools.openDoorAtLocation(_this.Locs.locations.jailDoor);
        }, 10000);
    };
    return QuestMCT1Prologue;
}(QuestMCT1_1.QuestMCT1));
exports.default = QuestMCT1Prologue;
