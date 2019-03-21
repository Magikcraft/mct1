"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("@magikcraft/mct1/log");
var Sound = Java.type('org.bukkit.Sound');
var MobTools = require("@magikcraft/mct1/mobs");
var JailBrawl = /** @class */ (function () {
    function JailBrawl(Locs, jailGuard) {
        this.brawlSounds = [
            'ENTITY_LIGHTNING_IMPACT',
            'ENTITY_LIGHTNING_IMPACT',
            'ENTITY_LIGHTNING_IMPACT',
            'ENTITY_ENDERDRAGON_FIREBALL_EXPLODE',
            'ENTITY_WITHER_SKELETON_HURT',
            'ENTITY_WOLF_GROWL',
            'ENTITY_WOLF_GROWL',
            'ENTITY_WOLF_GROWL',
        ];
        this.timers = []; // all mobs stored in here.
        this.Locs = Locs;
        this.log = log_1.Logger(__filename);
        this.jailGuard = jailGuard;
    }
    JailBrawl.prototype.start = function () {
        var _this = this;
        this.initBrawl();
        this.timers.push(setTimeout(function () {
            _this.log('Lure away guard');
            _this.jailGuardLure = MobTools.spawn('armor_stand', _this.Locs.locations.jailGuardLure);
            // jailGuardLure.setVisible(false)
            _this.jailGuard.setTarget(_this.jailGuardLure);
        }, 3000));
    };
    JailBrawl.prototype.stop = function () {
        if (this.jailGuardLure)
            this.jailGuardLure.remove();
    };
    JailBrawl.prototype.initBrawl = function () {
        var _this = this;
        Array.from({ length: 20 }, function (x, i) { return i + 1; })
            .map(function (count) {
            _this.queueBrawlSound(count);
        });
    };
    JailBrawl.prototype.queueBrawlSound = function (count) {
        var _this = this;
        var interval = ((Math.floor(Math.random() * 5) * 400)) + (count * 1000);
        var soundIndex = (Math.floor(Math.random() * this.brawlSounds.length));
        setTimeout(function () {
            var sound = Sound[_this.brawlSounds[soundIndex]];
            _this.Locs.world.playSound(_this.Locs.locations.jailBrawl, sound, 5, 1);
            if (_this.brawlSounds[soundIndex] == 'ENTITY_LIGHTNING_IMPACT') {
                _this.Locs.world.strikeLightning(_this.Locs.locations.jailBrawl);
            }
        }, interval);
    };
    return JailBrawl;
}());
exports.default = JailBrawl;
