"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@magikcraft/core");
var Mct1BarNamespace = 'mct1-bars';
var BarManagerClass = /** @class */ (function () {
    function BarManagerClass() {
        this.barCache = {};
    }
    BarManagerClass.prototype.getBglBar = function (player) {
        var bars = this.getPlayerCache(player);
        if (!bars.bgl) {
            bars.bgl = new core_1.BossBar(player, Mct1BarNamespace, player.name + "-bgl");
            bars.bgl.style(core_1.BossBar.Style.NOTCHED_20);
        }
        return bars.bgl;
    };
    BarManagerClass.prototype.getInsulinBar = function (player) {
        var bars = this.getPlayerCache(player);
        if (!bars.insulin) {
            bars.insulin = new core_1.BossBar(player, Mct1BarNamespace, player.name + "-insulin");
            bars.insulin
                .color(core_1.BossBar.Color.BLUE)
                .style(core_1.BossBar.Style.NOTCHED_20);
        }
        return bars.insulin;
    };
    BarManagerClass.prototype.getDigestionBar1 = function (player) {
        var bars = this.getPlayerCache(player);
        if (!bars.digestion1) {
            bars.digestion1 = new core_1.BossBar(player, Mct1BarNamespace, player.name + "-digestion1");
            bars.digestion1
                .color(core_1.BossBar.Color.BLUE)
                .style(core_1.BossBar.Style.NOTCHED_20);
        }
        return bars.digestion1;
    };
    BarManagerClass.prototype.getDigestionBar2 = function (player) {
        var bars = this.getPlayerCache(player);
        if (!bars.digestion2) {
            bars.digestion2 = new core_1.BossBar(player, Mct1BarNamespace, player.name + "-digestion2");
            bars.digestion2
                .color(core_1.BossBar.Color.BLUE)
                .style(core_1.BossBar.Style.NOTCHED_20);
        }
        return bars.digestion2;
    };
    BarManagerClass.prototype.removeDigestionBar1 = function (player) {
        this.removeBarsImpl(Mct1BarNamespace + ":" + player.name + "-digestion1");
        delete this.getPlayerCache(player).digestion1;
    };
    BarManagerClass.prototype.removeDigestionBar2 = function (player) {
        this.removeBarsImpl(Mct1BarNamespace + ":" + player.name + "-digestion2");
        delete this.getPlayerCache(player).digestion2;
    };
    BarManagerClass.prototype.removeBars = function (player) {
        this.removeBarsImpl(Mct1BarNamespace + ":" + player.name + "-");
        delete this.getPlayerCache(player).bgl;
        delete this.getPlayerCache(player).insulin;
        delete this.getPlayerCache(player).digestion1;
        delete this.getPlayerCache(player).digestion2;
    };
    BarManagerClass.prototype.removeAllBars = function () {
        this.removeBarsImpl(Mct1BarNamespace + ":");
    };
    BarManagerClass.prototype.removeBarsImpl = function (predicate) {
        var keys = [];
        var bossBars = __plugin.server.getBossBars();
        while (bossBars.hasNext()) {
            var b = bossBars.next();
            keys.push(b.getKey());
        }
        keys.filter(function (k) { return k.toString().indexOf(predicate) === 0; }).forEach(function (k) {
            var bar = __plugin.server.getBossBar(k);
            if (bar) {
                bar.removeAll();
            }
            __plugin.server.removeBossBar(k);
        });
    };
    BarManagerClass.prototype.getPlayerCache = function (player) {
        if (!this.barCache[player.name]) {
            this.barCache[player.name] = {};
        }
        return this.barCache[player.name];
    };
    return BarManagerClass;
}());
var BarManager = new BarManagerClass();
exports.default = BarManager;
