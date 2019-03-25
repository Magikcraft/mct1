"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCommand = function (command) {
    return __plugin.server.dispatchCommand(__plugin.server.consoleSender, command);
};
exports.getPlugin = function (pluginName) {
    return __plugin.server.getPluginManager().getPlugin(pluginName);
};
exports.getWorldDir = function () { return __plugin.server.getWorldContainer(); };
