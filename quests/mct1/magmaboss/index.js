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
var questTools = require("../../quest-tools");
var QuestMCT1_1 = require("../../QuestMCT1");
var arena_stairs_1 = require("./arena-stairs");
var Locations = require("./locs");
var Material = Java.type('org.bukkit.Material');
var Location = Java.type('org.bukkit.Location');
var EntityType = Java.type('org.bukkit.entity.EntityType');
var QuestMCT1Magmaboss = /** @class */ (function (_super) {
    __extends(QuestMCT1Magmaboss, _super);
    function QuestMCT1Magmaboss(conf) {
        var _this = _super.call(this, conf) || this;
        _this.Locs = Locations.getLocations(_this.world.getWorld());
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
        var waypoints = this.Locs.waypoints;
        // Setup arenaStairs
        this.arenaStairs = new arena_stairs_1.default(this.Locs.regions.arenaStairs);
        this.arenaStairs.saveRegion();
        this.arenaStairs.hideRegion();
        // Region: complete
        this.world.registerRegion('arenaThreshold', waypoints.arenaThreshold.region[0], waypoints.arenaThreshold.region[1]);
        this.world.registerPlayerEnterRegionEvent('arenaThreshold', function (event) {
            _this.startBossScene();
        });
        this.setTimeout(function () {
            _this.Locs.locations.dispensers.forEach(function (loc) {
                loc.block.setType(Material.DISPENSER);
                loc.block.setData(1);
            });
        }, 1000);
    };
    QuestMCT1Magmaboss.prototype.startBossScene = function () {
        var _this = this;
        if (this.state.bossSceneStarted) {
            return;
        }
        this.state.bossSceneStarted = true;
        this.state.magmaboss = this.world.spawnEntity(this.Locs.locations.magmabossSpawn, EntityType.MAGMA_CUBE);
        this.state.magmaboss.setSize(5);
        var marker = questTools.makeInvisibleArmourStand(this.Locs.locations.magmabossSpawn);
        // Reveal arena stairs once the magmaboss is dead.
        this.setInterval(function () {
            var magambossStillAlive = false;
            marker.getNearbyEntities(40, 20, 40).forEach(function (e) {
                if (e.type == 'MAGMA_CUBE') {
                    magambossStillAlive = true;
                }
            });
            if (!magambossStillAlive) {
                _this.arenaStairs.replaceRegion();
            }
        }, 3000);
        // ## helper
        var dispenseLava = function (loc) {
            if (loc.block.type != 'DISPENSER') {
                return;
            }
            questTools.shootDispenser(loc.block, 'LAVA_BUCKET');
            var lavaLoc = new Location(loc.world, loc.x, loc.y + 1, loc.z);
            _this.setTimeout(function () {
                lavaLoc.block.setType(Material.AIR);
            }, 7500);
        };
        // Dispense lava on interval
        this.Locs.locations.dispensers.forEach(function (loc, i) {
            dispenseLava(loc);
            _this.setInterval(function () {
                dispenseLava(loc);
            }, 25000);
        });
    };
    return QuestMCT1Magmaboss;
}(QuestMCT1_1.QuestMCT1));
exports.default = QuestMCT1Magmaboss;
