import * as LightingStorm from '@magikcraft/mct1/fx/lighting-storm'
import * as LightningSuperStrike from '@magikcraft/mct1/fx/lightning-super-strike'
import * as MobTools from '@magikcraft/mct1/mobs'
// const intervalModifier = -90000 // Useful for testing!
import { QuestConfig, QuestMCT1 } from '@magikcraft/mct1/quests/Quest'
import { user } from '@magikcraft/mct1/user'
import { worldly } from '@magikcraft/mct1/world'
import * as questTools from '../../quest-tools'
import * as Locations from './locs'
import Wither from './wither'

const intervalModifier = 60000 // Useful for testing!

export default class QuestMCT1Prologue extends QuestMCT1 {
    wither: any
    isUSA: boolean = false

    constructor(conf: QuestConfig) {
        super(conf)
        this.isUSA = (conf.options.units || 'mmolL').toLowerCase() === 'mgdl'
        this.Locs = Locations.getLocations(this.world)
        this.state = {
            hasMCT1: false,
            completed: false,
        }
        this.wither = new Wither(this.Locs.regions.wither)
    }

    start() {
        super.start()

        const { player, world, log, Locs } = this

        // this.registerEvents(); // called by parent

        player.setFoodLevel(15)
        user(player).mct1.setInfiniteInsulin(false)
        user(player).mct1.setFoodLevel(20)
        user(player).mct1.setHealth(20)
        user(player).mct1.isUSA = this.isUSA
        user(player).mct1.stop()

        worldly(world).setDawn()
        worldly(world).setSun()
        worldly(world).preventMobSpawning(['HUSK', 'WITHER'])

        // Hide portal.
        questTools.replaceRegionV1(Locs.regions.portalOuter, 'AIR')
        questTools.replaceRegionV1(Locs.regions.portalGround, 'GRASS')

        log(
            `Started quest mct1-prologue for ${
                player.name
            }, with intervalModifier: ${intervalModifier}`
        )

        this.setTimeout(() => {
            log(`Start Storm!`)
            worldly(world).setStorm()
        }, Math.max(15000 + intervalModifier, 0))

        this.setTimeout(() => {
            log(`Start Lightning!`)
            LightingStorm.start(Locs.regions.lightning)
        }, Math.max(30000 + intervalModifier, 0))

        this.setTimeout(() => {
            log(`Strike with Lightning!`)
            LightningSuperStrike.kaboom(player.location, 5, 20)

            user(player).mct1.lungFunction = 5
            user(player).mct1.insulin = 0
            user(player).mct1.setSuperCharged(true)
            user(player).mct1.setInfiniteInsulin(false)
            user(player).mct1.setInfiniteSnowballs(true)
            user(player).mct1.setNightVision(true)
            user(player).mct1.start()
            this.state.hasMCT1 = true

            user(player).gms() // SURVIVAL mode so player can interact with blocks and shoot snowballs
            user(player).inventory.setHeldItemSlot(0)

            echo(player, 'You got struck by lightning!')
        }, Math.max(45000 + intervalModifier, 0))

        this.setTimeout(() => {
            // first mob wave
            log(`Spawning mobs!`)
            const mobType = 'husk'
            const spawnNum = 40
            log(`Spawning ${spawnNum} ${mobType}s!`)
            this.spawnMobGroups(mobType, spawnNum)
        }, Math.max(50000 + intervalModifier, 0))

        this.setTimeout(() => {
            log(`Here comes the Wither!`)
            this.wither.start()
        }, Math.max(65000 + intervalModifier, 0))

        this.setTimeout(() => {
            log(`Turn off God mode`)
            user(player).mct1.setSuperCharged(false)
            user(player).mct1.setNightVision(false)
        }, Math.max(135000 + intervalModifier, 0))

        this.setTimeout(() => {
            log(`Make Wither hunt Player!`)
            this.wither.setPhase(2)
        }, Math.max(145000 + intervalModifier, 0))
    }

    stop() {
        super.stop()
        const { player, world, log, state } = this
        LightingStorm.stop()
        this.wither.stop()
        worldly(this.world).setSun()
    }

    registerEvents() {
        super.registerEvents()
        const { player, world, log, state } = this

        // Cancel death, make player go blind and float up as if captured.
        this.registerEvent('entityDamage', event => {
            if (event.entity.type != 'PLAYER') return
            if (event.entity.name != player.name) return

            if (event.finalDamage >= player.health) {
                log('canceled deadly damage!')
                event.setCancelled(true)
                if (!state.completed) {
                    state.completed = true
                    user(player).effects.add('LEVITATION')
                    user(player).mct1.lungFunction = 20 // Make player go blind.

                    setTimeout(() => {
                        this.complete()
                    }, 5000)
                }
            }
        })

        // Launch lightning snowballs on all clicks.
        this.registerEvent('playerInteract', event => {
            if (event.player.name != player.name) return
            const actions = [
                'RIGHT_CLICK_BLOCK',
                'RIGHT_CLICK_AIR',
                'LEFT_CLICK_BLOCK',
                'LEFT_CLICK_AIR',
            ]
            if (!state.hasMCT1) return
            if (actions.includes(event.action.toString())) {
                event.player.launchProjectile(
                    Java.type('org.bukkit.entity.Snowball').class
                )
            }
        })

        this.registerEvent('entityDamageByEntity', event => {
            // When the player hits a mob, shoot lighting snowball.
            if (event.damager && event.damager.type == 'PLAYER') {
                if (event.damager.name != player.name) return
                event.damager.launchProjectile(
                    Java.type('org.bukkit.entity.Snowball').class
                )
            }
        })
    }

    spawnMobGroups(mobType, spawnNum) {
        const { player, world, log, options, Locs } = this

        const attackPlayersOnroute = true
        const targetLoc = Locs.locations.villageCenter

        // Ensure not more than 100 mobs of mobType in world at one time!
        const maxMobs = 40
        let mobCount = 0
        let bossCount = 0
        targetLoc.world.livingEntities.forEach(entity => {
            if (entity.type == mobType.toUpperCase()) {
                mobCount++
            }
        })

        const adjustedSpawnNum = Math.max(
            Math.min(spawnNum, maxMobs - mobCount),
            0
        )

        if (adjustedSpawnNum > 0) {
            log(`Summoning ${adjustedSpawnNum} mobs of type ${mobType}`)
            Locs.locations.mobSpawnPoints.map(function(spawnLoc, i) {
                const _spawnNum = Math.round(
                    adjustedSpawnNum / Locs.locations.mobSpawnPoints.length
                )
                for (var j = 0; j < _spawnNum; j++) {
                    const mob = MobTools.spawn(mobType, spawnLoc)
                    MobTools.targetLocation(
                        mob,
                        targetLoc,
                        attackPlayersOnroute
                    )
                }
            })
        }

        this.setTimeout(() => {
            this.spawnMobGroups(mobType, spawnNum)
        }, 5000)
    }
}
