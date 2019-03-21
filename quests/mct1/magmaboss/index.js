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
var Material = Java.type('org.bukkit.Material');
var Location = Java.type('org.bukkit.Location');
var EntityType = Java.type('org.bukkit.entity.EntityType');
var Locations = require('./locs');
var questTools = require("@magikcraft/mct1/quests/quest-tools");
var world_1 = require("@magikcraft/mct1/world");
var arena_stairs_1 = require("./arena-stairs");
var Quest_1 = require("@magikcraft/mct1/quests/Quest");
var QuestMCT1Magmaboss = /** @class */ (function (_super) {
    __extends(QuestMCT1Magmaboss, _super);
    function QuestMCT1Magmaboss(conf) {
        var _this = _super.call(this, conf) || this;
        _this.Locs = Locations.getLocations(_this.world);
        _this.state = {
            bossSceneStarted: false,
            magmaboss: undefined,
        };
        return _this;
    }
    QuestMCT1Magmaboss.prototype.start = function () {
        var _this = this;
        _super.prototype.start.call(this);
        _super.prototype.registerEvents.call(this);
        var _a = this, player = _a.player, world = _a.world, log = _a.log, options = _a.options, Locs = _a.Locs, state = _a.state;
        var regions = Locs.regions, locations = Locs.locations, waypoints = Locs.waypoints;
        // Setup arenaStairs
        this.arenaStairs = new arena_stairs_1.default(Locs.regions.arenaStairs);
        this.arenaStairs.saveRegion();
        this.arenaStairs.hideRegion();
        // Region: complete
        world_1.worldly(world).registerRegion('arenaThreshold', waypoints.arenaThreshold.region[0], waypoints.arenaThreshold.region[1]);
        world_1.worldly(world).registerPlayerEnterRegionEvent('arenaThreshold', function (event) {
            _this.startBossScene();
        });
        this.setTimeout(function () {
            Locs.locations.dispensers.forEach(function (loc) {
                loc.block.setType(Material.DISPENSER);
                loc.block.setData(1);
            });
        }, 1000);
    };
    QuestMCT1Magmaboss.prototype.startBossScene = function () {
        var _this = this;
        var _a = this, player = _a.player, world = _a.world, log = _a.log, options = _a.options, Locs = _a.Locs, state = _a.state;
        if (state.bossSceneStarted)
            return;
        state.bossSceneStarted = true;
        state.magmaboss = world.spawnEntity(Locs.locations.magmabossSpawn, EntityType.MAGMA_CUBE);
        state.magmaboss.setSize(5);
        var marker = questTools.makeInvisibleArmourStand(Locs.locations.magmabossSpawn);
        // Reveal arena stairs once the magmaboss is dead.
        this.setInterval(function () {
            var magambossStillAlive = false;
            marker.getNearbyEntities(40, 20, 40).forEach(function (e) {
                if (e.type == 'MAGMA_CUBE')
                    magambossStillAlive = true;
            });
            if (!magambossStillAlive) {
                _this.arenaStairs.replaceRegion();
            }
        }, 3000);
        // ## helper
        var dispenseLava = function (loc) {
            if (loc.block.type != 'DISPENSER')
                return;
            questTools.shootDispenser(loc.block, 'LAVA_BUCKET');
            var lavaLoc = new Location(loc.world, loc.x, loc.y + 1, loc.z);
            _this.setTimeout(function () {
                lavaLoc.block.setType(Material.AIR);
            }, 7500);
        };
        // Dispense lava on interval
        Locs.locations.dispensers.forEach(function (loc, i) {
            dispenseLava(loc);
            _this.setInterval(function () {
                dispenseLava(loc);
            }, 25000);
        });
    };
    return QuestMCT1Magmaboss;
}(Quest_1.QuestMCT1));
exports.default = QuestMCT1Magmaboss;
