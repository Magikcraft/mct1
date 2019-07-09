import { Logger } from '../../../log'
import * as MobTools from '../../../mobs'
const log = Logger(__filename)

const Sound = Java.type('org.bukkit.Sound')

export default class JailBrawl {
    log: any
    jailGuard: any
    jailGuardLure: any
    brawlSounds = [
        'ENTITY_LIGHTNING_BOLT_IMPACT',
        'ENTITY_LIGHTNING_BOLT_IMPACT',
        'ENTITY_LIGHTNING_BOLT_IMPACT',
        'ENTITY_DRAGON_FIREBALL_EXPLODE',
        'ENTITY_WITHER_SKELETON_HURT',
        'ENTITY_WOLF_GROWL',
        'ENTITY_WOLF_GROWL',
        'ENTITY_WOLF_GROWL',
    ]
    Locs: any
    timers: Array<any> = [] // all mobs stored in here.

    constructor(Locs, jailGuard) {
        this.Locs = Locs
        this.jailGuard = jailGuard
    }

    start() {
        this.initBrawl()

        this.timers.push(
            setTimeout(() => {
                log('Lure away guard')
                this.jailGuardLure = MobTools.spawn(
                    'armor_stand',
                    this.Locs.locations.jailGuardLure
                )
                // jailGuardLure.setVisible(false)
                this.jailGuard.setTarget(this.jailGuardLure)
            }, 3000)
        )
    }

    stop() {
        if (this.jailGuardLure) this.jailGuardLure.remove()
    }

    initBrawl() {
        Array.from({ length: 20 }, (x, i) => i + 1).map(count => {
            this.queueBrawlSound(count)
        })
    }

    queueBrawlSound(count) {
        const interval = Math.floor(Math.random() * 5) * 400 + count * 1000
        const soundIndex = Math.floor(Math.random() * this.brawlSounds.length)

        setTimeout(() => {
            const sound = Sound[this.brawlSounds[soundIndex]]
            this.Locs.world.playSound(
                this.Locs.locations.jailBrawl,
                sound,
                5,
                1
            )

            if (this.brawlSounds[soundIndex] == 'ENTITY_LIGHTNING_IMPACT') {
                this.Locs.world.strikeLightning(this.Locs.locations.jailBrawl)
            }
        }, interval)
    }
}
