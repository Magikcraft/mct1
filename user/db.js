"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("@magikcraft/mct1/utils/fs");
var log_1 = require("@magikcraft/mct1/log");
var log = log_1.Logger(__filename);
var DB = /** @class */ (function () {
    function DB(player) {
        this.player = player;
        this.isLoading = true;
        this.filename = "database/players/" + this.player.name + ".json";
        this.database = {};
        this.init();
    }
    DB.prototype.get = function (key) {
        return (this.database[key])
            ? this.database[key]
            : undefined;
    };
    DB.prototype.getAll = function () {
        return this.database;
    };
    DB.prototype.set = function (key, data) {
        this.database[key] = data;
        this._save();
    };
    DB.prototype.delete = function (key) {
        delete this.database[key];
        this._save();
    };
    DB.prototype.dump = function () {
        log("DB Data for " + this.player.name + ":", JSON.stringify(this.database, null, 2));
    };
    DB.prototype._save = function () {
        // Save to filesystem
        fs.writeFile(this.filename, JSON.stringify(this.database, null, 2));
        // TODO:
        this.exportRemote();
    };
    DB.prototype.init = function () {
        // TODO:
        this.fetchRemote();
        try {
            // ansync read data from filesystem
            var database = JSON.parse(fs.readFile(this.filename));
            this.database = database;
        }
        catch (e) {
            // Fuck JSON.parse
        }
        // Done!
        this.isLoading = false;
        // TEMP
        // this.dump()
    };
    DB.prototype.fetchRemote = function () {
        // ansync fetch all player data from remote DB
        // TODO
    };
    DB.prototype.exportRemote = function () {
        // async send player data row to remote DB
        // TODO
    };
    return DB;
}());
exports.default = DB;
