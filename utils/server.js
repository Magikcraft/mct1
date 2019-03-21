"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCommand = function (command) {
    return __plugin.server.dispatchCommand(__plugin.server.consoleSender, command);
};
