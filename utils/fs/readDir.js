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
        for (var i = 0; i < listOfFiles.length; i++) {
            if (listOfFiles[i].isFile()) {
                files.push(listOfFiles[i].getName());
            }
        }
    }
    return files;
}
exports.readDir = readDir;
