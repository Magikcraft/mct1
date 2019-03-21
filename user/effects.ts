import { Logger } from 'mct1/log'
const log = Logger(`${[__dirname, __filename].join('/')}`)

const PotionEffect = Java.type('org.bukkit.potion.PotionEffect')

export const Effects = {
    ABSORPTION: 'ABSORPTION', // Increases the maximum health of an entity with health that cannot be regenerated, but is refilled every 30 seconds.
    BLINDNESS: 'BLINDNESS', // Blinds an entity.
    CONDUIT_POWER: 'CONDUIT_POWER', // Effects granted by a nearby conduit.
    CONFUSION: 'CONFUSION', // Warps vision on the client.
    DAMAGE_RESISTANCE: 'DAMAGE_RESISTANCE', // Decreases damage dealt to an entity.
    DOLPHINS_GRACE: 'DOLPHINS_GRACE', // Squee'ek uh'k kk'kkkk squeek eee'eek.
    FAST_DIGGING: 'FAST_DIGGING', // Increases dig speed.
    FIRE_RESISTANCE: 'FIRE_RESISTANCE', // Stops fire damage.
    GLOWING: 'GLOWING', // Outlines the entity so that it can be seen from afar.
    HARM: 'HARM', // Hurts an entity.
    HEAL: 'HEAL', // Heals an entity.
    HEALTH_BOOST: 'HEALTH_BOOST', // Increases the maximum health of an entity.
    HUNGER: 'HUNGER', // Increases hunger.
    INCREASE_DAMAGE: 'INCREASE_DAMAGE', // Increases damage dealt.
    INVISIBILITY: 'INVISIBILITY', // Grants invisibility.
    JUMP: 'JUMP', // Increases jump height.
    LEVITATION: 'LEVITATION', // Causes the entity to float into the air.
    LUCK: 'LUCK', // Loot table luck.
    NIGHT_VISION: 'NIGHT_VISION', // Allows an entity to see in the dark.
    POISON: 'POISON', // Deals damage to an entity over time.
    REGENERATION: 'REGENERATION', // Regenerates health.
    SATURATION: 'SATURATION', // Increases the food level of an entity each tick.
    SLOW: 'SLOW', // Decreases movement speed.
    SLOW_DIGGING: 'SLOW_DIGGING', // Decreases dig speed.
    SLOW_FALLING: 'SLOW_FALLING', // Slows entity fall rate.
    SPEED: 'SPEED', // Increases movement speed.
    UNLUCK: 'UNLUCK', // Loot table unluck.
    WATER_BREATHING: 'WATER_BREATHING', // Allows breathing underwater.
    WEAKNESS: 'WEAKNESS', // Decreases damage dealt by an entity.
    WITHER: 'WITHER', //Deals damage to an entity over time and gives the health to the shooter.
}

export default class PlayerEffects {
    player

    constructor(player) {
        this.player = player
    }

    add(effectType) {
        const milliseconds = 100000;
        const color = 'WHITE';
        const amplifier = 1;
        const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType')
        if (this.player.hasPotionEffect(PotionEffectType[effectType]) == true) {
            // Skip if effect already active!
            return
        }
        const Color = Java.type('org.bukkit.Color')
        const duration = milliseconds / 1000 * 40 // 20 tick. 1 tick = 0.05 seconds
        const c = Color[color]
        const l = PotionEffectType[effectType]
        const effect = new PotionEffect(l, duration, amplifier, true, true, c)
        this.player.addPotionEffect(effect)
    }

    cancel(effectType) {
        const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType')
        if (this.player.hasPotionEffect(PotionEffectType[effectType]) == true) {
            this.player.removePotionEffect(PotionEffectType[effectType])
        }
    }
}