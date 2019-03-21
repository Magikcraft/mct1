"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("mct1/log");
var log = log_1.Logger("" + [__dirname, __filename].join('/'));
var PotionEffect = Java.type('org.bukkit.potion.PotionEffect');
exports.Effects = {
    ABSORPTION: 'ABSORPTION',
    BLINDNESS: 'BLINDNESS',
    CONDUIT_POWER: 'CONDUIT_POWER',
    CONFUSION: 'CONFUSION',
    DAMAGE_RESISTANCE: 'DAMAGE_RESISTANCE',
    DOLPHINS_GRACE: 'DOLPHINS_GRACE',
    FAST_DIGGING: 'FAST_DIGGING',
    FIRE_RESISTANCE: 'FIRE_RESISTANCE',
    GLOWING: 'GLOWING',
    HARM: 'HARM',
    HEAL: 'HEAL',
    HEALTH_BOOST: 'HEALTH_BOOST',
    HUNGER: 'HUNGER',
    INCREASE_DAMAGE: 'INCREASE_DAMAGE',
    INVISIBILITY: 'INVISIBILITY',
    JUMP: 'JUMP',
    LEVITATION: 'LEVITATION',
    LUCK: 'LUCK',
    NIGHT_VISION: 'NIGHT_VISION',
    POISON: 'POISON',
    REGENERATION: 'REGENERATION',
    SATURATION: 'SATURATION',
    SLOW: 'SLOW',
    SLOW_DIGGING: 'SLOW_DIGGING',
    SLOW_FALLING: 'SLOW_FALLING',
    SPEED: 'SPEED',
    UNLUCK: 'UNLUCK',
    WATER_BREATHING: 'WATER_BREATHING',
    WEAKNESS: 'WEAKNESS',
    WITHER: 'WITHER',
};
var PlayerEffects = /** @class */ (function () {
    function PlayerEffects(player) {
        this.player = player;
    }
    PlayerEffects.prototype.add = function (effectType) {
        var milliseconds = 100000;
        var color = 'WHITE';
        var amplifier = 1;
        var PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType');
        if (this.player.hasPotionEffect(PotionEffectType[effectType]) == true) {
            // Skip if effect already active!
            return;
        }
        var Color = Java.type('org.bukkit.Color');
        var duration = milliseconds / 1000 * 40; // 20 tick. 1 tick = 0.05 seconds
        var c = Color[color];
        var l = PotionEffectType[effectType];
        var effect = new PotionEffect(l, duration, amplifier, true, true, c);
        this.player.addPotionEffect(effect);
    };
    PlayerEffects.prototype.cancel = function (effectType) {
        var PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType');
        if (this.player.hasPotionEffect(PotionEffectType[effectType]) == true) {
            this.player.removePotionEffect(PotionEffectType[effectType]);
        }
    };
    return PlayerEffects;
}());
exports.default = PlayerEffects;
