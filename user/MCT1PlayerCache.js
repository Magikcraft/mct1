"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MCT1Player_1 = require("./MCT1Player");
var MCT1PlayerCacheClass = /** @class */ (function () {
    function MCT1PlayerCacheClass() {
        this.cache = {};
    }
    MCT1PlayerCacheClass.prototype.getMct1Player = function (player) {
        if (!player) {
            throw new Error('No Player passed in!');
        }
        if (!MCT1PlayerCache.cache[player.name]) {
            MCT1PlayerCache.cache[player.name] = new MCT1Player_1.default(player);
        }
        return MCT1PlayerCache.cache[player.name];
    };
    MCT1PlayerCacheClass.prototype.deleteMct1Player = function (player) {
        if (MCT1PlayerCache.cache[player.name]) {
            MCT1PlayerCache.cache[player.name].cleanse();
            MCT1PlayerCache.cache[player.name] = undefined;
        }
    };
    return MCT1PlayerCacheClass;
}());
var MCT1PlayerCache = new MCT1PlayerCacheClass();
exports.default = MCT1PlayerCache;
