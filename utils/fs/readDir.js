"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("@magikcraft/mct1/log");
var log = log_1.Logger(__filename);
function readDir(path) {
    var File = Java.type('java.io.File');
    var folder = new File(path);
    var listOfFiles = folder.listFiles();
    var files = [];
    if (listOfFiles && listOfFiles.length) {
        for (var i_1 = 0; i_1 < listOfFiles.length; i_1++) {
            if (listOfFiles[i_1].isFile()) {
                files.push(listOfFiles[i_1].getName());
            }
        }
    }
    return files;
}
exports.readDir = readDir;
