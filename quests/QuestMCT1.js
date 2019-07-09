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
var user_1 = require("../user");
var chest_items_1 = require("./mct1/chest-items");
var inventories_1 = require("./mct1/inventories");
var Quest_1 = require("./Quest");
var questTools = require("./quest-tools");
// #################### MCT1 Quest #######################
var QuestMCT1 = /** @class */ (function (_super) {
    __extends(QuestMCT1, _super);
    function QuestMCT1(conf) {
        var _this = _super.call(this, conf) || this;
        if (_this.name === 'mct1') {
            _this.name = 'mct1-prologue';
        }
        _this.mct1QuestName = _this.name.replace('mct1-', '');
        if (inventories_1.Inventories[_this.mct1QuestName]) {
            _this.inventory = inventories_1.Inventories[_this.mct1QuestName];
        }
        return _this;
    }
    QuestMCT1.prototype.start = function () {
        // Set defaults for MCT1 quests.
        var _a = this.Locs, locations = _a.locations, regions = _a.regions;
        if (chest_items_1.ChestItems[this.mct1QuestName]) {
            this.endChestContents = chest_items_1.ChestItems[this.mct1QuestName];
        }
        if (locations.endChest) {
            this.endChestLocation = locations.endChest;
        }
        if (regions.endGate) {
            this.endGateRegion = regions.endGate;
        }
        if (regions.endPortal) {
            this.endPortalRegion = regions.endPortal;
        }
        // Do this here ...
        _super.prototype.start.call(this);
        user_1.user(this.player).teleport(locations.spawn);
        user_1.user(this.player).saveSpawn(locations.spawn);
        user_1.user(this.player).setRespawnAtSpawnLocation(true);
        user_1.user(this.player).gma(); // ADVENTURE!
        user_1.user(this.player).effects.cancel('LEVITATION'); // Just in case
        if (this.inventory) {
            user_1.user(this.player).inventory.set(this.inventory);
        }
        user_1.user(this.player).inventory.saveCurrent();
        user_1.user(this.player).inventory.setReloadAtSpawn(true);
        this.setMCT1SuperPowers(false);
        user_1.user(this.player).mct1.start();
        user_1.user(this.player).mct1.setInfiniteInsulin(true);
        this.log('setInfiniteInsulin');
        this.world.killAll('mobs');
        // world.setSpawnFlags(false, true)
        this.world.setNight();
        this.world.setStorm();
        this.world.preventMobSpawning(['HUSK']);
        // worldly(world).setDestroyWorldIfEmpty(true, 3000)
        // setup endchest contents
        if (this.endChestLocation && this.endChestContents) {
            questTools.putItemsInChest(this.endChestLocation, this.endChestContents);
        }
        // Where are we importing the worlds now??
        if (this.nextQuestName) {
            // pre-import world to make quest start more snappy
            // questCommand(this.nextQuestName, 'import', player, options)
        }
    };
    QuestMCT1.prototype.stop = function () {
        _super.prototype.stop.call(this);
    };
    QuestMCT1.prototype.complete = function () {
        _super.prototype.complete.call(this);
    };
    QuestMCT1.prototype.setMCT1SuperPowers = function (bool) {
        if (bool) {
            user_1.user(this.player).mct1.setSuperCharged(false);
            user_1.user(this.player).mct1.setInfiniteSnowballs(true);
            user_1.user(this.player).mct1.setSuperJump(true);
            user_1.user(this.player).mct1.setSuperSpeed(true);
            user_1.user(this.player).mct1.setNightVision(false);
            // user(player).mct1.start()
        }
        else {
            user_1.user(this.player).mct1.setSuperCharged(false);
            user_1.user(this.player).mct1.setInfiniteSnowballs(false);
            user_1.user(this.player).mct1.setSuperJump(false);
            user_1.user(this.player).mct1.setSuperSpeed(false);
            user_1.user(this.player).mct1.setNightVision(false);
            // user(player).mct1.start()
        }
    };
    QuestMCT1.prototype.openEndGate = function () {
        // if (this.nextQuestName) {
        // 	// pre-import world to make quest start more snappy
        // 	questCommand(nextQuestName, 'import', player, options)
        // }
        if (this.endGateRegion) {
            // End gate effect
            var reg = this.endGateRegion;
            questTools.replaceRegion(reg[0], reg[1], 'AIR');
            questTools.playEffectInRegion(reg[0], reg[1], 'DRAGON_BREATH');
            // this.setInterval(() => {
            //     questTools.playEffectInRegion(reg[0], reg[1], 'PORTAL')
            // }, 500)
        }
    };
    QuestMCT1.prototype.registerEvents = function () {
        var _this = this;
        _super.prototype.registerEvents.call(this);
        if (this.endChestLocation) {
            // inventoryClose
            this.registerEvent('inventoryClose', function (event) {
                if (event.player.name != _this.player.name) {
                    return;
                }
                if (event.inventory.type != 'CHEST') {
                    return;
                }
                // end chest close...
                var cLoc = event.inventory.location;
                var ecLoc = _this.endChestLocation;
                if (cLoc.x === ecLoc.x &&
                    cLoc.y === ecLoc.y &&
                    cLoc.z === ecLoc.z) {
                    _this.openEndGate();
                }
            });
        }
    };
    return QuestMCT1;
}(Quest_1.QuestBase));
exports.QuestMCT1 = QuestMCT1;
