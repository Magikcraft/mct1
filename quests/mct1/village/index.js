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
var QuestMCT1_1 = require("../../../quests/QuestMCT1");
var Locations = require("./locs");
var QuestMCT1Village = /** @class */ (function (_super) {
    __extends(QuestMCT1Village, _super);
    function QuestMCT1Village(conf) {
        var _this = _super.call(this, conf) || this;
        _this.Locs = Locations.getLocations(_this.world.getBukkitWorld());
        _super.prototype.registerEvents.call(_this);
        return _this;
    }
    QuestMCT1Village.prototype.start = function () {
        _super.prototype.start.call(this);
        this.world.setDay();
        this.world.setSun();
        this.setMCT1SuperPowers(true);
    };
    return QuestMCT1Village;
}(QuestMCT1_1.QuestMCT1));
exports.default = QuestMCT1Village;
