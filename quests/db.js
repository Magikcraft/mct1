"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("@magikcraft/mct1/utils/fs");
var DB = /** @class */ (function () {
    function DB(questName) {
        this.questName = questName;
        this.isLoading = true;
        this.filename = "database/questTracking/" + this.questName + ".json";
        this.database = [];
        this.init();
    }
    // get () {
    // 	return (this.database)
    // 		? this.database
    // 		: undefined
    // }
    // getAll () {
    // 	return this.database
    // }
    DB.prototype.push = function (data) {
        this.database.push(data);
        this._save();
    };
    DB.prototype._save = function () {
        // Save to filesystem
        fs.writeFile(this.filename, JSON.stringify(this.database, null, 2));
    };
    DB.prototype.init = function () {
        try {
            // ansync read data from filesystem
            var database = JSON.parse(fs.readFile(this.filename));
            this.database = database;
        }
        catch (e) {
            // Boo JSON.parse
        }
        // Done!
        this.isLoading = false;
    };
    return DB;
}());
exports.default = DB;
