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
var MobTools = require("@magikcraft/mct1/mobs");
var chest_items_1 = require("@magikcraft/mct1/quests/mct1/chest-items");
var journals_1 = require("@magikcraft/mct1/quests/mct1/journals");
var Quest_1 = require("@magikcraft/mct1/quests/Quest");
var user_1 = require("@magikcraft/mct1/user");
var world_1 = require("@magikcraft/mct1/world");
var items = require("items");
var questTools = require("../../quest-tools");
var jail_brawl_1 = require("./jail-brawl");
var Locations = require("./locs");
var rockfall_1 = require("./rockfall");
var QuestMCT1Prologue = /** @class */ (function (_super) {
    __extends(QuestMCT1Prologue, _super);
    function QuestMCT1Prologue(conf) {
        var _this = _super.call(this, conf) || this;
        _this.Locs = Locations.getLocations(_this.world);
        _this.state = {
            hasJournal1: false,
            hasInfiniteInsulin: false,
            jailBreakStarted: false,
            combolockOpen: false,
        };
        return _this;
    }
    QuestMCT1Prologue.prototype.start = function () {
        _super.prototype.start.call(this);
        var _a = this, player = _a.player, world = _a.world, log = _a.log, options = _a.options, Locs = _a.Locs, state = _a.state;
        var regions = Locs.regions;
        user_1.user(player).mct1.setFoodLevel(5);
        user_1.user(player).mct1.setHealth(5);
        user_1.user(player).mct1.lungFunction = 5;
        user_1.user(player).mct1.insulin = 0;
        user_1.user(player).inventory.set([]);
        // Region: jailHall.. Save player inventory
        world_1.worldly(world).registerRegion('jailHall', Locs.regions.jailHall[0], Locs.regions.jailHall[1]);
        world_1.worldly(world).registerPlayerEnterRegionEvent('jailHall', function (event) {
            user_1.user(player).inventory.save(chest_items_1.ChestItems.jailCell.concat([journals_1.Journals.jail1]));
        });
        // Close jail door
        questTools.closeDoorAtLocation(Locs.locations.jailDoor, false);
        // Setup Journal 1
        var bookDrop = Locs.world.dropItem(Locs.locations.journal, journals_1.Journals.jail1);
        bookDrop.setVelocity(bookDrop.getVelocity().zero());
        // Setup jailGuard
        this.jailGuard = MobTools.spawn('husk', Locs.locations.jailGuard);
        this.jailGuard.getEquipment().setItemInHand(items['diamondSword'](1));
        this.jailGuard.getEquipment().setHelmet(items['diamondHelmet'](1));
        // Setup rockfall
        this.rockfall = new rockfall_1.default(Locs.regions.rockfall);
        // Setup chest1
        questTools.putItemsInChest(Locs.locations.chest1, chest_items_1.ChestItems.jailCell);
    };
    QuestMCT1Prologue.prototype.registerEvents = function () {
        var _this = this;
        _super.prototype.registerEvents.call(this);
        var _a = this, player = _a.player, world = _a.world, log = _a.log, options = _a.options, Locs = _a.Locs, state = _a.state;
        // playerInteract
        this.registerEvent('playerInteract', function (event) {
            if (event.player.name != player.name)
                return;
            if (event.action == 'RIGHT_CLICK_BLOCK' &&
                event.clickedBlock.type == 'STONE_BUTTON') {
                if (state.combolockOpen) {
                    event.setCancelled(true);
                }
            }
            if (event.action != 'RIGHT_CLICK_BLOCK')
                return;
            if (event.clickedBlock.type != 'CHEST')
                return;
            // chest1 open
            if (event.clickedBlock.y === 82 && !state.hasJournal1) {
                // Can only open chest after hasJournal1
                log("Can't open chest until hasJournal1!");
                event.setCancelled(true);
            }
        });
        // playerPickupItem
        this.registerEvent('playerPickupItem', function (event) {
            if (event.player.name != player.name)
                return;
            if (event.player.world.name != world.name)
                return;
            // Set hasJournal1 true on journal1 pickup
            if (event.item.itemStack.type == 'WRITTEN_BOOK') {
                log('Picked up hasJournal1!');
                state.hasJournal1 = true;
                _this.debug('state', JSON.stringify(state));
            }
        });
        // inventoryClick
        this.registerEvent('inventoryClick', function (event) {
            if (event.whoClicked.name != player.name)
                return;
            log('event.clickedInventory', event.clickedInventory);
            if (event.clickedInventory && event.clickedInventory.type) {
                log('event.clickedInventory.type', event.clickedInventory.type);
            }
            if (event.clickedInventory &&
                event.clickedInventory.type != 'PLAYER')
                return;
            log('inventoryClick 1');
            // When player moves Insulin from chest to inventory, set insulinSlot and setInfiniteInsulin true.
            log('event.cursor', event.cursor);
            log('event.cursor.type', event.cursor.type);
            if (event.cursor && event.cursor.type) {
                log('inventoryClick 2.1');
                log('user(player).mct1.isInsulinStack(event.cursor)', user_1.user(player).mct1.isInsulinStack(event.cursor)
                    ? 'true'
                    : 'false');
                if (user_1.user(player).mct1.isInsulinStack(event.cursor)) {
                    log('inventoryClick 2.2');
                    if (event.slot === -999 || event.slot > 8) {
                        event.setCancelled(true);
                    }
                    else {
                        user_1.user(player).mct1.insulinSlot = event.slot;
                        log('inventoryClick 3');
                        _this.setTimeout(function () {
                            user_1.user(player).mct1.setInfiniteInsulin(true);
                            state.hasInfiniteInsulin = true;
                            log('Enable infinite Insulin!');
                            log('state', JSON.stringify(state));
                        }, 100);
                    }
                }
            }
        });
        // playerDropItem
        this.registerEvent('playerDropItem', function (event) {
            if (event.player.name != player.name)
                return;
            if (event.itemDrop.type == 'DROPPED_ITEM' &&
                event.itemDrop.itemStack) {
                // Handle case where Insulin is cursor item and chest closed via esc key
                if (user_1.user(player).mct1.isInsulinStack(event.itemDrop.itemStack)) {
                    if (!state.hasInfiniteInsulin) {
                        // Cancel dropping insulin, instead move to inventory and setInfiniteInsulin(true).
                        event.setCancelled(true);
                        _this.setTimeout(function () {
                            user_1.user(player).mct1.setInfiniteInsulin(true);
                            state.hasInfiniteInsulin = true;
                            log('Enable infinite Insulin!');
                            log('state', JSON.stringify(state));
                        }, 100);
                    }
                }
            }
        });
        // inventoryClose
        this.registerEvent('inventoryClose', function (event) {
            if (event.player.name != player.name)
                return;
            if (event.inventory.type != 'CHEST')
                return;
            // chest1 close...
            if (event.inventory.location.y === 82) {
                // if (state.hasInfiniteInsulin && !state.jailBreakStarted) {
                if (!state.jailBreakStarted) {
                    log("startJailBreakSequence");
                    _this.startJailBreak();
                    state.jailBreakStarted = true;
                    _this.debug('state', JSON.stringify(state));
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
        var _a = this, player = _a.player, world = _a.world, log = _a.log, options = _a.options, Locs = _a.Locs, state = _a.state;
        var jailBrawl = new jail_brawl_1.default(Locs, this.jailGuard);
        jailBrawl.start();
        this.setTimeout(function () {
            _this.rockfall.doRockfall();
        }, 7000);
        this.setTimeout(function () {
            _this.jailGuard.remove();
            questTools.openDoorAtLocation(Locs.locations.jailDoor);
        }, 10000);
    };
    return QuestMCT1Prologue;
}(Quest_1.QuestMCT1));
exports.default = QuestMCT1Prologue;
