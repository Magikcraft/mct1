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
// const intervalModifier = -90000 // Useful for testing!
var core_1 = require("@magikcraft/core");
var LightingStorm = require("../../../fx/lighting-storm");
var LightningSuperStrike = require("../../../fx/lightning-super-strike");
var log_1 = require("../../../log");
var MobTools = require("../../../mobs");
var questTools = require("../../quest-tools");
var QuestMCT1_1 = require("../../QuestMCT1");
var Locations = require("./locs");
var wither_1 = require("./wither");
var intervalModifier = 15000; // 60000 // Useful for testing!
var log = log_1.Logger(__filename);
var QuestMCT1Prologue = /** @class */ (function (_super) {
    __extends(QuestMCT1Prologue, _super);
    function QuestMCT1Prologue(conf) {
        var _this = _super.call(this, conf) || this;
        _this.isUSA = false;
        log('Creating MCT1 Prologue quest');
        _this.isUSA = (conf.options.units || 'mmolL').toLowerCase() === 'mgdl';
        _this.Locs = Locations.getLocations(_this.world.getWorld());
        _this.state = {
            completed: false,
            hasMCT1: false,
        };
        _this.wither = new wither_1.default(_this.Locs.regions.wither);
        return _this;
    }
    QuestMCT1Prologue.prototype.start = function () {
        var _this = this;
        _super.prototype.start.call(this);
        // this.registerEvents(); // called by parent
        this.player.setFoodLevel(15);
        this.mct1Player.mct1.setInfiniteInsulin(false);
        this.mct1Player.mct1.setFoodLevel(20);
        this.mct1Player.mct1.setHealth(20);
        this.mct1Player.mct1.isUSA = this.isUSA;
        this.mct1Player.mct1.stop();
        this.world.setDawn();
        this.world.setSun();
        this.world.preventMobSpawning(['HUSK', 'WITHER']);
        // Hide portal.
        questTools.replaceRegionV1(this.Locs.regions.portalOuter, 'AIR');
        questTools.replaceRegionV1(this.Locs.regions.portalGround, 'GRASS');
        var showIntroMsgSeconds = 20;
        var showIntroMsg = this.setInterval(function () {
            core_1.actionbar(_this.player.name, 'What is this place?? What happened to everyone??', core_1.TextColor.GOLD);
            if (showIntroMsgSeconds-- === 0) {
                _this.clearInterval(showIntroMsg);
            }
        }, 500);
        this.log("Started quest mct1-prologue for " + this.player.name + ", with intervalModifier: " + intervalModifier);
        this.setTimeout(function () {
            _this.log("Start Storm!");
            _this.world.setStorm();
        }, Math.max(15000 + intervalModifier, 0));
        this.setTimeout(function () {
            _this.log("Start Lightning!");
            LightingStorm.start(_this.Locs.regions.lightning);
        }, Math.max(30000 + intervalModifier, 0));
        this.setTimeout(function () {
            _this.log("Strike with Lightning!");
            LightningSuperStrike.kaboom(_this.player.location, 5, 20);
            _this.mct1Player.mct1.bgl = 5;
            _this.mct1Player.mct1.insulin = 0;
            _this.mct1Player.mct1.setSuperCharged(true);
            _this.mct1Player.mct1.setInfiniteInsulin(false);
            _this.mct1Player.mct1.setInfiniteSnowballs(true);
            _this.mct1Player.mct1.setNightVision(true);
            _this.mct1Player.mct1.start();
            _this.state.hasMCT1 = true;
            _this.mct1Player.gms(); // SURVIVAL mode so player can interact with blocks and shoot snowballs
            _this.mct1Player.inventory.setHeldItemSlot(0);
            echo(_this.player, 'You got struck by lightning!');
        }, Math.max(45000 + intervalModifier, 0));
        this.setTimeout(function () {
            // first mob wave
            _this.log("Spawning mobs!");
            var mobType = 'husk';
            var spawnNum = 40;
            _this.log("Spawning " + spawnNum + " " + mobType + "s!");
            _this.spawnMobGroups(mobType, spawnNum);
        }, Math.max(50000 + intervalModifier, 0));
        this.setTimeout(function () {
            _this.log("Here comes the Wither!");
            _this.wither.start();
        }, Math.max(65000 + intervalModifier, 0));
        this.setTimeout(function () {
            _this.log("Turn off God mode");
            core_1.actionbar(_this.player.name, "I don't feel well!", core_1.TextColor.RED);
            _this.mct1Player.startDKA(45).then(function () {
                _this.log('canceled deadly damage!');
                _this.state.completed = true;
                _this.mct1Player.effects.add('LEVITATION');
                _this.mct1Player.mct1.bgl = 20; // Make player go blind.
                setTimeout(function () {
                    _this.complete();
                }, 5000);
            });
            // this.mct1Player.mct1.setSuperCharged(false)
            // this.mct1Player.mct1.setNightVision(false)
        }, Math.max(135000 + intervalModifier, 0));
        this.setTimeout(function () {
            _this.log("Make Wither hunt Player!");
            _this.wither.setPhase(2);
        }, Math.max(145000 + intervalModifier, 0));
    };
    QuestMCT1Prologue.prototype.stop = function () {
        _super.prototype.stop.call(this);
        LightingStorm.stop();
        this.wither.stop();
        this.world.setSun();
    };
    QuestMCT1Prologue.prototype.registerEvents = function () {
        var _this = this;
        _super.prototype.registerEvents.call(this);
        // Cancel death, make player go blind and float up as if captured.
        this.registerEvent('entityDamage', function (event) {
            if (event.entity.type != 'PLAYER') {
                return;
            }
            if (event.entity.name != _this.player.name) {
                return;
            }
            if (event.finalDamage >= _this.player.health) {
                _this.log('canceled deadly damage!');
                event.setCancelled(true);
                if (!_this.state.completed) {
                    _this.state.completed = true;
                    _this.mct1Player.effects.add('LEVITATION');
                    _this.mct1Player.mct1.bgl = 20; // Make player go blind.
                    setTimeout(function () {
                        _this.complete();
                    }, 5000);
                }
            }
        });
        var snowball = Java.type('org.bukkit.entity.Snowball').class;
        // Launch lightning snowballs on all clicks.
        this.registerEvent('playerInteract', function (event) {
            if (event.player.name != _this.player.name) {
                return;
            }
            var actions = [
                'RIGHT_CLICK_BLOCK',
                'RIGHT_CLICK_AIR',
                'LEFT_CLICK_BLOCK',
                'LEFT_CLICK_AIR',
            ];
            if (!_this.state.hasMCT1) {
                return;
            }
            if (actions.includes(event.action.toString())) {
                event.player.launchProjectile(snowball);
            }
        });
        this.registerEvent('entityDamageByEntity', function (event) {
            // When the player hits a mob, shoot lighting snowball.
            if (event.damager && event.damager.type == 'PLAYER') {
                if (event.damager.name != _this.player.name) {
                    return;
                }
                event.damager.launchProjectile(snowball);
            }
        });
    };
    QuestMCT1Prologue.prototype.spawnMobGroups = function (mobType, spawnNum) {
        var _this = this;
        var attackPlayersOnroute = true;
        var targetLoc = this.Locs.locations.villageCenter;
        // Ensure not more than 100 mobs of mobType in world at one time!
        var maxMobs = 40;
        var mobCount = 0;
        var bossCount = 0;
        targetLoc.world.livingEntities.forEach(function (entity) {
            if (entity.type == mobType.toUpperCase()) {
                mobCount++;
            }
        });
        var adjustedSpawnNum = Math.max(Math.min(spawnNum, maxMobs - mobCount), 0);
        if (adjustedSpawnNum > 0) {
            this.log("Summoning " + adjustedSpawnNum + " mobs of type " + mobType);
            this.Locs.locations.mobSpawnPoints.map(function (spawnLoc, i) {
                var spawnNumber = Math.round(adjustedSpawnNum / _this.Locs.locations.mobSpawnPoints.length);
                for (var j = 0; j < spawnNumber; j++) {
                    var mob = MobTools.spawn(mobType, spawnLoc);
                    MobTools.targetLocation(mob, targetLoc, attackPlayersOnroute);
                }
            });
        }
        this.setTimeout(function () {
            _this.spawnMobGroups(mobType, spawnNum);
        }, 5000);
    };
    return QuestMCT1Prologue;
}(QuestMCT1_1.QuestMCT1));
exports.default = QuestMCT1Prologue;
