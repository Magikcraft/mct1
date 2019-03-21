"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("mct1/log");
var log = log_1.Logger("" + [__dirname, __filename].join('/'));
var util = require('utils');
var lightningTimes = 0;
var region;
var times;
var delayMin;
var delayAvg;
var count = 0;
var cap = 0;
var stopped = false;
function start(_region, _delayMin, _delayAvg, _cap) {
    if (_delayMin === void 0) { _delayMin = 500; }
    if (_delayAvg === void 0) { _delayAvg = 2500; }
    if (_cap === void 0) { _cap = Infinity; }
    stopped = false;
    region = _region;
    delayMin = _delayMin || 500;
    delayAvg = _delayAvg || 2500;
    cap = _cap || Infinity;
    _lightningStrike();
}
exports.start = start;
function stop() {
    stopped = true;
}
exports.stop = stop;
function _lightningStrike() {
    if (stopped)
        return;
    var _region = region.randomPoint();
    var _location = _region.toLocation();
    _location.world.strikeLightning(_location);
    var interval = delayMin + (Math.random() * delayAvg);
    var players = _location.world.getPlayers();
    if (players.length >= 1 && count < cap) {
        count++;
        setTimeout(function () {
            _lightningStrike();
        }, interval);
    }
}
