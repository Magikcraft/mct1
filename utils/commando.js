"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var File = java.io.File;
var serverDir = new File('.').getAbsolutePath();
exports.default = require("/" + serverDir + "/scriptcraft/plugins/commando/commando")
    .commando;
