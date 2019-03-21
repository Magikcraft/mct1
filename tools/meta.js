"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FixedMetadataValue = Java.type('org.bukkit.metadata.FixedMetadataValue');
exports.meta = function (metadatable) {
    return new Metadatable(metadatable);
};
var Metadatable = /** @class */ (function () {
    function Metadatable(metadatable) {
        this.metadatable = metadatable;
    }
    Metadatable.prototype.get = function (key) {
        if (!this.has(key))
            return undefined;
        return JSON.parse(this.metadatable.getMetadata(key).get(0).value());
    };
    Metadatable.prototype.set = function (key, value) {
        this.metadatable.setMetadata(key, new FixedMetadataValue(__plugin, JSON.stringify(value)));
    };
    Metadatable.prototype.remove = function (key) {
        this.metadatable.removeMetadata(key, __plugin);
    };
    Metadatable.prototype.has = function (key) {
        return this.metadatable.hasMetadata(key);
    };
    return Metadatable;
}());
