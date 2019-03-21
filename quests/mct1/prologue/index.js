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
var Locations = require("./locs");
var LightningSuperStrike = require("@magikcraft/mct1/fx/lightning-super-strike");
var questTools = require("../../quest-tools");
var MobTools = require("@magikcraft/mct1/mobs");
var LightingStorm = require("@magikcraft/mct1/fx/lighting-storm");
var wither_1 = require("./wither");
var user_1 = require("@magikcraft/mct1/user");
var world_1 = require("@magikcraft/mct1/world");
var intervalModifier = 60000; // Useful for testing!
// const intervalModifier = -90000 // Useful for testing!
var Quest_1 = require("@magikcraft/mct1/quests/Quest");
var QuestMCT1Prologue = /** @class */ (function (_super) {
    __extends(QuestMCT1Prologue, _super);
    function QuestMCT1Prologue(conf) {
        var _this = _super.call(this, conf) || this;
        _this.Locs = Locations.getLocations(_this.world);
        _this.state = {
            hasMCT1: false,
            completed: false,
        };
        _this.wither = new wither_1.default(_this.Locs.regions.wither);
        return _this;
    }
    QuestMCT1Prologue.prototype.start = function () {
        var _this = this;
        _super.prototype.start.call(this);
        var _a = this, player = _a.player, world = _a.world, log = _a.log, Locs = _a.Locs;
        // this.registerEvents(); // called by parent
        player.setFoodLevel(15);
        user_1.user(player).mct1.setInfiniteInsulin(false);
        user_1.user(player).mct1.setFoodLevel(20);
        user_1.user(player).mct1.setHealth(20);
        user_1.user(player).mct1.stop();
        world_1.worldly(world).setDawn();
        world_1.worldly(world).setSun();
        world_1.worldly(world).preventMobSpawning(['HUSK', 'WITHER']);
        // Hide portal.
        questTools.replaceRegionV1(Locs.regions.portalOuter, 'AIR');
        questTools.replaceRegionV1(Locs.regions.portalGround, 'GRASS');
        log("Started quest mct1-prologue for " + player.name + ", with intervalModifier: " + intervalModifier);
        this.setTimeout(function () {
            log("Start Storm!");
            world_1.worldly(world).setStorm();
        }, Math.max(15000 + intervalModifier, 0));
        this.setTimeout(function () {
            log("Start Lightning!");
            LightingStorm.start(Locs.regions.lightning);
        }, Math.max(30000 + intervalModifier, 0));
        this.setTimeout(function () {
            log("Strike with Lightning!");
            LightningSuperStrike.kaboom(player.location, 5, 20);
            user_1.user(player).mct1.bgl = 5;
            user_1.user(player).mct1.insulin = 0;
            user_1.user(player).mct1.setSuperCharged(true);
            user_1.user(player).mct1.setInfiniteInsulin(false);
            user_1.user(player).mct1.setInfiniteSnowballs(true);
            user_1.user(player).mct1.setNightVision(true);
            user_1.user(player).mct1.start();
            _this.state.hasMCT1 = true;
            user_1.user(player).gms(); // SURVIVAL mode so player can interact with blocks and shoot snowballs
            user_1.user(player).inventory.setHeldItemSlot(0);
            echo(player, 'You got struck by lightning!');
        }, Math.max(45000 + intervalModifier, 0));
        this.setTimeout(function () {
            // first mob wave
            log("Spawning mobs!");
            var mobType = 'husk';
            var spawnNum = 40;
            log("Spawning " + spawnNum + " " + mobType + "s!");
            _this.spawnMobGroups(mobType, spawnNum);
        }, Math.max(50000 + intervalModifier, 0));
        this.setTimeout(function () {
            log("Here comes the Wither!");
            _this.wither.start();
        }, Math.max(65000 + intervalModifier, 0));
        this.setTimeout(function () {
            log("Turn off God mode");
            user_1.user(player).mct1.setSuperCharged(false);
            user_1.user(player).mct1.setNightVision(false);
        }, Math.max(135000 + intervalModifier, 0));
        this.setTimeout(function () {
            log("Make Wither hunt Player!");
            _this.wither.setPhase(2);
        }, Math.max(145000 + intervalModifier, 0));
    };
    QuestMCT1Prologue.prototype.stop = function () {
        _super.prototype.stop.call(this);
        var _a = this, player = _a.player, world = _a.world, log = _a.log, state = _a.state;
        LightingStorm.stop();
        this.wither.stop();
        world_1.worldly(this.world).setSun();
    };
    QuestMCT1Prologue.prototype.registerEvents = function () {
        var _this = this;
        _super.prototype.registerEvents.call(this);
        var _a = this, player = _a.player, world = _a.world, log = _a.log, state = _a.state;
        // Cancel death, make player go blind and float up as if captured.
        this.registerEvent('entityDamage', function (event) {
            if (event.entity.type != 'PLAYER')
                return;
            if (event.entity.name != player.name)
                return;
            if (event.finalDamage >= player.health) {
                log('canceled deadly damage!');
                event.setCancelled(true);
                if (!state.completed) {
                    state.completed = true;
                    user_1.user(player).effects.add('LEVITATION');
                    user_1.user(player).mct1.bgl = 20; // Make player go blind.
                    setTimeout(function () {
                        _this.complete();
                    }, 5000);
                }
            }
        });
        // Launch lightning snowballs on all clicks.
        this.registerEvent('playerInteract', function (event) {
            if (event.player.name != player.name)
                return;
            var actions = [
                'RIGHT_CLICK_BLOCK',
                'RIGHT_CLICK_AIR',
                'LEFT_CLICK_BLOCK',
                'LEFT_CLICK_AIR',
            ];
            if (!state.hasMCT1)
                return;
            if (actions.includes(event.action.toString())) {
                event.player.launchProjectile(Java.type('org.bukkit.entity.Snowball').class);
            }
        });
        this.registerEvent('entityDamageByEntity', function (event) {
            // When the player hits a mob, shoot lighting snowball.
            if (event.damager && event.damager.type == 'PLAYER') {
                if (event.damager.name != player.name)
                    return;
                event.damager.launchProjectile(Java.type('org.bukkit.entity.Snowball').class);
            }
        });
    };
    QuestMCT1Prologue.prototype.spawnMobGroups = function (mobType, spawnNum) {
        var _this = this;
        var _a = this, player = _a.player, world = _a.world, log = _a.log, options = _a.options, Locs = _a.Locs;
        var attackPlayersOnroute = true;
        var targetLoc = Locs.locations.villageCenter;
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
            log("Summoning " + adjustedSpawnNum + " mobs of type " + mobType);
            Locs.locations.mobSpawnPoints.map(function (spawnLoc, i) {
                var _spawnNum = Math.round(adjustedSpawnNum / Locs.locations.mobSpawnPoints.length);
                for (var j = 0; j < _spawnNum; j++) {
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
}(Quest_1.QuestMCT1));
exports.default = QuestMCT1Prologue;
