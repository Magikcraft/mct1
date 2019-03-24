"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("../log");
var log = log_1.Logger(__filename);
exports.Multiverse = function () {
    return __plugin.server.getPluginManager().getPlugin('Multiverse-Core');
};
exports.destroyWorld = function (name) {
    return new Promise(function (resolve) {
        log('Time I Am, Destroyer of Worlds');
        exports.Multiverse()
            .getMVWorldManager()
            .deleteWorld(name, true, true);
        resolve();
    });
};
