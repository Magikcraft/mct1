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
var QuestMCT1_1 = require("../../QuestMCT1");
var Locations = require("./locs");
var QuestMCT1Breakout = /** @class */ (function (_super) {
    __extends(QuestMCT1Breakout, _super);
    function QuestMCT1Breakout(conf) {
        var _this = _super.call(this, conf) || this;
        _this.Locs = Locations.getLocations(_this.world);
        _this.endPortalRegion = _this.Locs.regions.endPortal;
        return _this;
    }
    QuestMCT1Breakout.prototype.start = function () {
        _super.prototype.start.call(this);
        _super.prototype.registerEvents.call(this);
        this.setMCT1SuperPowers(true);
        this.world.allowMobSpawning();
    };
    return QuestMCT1Breakout;
}(QuestMCT1_1.QuestMCT1));
exports.default = QuestMCT1Breakout;
