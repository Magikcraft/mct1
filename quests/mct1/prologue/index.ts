// const intervalModifier = -90000 // Useful for testing!
import * as LightingStorm from '../../../fx/lighting-storm'
import * as LightningSuperStrike from '../../../fx/lightning-super-strike'
import { Logger } from '../../../log'
import * as MobTools from '../../../mobs'
import { QuestConfig } from '../../Quest'
import * as questTools from '../../quest-tools'
import { QuestMCT1 } from '../../QuestMCT1'
import * as Locations from './locs'
import Wither from './wither'

const intervalModifier = 60000 // Useful for testing!

const log = Logger(__filename)

export default class QuestMCT1Prologue extends QuestMCT1 {
    public wither: any
    public isUSA: boolean = false

    constructor(conf: QuestConfig) {
        super(conf)
        log('Creating MCT1 Prologue quest')
        this.isUSA = (conf.options.units || 'mmolL').toLowerCase() === 'mgdl'
        this.Locs = Locations.getLocations(this.world.getBukkitWorld())
        this.state = {
            completed: false,
            hasMCT1: false,
        }
        this.wither = new Wither(this.Locs.regions.wither)
    }

    public start() {
        super.start()

        // this.registerEvents(); // called by parent

        this.player.setFoodLevel(15)
        this.mct1Player.mct1.setInfiniteInsulin(false)
        this.mct1Player.mct1.setFoodLevel(20)
        this.mct1Player.mct1.setHealth(20)
        this.mct1Player.mct1.isUSA = this.isUSA
        this.mct1Player.mct1.stop()

        this.world.setDawn()
        this.world.setSun()
        this.world.preventMobSpawning(['HUSK', 'WITHER'])

        // Hide portal.
        questTools.replaceRegionV1(this.Locs.regions.portalOuter, 'AIR')
        questTools.replaceRegionV1(this.Locs.regions.portalGround, 'GRASS')

        this.log(
            `Started quest mct1-prologue for ${
                this.player.name
            }, with intervalModifier: ${intervalModifier}`
        )

        this.setTimeout(() => {
            this.log(`Start Storm!`)
            this.world.setStorm()
        }, Math.max(15000 + intervalModifier, 0))

        this.setTimeout(() => {
            this.log(`Start Lightning!`)
            LightingStorm.start(this.Locs.regions.lightning)
        }, Math.max(30000 + intervalModifier, 0))

        this.setTimeout(() => {
            this.log(`Strike with Lightning!`)
            LightningSuperStrike.kaboom(this.player.location, 5, 20)
            this.mct1Player.mct1.bgl = 5
            this.mct1Player.mct1.insulin = 0
            this.mct1Player.mct1.setSuperCharged(true)
            this.mct1Player.mct1.setInfiniteInsulin(false)
            this.mct1Player.mct1.setInfiniteSnowballs(true)
            this.mct1Player.mct1.setNightVision(true)
            this.mct1Player.mct1.start()
            this.state.hasMCT1 = true

            this.mct1Player.gms() // SURVIVAL mode so player can interact with blocks and shoot snowballs
            this.mct1Player.inventory.setHeldItemSlot(0)

            echo(this.player, 'You got struck by lightning!')
        }, Math.max(45000 + intervalModifier, 0))

        this.setTimeout(() => {
            // first mob wave
            this.log(`Spawning mobs!`)
            const mobType = 'husk'
            const spawnNum = 40
            this.log(`Spawning ${spawnNum} ${mobType}s!`)
            this.spawnMobGroups(mobType, spawnNum)
        }, Math.max(50000 + intervalModifier, 0))

        this.setTimeout(() => {
            this.log(`Here comes the Wither!`)
            this.wither.start()
        }, Math.max(65000 + intervalModifier, 0))

        this.setTimeout(() => {
            this.log(`Turn off God mode`)
            this.mct1Player.mct1.setSuperCharged(false)
            this.mct1Player.mct1.setNightVision(false)
        }, Math.max(135000 + intervalModifier, 0))

        this.setTimeout(() => {
            this.log(`Make Wither hunt Player!`)
            this.wither.setPhase(2)
        }, Math.max(145000 + intervalModifier, 0))
    }

    public stop() {
        super.stop()
        LightingStorm.stop()
        this.wither.stop()
        this.world.setSun()
    }

    public registerEvents() {
        super.registerEvents()

        // Cancel death, make player go blind and float up as if captured.
        this.registerEvent('entityDamage', event => {
            if (event.entity.type != 'PLAYER') {
                return
            }
            if (event.entity.name != this.player.name) {
                return
            }

            if (event.finalDamage >= this.player.health) {
                this.log('canceled deadly damage!')
                event.setCancelled(true)
                if (!this.state.completed) {
                    this.state.completed = true
                    this.mct1Player.effects.add('LEVITATION')
                    this.mct1Player.mct1.bgl = 20 // Make player go blind.

                    setTimeout(() => {
                        this.complete()
                    }, 5000)
                }
            }
        })

        // Launch lightning snowballs on all clicks.
        this.registerEvent('playerInteract', event => {
            if (event.player.name != this.player.name) {
                return
            }
            const actions = [
                'RIGHT_CLICK_BLOCK',
                'RIGHT_CLICK_AIR',
                'LEFT_CLICK_BLOCK',
                'LEFT_CLICK_AIR',
            ]
            if (!this.state.hasMCT1) {
                return
            }
            if (actions.includes(event.action.toString())) {
                event.player.launchProjectile(
                    Java.type('org.bukkit.entity.Snowball').class
                )
            }
        })

        this.registerEvent('entityDamageByEntity', event => {
            // When the player hits a mob, shoot lighting snowball.
            if (event.damager && event.damager.type == 'PLAYER') {
                if (event.damager.name != this.player.name) {
                    return
                }
                event.damager.launchProjectile(
                    Java.type('org.bukkit.entity.Snowball').class
                )
            }
        })
    }

    public spawnMobGroups(mobType, spawnNum) {
        const attackPlayersOnroute = true
        const targetLoc = this.Locs.locations.villageCenter

        // Ensure not more than 100 mobs of mobType in world at one time!
        const maxMobs = 40
        let mobCount = 0
        const bossCount = 0
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
            this.log(`Summoning ${adjustedSpawnNum} mobs of type ${mobType}`)
            this.Locs.locations.mobSpawnPoints.map((spawnLoc, i) => {
                const spawnNumber = Math.round(
                    adjustedSpawnNum / this.Locs.locations.mobSpawnPoints.length
                )
                for (let j = 0; j < spawnNumber; j++) {
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
