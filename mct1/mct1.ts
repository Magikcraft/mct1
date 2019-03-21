import events = require('events')
import inventory = require('inventory')
import items = require('items')
const Material = Java.type('org.bukkit.Material')

import { BossBar } from '@magikcraft/mct1/bossbar'
import { IBossBar } from '@magikcraft/mct1/bossbar/bossbar'
import { Logger } from '@magikcraft/mct1/log'
const log = Logger(__filename)

import { activityCosts, activityTypes } from './activities'
import foods from './foods'

const Color = Java.type('org.bukkit.Color')

const Food: any = {}
foods.forEach(item => (Food[item.type] = item))

let _bar: IBossBar

import { user } from '@magikcraft/mct1/user'

export class MCT1 {
    player: BukkitPlayer

    isSprinting: boolean = false

    bgl: number = 4
    insulin: number = 0
    // this is an abstraction of the native food level which seems to get rounded to nearest 0.5.
    // It is used to gain a more fine grained control of player food level
    foodLevel: number
    digestionQueue: any = []
    insulinSensitivityMultiplier: number = 1

    digestionTimer: any
    eventListeners: any = []

    isUSA: boolean = false
    bars = {
        bgl: _bar,
        insulin: _bar,
        digestion1: _bar,
        digestion2: _bar,
    }

    moveActivityLog: any = []
    nonMoveActivityLog: any = []
    superActivityMultiplier: number = 1.1

    name: string

    isSuperCharged: boolean = false
    debugMode: boolean = false

    hasLightningSnowballs: boolean = true
    hasInfiniteInsulin: boolean = true
    hasSuperSpeed: boolean = true
    hasSuperJump: boolean = true
    hasNightVision: boolean = false

    snowballSlot: number = 0
    insulinSlot: number = 1

    isStarted: boolean = false

    constructor(player) {
        this.player = player
        this.name = player.name
        this.foodLevel = this.player.foodLevel
    }

    start() {
        this.stop() // first stop, in case already running

        this.bgl = 5
        this.insulin = 0
        this.setFoodLevel(this.player.foodLevel)
        this.digestionQueue = []

        this.registerEvents()
        this.startDigestion()
        this.renderBars()
        this.doEffects()

        if (this.hasLightningSnowballs) this.ensureInfiniteSnowballs()
        else this.removeInfiniteSnowballs()

        if (this.hasInfiniteInsulin) this.ensureInfiniteInsulin()
        else this.removeInfiniteInsulin()

        this.isStarted = true
    }

    stop() {
        this.unregisterEvents()
        this.stopDigestion()
        this.removeBars()
        this.cancelEffects()
        this.isStarted = false
    }

    setDebugMode(bool: boolean) {
        if (bool) {
            echo(this.player, `MCT1 debug ON`)
            this.debugMode = true
            this.setInfiniteInsulin(true)
            this.setInfiniteSnowballs(true)
            this.setSuperJump(true)
            this.setSuperSpeed(true)
            this.setDemoInventory()
            this.start()
        } else {
            echo(this.player, `MCT1 debug OFF`)
            this.debugMode = false
        }
    }

    setSuperSpeed = (bool: boolean) => (this.hasSuperSpeed = bool)
    setSuperJump = (bool: boolean) => (this.hasSuperJump = bool)
    setNightVision = (bool: boolean) => (this.hasNightVision = bool)

    setFoodLevel(float: number) {
        this.foodLevel = Math.min(float, 20)
        this.player.setFoodLevel(Math.round(this.foodLevel * 2) / 2)
    }

    setHealth(float: number) {
        this.player.setHealth(float)
    }

    setInfiniteSnowballs(bool: boolean) {
        this.hasLightningSnowballs = bool
        // If MCT1 is running, update inventory, else will be done on start.
        if (this.isStarted) {
            if (bool) this.ensureInfiniteSnowballs()
            else this.removeInfiniteSnowballs()
        }
    }

    setInfiniteInsulin(bool: boolean) {
        this.hasInfiniteInsulin = bool
        // If MCT1 is running, update inventory, else will be done on start.
        if (this.isStarted) {
            if (bool) this.ensureInfiniteInsulin()
            else this.removeInfiniteInsulin()
        }
    }

    setSuperCharged(bool: boolean) {
        const server = __plugin.server
        const sender = __plugin.server.consoleSender

        if (bool) {
            // this.cancelNegativeEffects()
            // this.cancelSuperPowers()
            this.isSuperCharged = true
            this.hasNightVision = true
            this.player.setHealth(20)
            this.setFoodLevel(20)
            // server.dispatchCommand(sender, `god ${this.player.name} ON`)
            user(this.player).setGodMode(true)
            this.giveSuperPowers()
        } else {
            this.isSuperCharged = false
            user(this.player).setGodMode(false)
            // server.dispatchCommand(sender, `god ${this.player.name} OFF`)
            this.cancelSuperPowers()
        }
    }

    inHealthyRange = () => this.bgl >= 4 && this.bgl <= 8

    registerEvents() {
        log('registerEvents')
        this.eventListeners.push(
            events.playerItemConsume(this._playerItemConsume),
            events.playerToggleSprint(this._playerToggleSprint),
            events.playerMove(this._playerMove),
            events.blockBreak(this._blockBreak),
            events.entityShootBow(this._entityShootBow),
            events.playerInteract(this._playerInteract),
            events.entityDamage(this._entityDamage),
            events.projectileLaunch(this._projectileLaunch),
            events.projectileHit(this._projectileHit),
            events.inventoryClick(this._inventoryClick),
            events.playerDeath(this._playerDeath),
            events.playerRespawn(this._playerRespawn),
            events.entityRegainHealth(this._entityRegainHealth),
            events.foodLevelChange(this._foodLevelChange),
            events.playerDropItem(this._playerDropItem)
        )
    }

    unregisterEvents = () => {
        log(`Unregistering events for ${this.name}`)
        this.eventListeners.forEach((listener, i) => {
            listener.unregister()
            delete this.eventListeners[i]
        })
    }

    renderBars() {
        // bars.bgl color
        let color = 'GREEN'
        if (this.bgl >= 4 && this.bgl <= 8) {
            color = 'GREEN'
        } else if (
            (this.bgl < 4 && this.bgl > 2) ||
            (this.bgl > 8 && this.bgl <= 12)
        ) {
            color = 'YELLOW'
        } else {
            color = 'RED'
        }
        // bars.bgl
        let bgl = Math.round(this.bgl * 10) / 10
        if (this.isUSA) {
            bgl = Math.round(bgl * 18)
        }

        if (!this.bars.bgl) {
            this.bars.bgl = BossBar.bar('', this.player)
            this.bars.bgl.style(BossBar.style.NOTCHED_20).render()
        }

        this.bars.bgl
            .text(`BGL: ${bgl}`) // round to 1 decimal
            .color(BossBar.color[color])
            .progress((this.bgl / 20) * 100)

        // bars.insulin
        if (!this.bars.insulin) {
            this.bars.insulin = BossBar.bar('', this.player)
            this.bars.insulin
                .color(BossBar.color.BLUE)
                .style(BossBar.style.NOTCHED_20)
                .render()
        }

        const insulinLabel = Math.round(this.insulin * 10) / 10
        const insulinPercent = (this.insulin / 20) * 100

        this.bars.insulin
            .text(`Insulin: ${insulinLabel}`) // round to 1 decimal
            .progress(insulinPercent) // insulin as percentage, rounded to 1 decimal

        // Bring high GI items to top of digestionQueue
        const highGIItems = this.digestionQueue.filter(
            item => item.food.GI === 'high'
        )
        const lowGIItems = this.digestionQueue.filter(
            item => item.food.GI === 'low'
        )
        this.digestionQueue = highGIItems.concat(lowGIItems)

        // digestion Bar(s)
        const digestionItems = this.digestionQueue.slice(0, 2)
        if (!digestionItems[0] && this.bars.digestion1)
            this.bars.digestion1.remove()
        if (!digestionItems[1] && this.bars.digestion2)
            this.bars.digestion2.remove()

        digestionItems.forEach((item, i) => {
            const index = `digestion${i + 1}`
            const percentDigested = (item.carbsDigested / item.food.carbs) * 100

            if (!this.bars[index]) {
                this.bars[index] = BossBar.bar('', this.player)
                    .style(BossBar.style.NOTCHED_20)
                    .render()
            }

            const label = this.debugMode
                ? `Digesting: ${item.food.type.replace('_', ' ')}, ${
                      item.food.carbs
                  } carbs, ${item.food.GI} GI`
                : `Digesting: ${item.food.type.replace('_', ' ')}`

            this.bars[index]
                .text(label)
                .color(
                    item.food.GI === 'high'
                        ? BossBar.color.PINK
                        : BossBar.color.PURPLE
                )
                .progress(100 - percentDigested)
                .render()
        })
    }

    removeBars() {
        if (this.bars.bgl) {
            this.bars.bgl.remove()
            this.bars.bgl = undefined as any
        }
        if (this.bars.insulin) {
            this.bars.insulin.remove()
            this.bars.insulin = undefined as any
        }
        if (this.bars.digestion1) {
            this.bars.digestion1.remove()
            this.bars.digestion1 = undefined as any
        }
        if (this.bars.digestion2) {
            this.bars.digestion2.remove()
            this.bars.digestion2 = undefined as any
        }
    }

    startDigestion(tickCount = 1) {
        this.digestionTimer = setInterval(() => {
            // Do digestion if not dead!
            if (!this.player.isDead()) {
                this.digestion(tickCount)
                tickCount++
            }
        }, 1000)
    }

    stopDigestion() {
        if (this.digestionTimer) {
            clearInterval(this.digestionTimer)
            this.digestionTimer = undefined
        }
    }

    digestion(tickCount) {
        if (tickCount % 5 === 0) {
            const totalActivityCost = this.calculateTotalActivityCost()
            this.resetActivityLogs()
            this.setInsulinSensitivity(totalActivityCost)

            if (!this.isSuperCharged) {
                // only do if NOT isSuperCharged
                const reduceFoodAmount = totalActivityCost / 1.5
                this.setFoodLevel(
                    Math.max(this.foodLevel - reduceFoodAmount, 0)
                )
            }
        }

        // Every 10 ticks...
        if (tickCount % 10 === 0) {
            // bgl rises slowly, even if not digesting...
            this.bgl += 0.1

            // If this.player has food in digestionQueue, up foodlevel
            if (this.digestionQueue && this.digestionQueue.length > 0) {
                this.setFoodLevel(Math.min(this.foodLevel + 1, 20))
            }
        }

        // Every 5 ticks...
        if (tickCount % 5 === 0 && this.digestionQueue[0]) {
            // Regenerate if inHealthyRange
            if (this.inHealthyRange()) {
                this.player.setHealth(Math.min(this.player.health + 0.5, 20))
            }
        }

        // handle insulin in system
        if (this.insulin > 0) {
            this.insulin = Math.max(this.insulin - 0.1, 0)
            this.bgl -= 0.15 * this.insulinSensitivityMultiplier
            // log('Insulin effect of bgl: ', (0.15 * this.insulinSensitivityMultiplier))
        }

        // handle digestionQueue
        if (this.digestionQueue[0]) {
            if (this.digestionQueue[0].food.GI === 'high') {
                // high GI, digest faster...
                this.digestionQueue[0].carbsDigested += 1
                this.bgl += 0.2
            } else {
                // low GI, digest slower...
                this.digestionQueue[0].carbsDigested += 0.5
                this.bgl += 0.1
            }

            if (this.insulin > 0) {
                // if insulin in system, boost health!
                if (this.player.health < 20) {
                    this.player.setHealth(
                        Math.min(this.player.health + 0.5, 20)
                    )
                }
            }
            if (
                this.digestionQueue[0].carbsDigested >=
                this.digestionQueue[0].food.carbs
            ) {
                // finished digesting... remove from queue...
                this.digestionQueue.splice(0, 1)
            }
        }

        // bgl should never go below 2!
        if (this.bgl < 2) {
            this.bgl = 2
        }
        // bgl should never go above 20!
        if (this.bgl > 20) {
            this.bgl = 20
        }

        this.renderBars()
        this.doEffects()

        // Never allow this.player to be full!
        if (this.foodLevel >= 20) {
            this.setFoodLevel(19.5)
        }
    }

    doEffects() {
        if (this.bgl >= 4 && this.bgl <= 8) {
            // Healthy Range
            this.cancelNegativeEffects()
            this.giveSuperPowers()
        } else {
            // Out of range...
            this.cancelSuperPowers()
            this.giveNegativeEffects()
        }
    }

    cancelEffects() {
        this.cancelNegativeEffects()
        this.cancelSuperPowers()
    }

    giveNegativeEffects() {
        // Confusion!
        if (
            (this.bgl < 4 && this.bgl >= 3) ||
            (this.bgl > 8 && this.bgl <= 12)
        ) {
            this._makeEffect('CONFUSION', 3500)
        }
        // More Confusion!
        else if (this.bgl < 3 || this.bgl > 16) {
            this._makeEffect('CONFUSION', 6000)
        }
        // Layer additional effects.
        if (this.bgl <= 2 || this.bgl >= 16) {
            this._makeEffect('BLINDNESS', 5000)
            this._makeEffect('POISON', 5000)
        }
    }

    cancelNegativeEffects() {
        this._cancelEffect('CONFUSION')
        this._cancelEffect('BLINDNESS')
        this._cancelEffect('POISON')
    }

    giveSuperPowers() {
        if (this.hasSuperSpeed) this._makeEffect('SPEED', 10000000, 'WHITE', 2)
        if (this.hasSuperJump) this._makeEffect('JUMP', 10000000, 'WHITE', 1)
        if (this.hasNightVision)
            this._makeEffect('NIGHT_VISION', 10000000, 'WHITE', 1)

        if (this.isSuperCharged) {
            this._makeEffect('GLOWING', 10000000, 'WHITE')
            this._makeEffect('REGENERATION', 10000000, 'WHITE')
        }
    }

    cancelSuperPowers() {
        this._cancelEffect('SPEED')
        this._cancelEffect('JUMP')
        this._cancelEffect('GLOWING')
        this._cancelEffect('NIGHT_VISION')
        this._cancelEffect('REGENERATION')
    }

    _makeEffect(type, milliseconds, color = 'GREEN', amplifier = 1) {
        const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType')
        if (
            this.player &&
            this.player.hasPotionEffect(PotionEffectType[type]) == true
        ) {
            // Skip if effect already active!
            return
        }

        const PotionEffect = Java.type('org.bukkit.potion.PotionEffect')
        const Color = Java.type('org.bukkit.Color')
        const duration = (milliseconds / 1000) * 40 // 20 tick. 1 tick = 0.05 seconds
        const c = Color[color]
        const l = PotionEffectType[type]
        const effect = new PotionEffect(l, duration, amplifier, true, true, c)
        this.player.addPotionEffect(effect)
    }

    _cancelEffect(type) {
        const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType')
        if (
            this.player &&
            this.player.hasPotionEffect(PotionEffectType[type]) == true
        ) {
            this.player.removePotionEffect(PotionEffectType[type])
        }
    }

    resetActivityLogs() {
        this.moveActivityLog = []
        this.nonMoveActivityLog = []
    }

    calculateTotalActivityCost() {
        const moveActivities = this.extractActivitiesFromMoveLog()
        const nonMoveActivities = this.nonMoveActivityLog

        // Join activity arrays into a single activities array
        const activities = moveActivities.concat(nonMoveActivities)

        // log('######### activities #########')
        // activities.forEach(activity => log(activity))

        let totalActivityCost = 0
        activities.forEach(activity => {
            let isSuper = false
            if (activity.includes('SUPER_')) {
                isSuper = true
                activity = activity.replace('SUPER_', '')
            }
            const activityCost = parseFloat(activityCosts[activity])
            totalActivityCost += isSuper
                ? activityCost * this.superActivityMultiplier
                : activityCost
        })

        return totalActivityCost
    }

    setInsulinSensitivity(totalActivityCost) {
        if (totalActivityCost >= 0 && totalActivityCost <= 0.075) {
            this.insulinSensitivityMultiplier = 1
        } else if (totalActivityCost > 0.075 && totalActivityCost <= 0.5) {
            this.insulinSensitivityMultiplier = 1.2
        } else if (totalActivityCost > 0.5 && totalActivityCost <= 1.25) {
            this.insulinSensitivityMultiplier = 1.5
        } else if (totalActivityCost > 1.25) {
            this.insulinSensitivityMultiplier = 1.8
        }
    }

    extractActivitiesFromMoveLog() {
        let activities: any = []

        // iterate over moveActivityLog and determine activities
        let distTravelled = 0
        this.moveActivityLog.forEach((mLog, i) => {
            const isUpward = mLog.to.y.toFixed(2) > mLog.from.y.toFixed(2)

            let activity
            if (mLog.blockType == 'LADDER')
                activity = activityTypes.CLIMB_LADDER
            else if (mLog.blockType == 'VINE')
                activity = activityTypes.CLIMB_VINE
            else if (mLog.blockType.includes('WATER'))
                activity = activityTypes.SWIM
            else if (isUpward && mLog.isSprinting)
                activity = activityTypes.SPRINT_JUMP
            else if (isUpward) activity = activityTypes.JUMP
            else if (mLog.isSprinting) activity = activityTypes.SPRINT
            else activity = activityTypes.WALK

            if (mLog.isSuper) activity = `SUPER_${activity}`

            // calc distTravelled
            const xDiff = mLog.to.x - mLog.from.x
            const yDiff = mLog.to.y - mLog.from.y
            const distVertical = mLog.to.z - mLog.from.z
            const distHorizontal = Math.sqrt(xDiff * xDiff + yDiff * yDiff)
            const distTotal = Math.sqrt(
                distVertical * distVertical + distHorizontal * distHorizontal
            )

            // log('distTotal: ' + distTotal);
            distTravelled += distTotal
            if (distTravelled >= 1) {
                distTravelled -= 1 // reset

                if (
                    activity == activityTypes.SPRINT_JUMP ||
                    activity == activityTypes.JUMP
                ) {
                    const lastActitiy = activities[activities.length - 1]
                    if (activity != lastActitiy) activities.push(activity)
                } else {
                    activities.push(activity)
                }
            }
        })

        return activities
    }

    private _playerItemConsume = event => {
        // Skip if not this.player
        if (event.player.name != this.player.name) return

        // Act on know FOOD eat...
        if (Food[event.item.type]) {
            log(`${this.player} ate a ${event.item.type}!`)
            const item = {
                timestamp: Math.floor(Date.now() / 1000),
                food: Food[event.item.type],
                carbsDigested: 0,
            }
            this.digestionQueue.push(item)
            this.renderBars()

            if (this.debugMode) {
                echo(
                    this.player,
                    `You ate a ${event.item.type}, carbs ${
                        Food[event.item.type].carbs
                    }, GI ${Food[event.item.type].GI}.`
                )
            }
        }
        // Act on POTION drink... (insulin)
        else if (this.isInsulinStack(event.item)) {
            // important! use double arrow (not triple)
            log(`${this.player.name} drank an INSULIN POTION!`)
            this.insulin = Math.min(this.insulin + 2, 20)
            this.renderBars()

            setTimeout(() => {
                // log('clean-up inventory');
                inventory(this.player).remove(items.glassBottle(1))
                if (this.hasInfiniteInsulin) this.ensureInfiniteInsulin()
            }, 1)

            if (this.debugMode) {
                echo(this.player, `You drank an INSULIN POTION!`)
            }
        }
    }

    private _playerToggleSprint = event => {
        // Skip if not this.player
        if (event.player.name != this.player.name) return
        this.isSprinting = event.isSprinting()
    }

    private _playerMove = event => {
        // Skip if not this.player
        if (event.player.name != this.player.name) return

        let blockType = event.to.block.type.toString()

        if (blockType.includes('WATER')) {
            // If "in block" is water, check for "standing on" block instead...
            // Because standing on a solid block in water is not really swimming!
            const blockLoc = event.to.block.location
            blockLoc.setY(blockLoc.y - 1) // if block below is still water, then is swimming!
            blockType = blockLoc.block.type.toString()
        }

        this.moveActivityLog.push({
            to: event.to, // location
            from: event.from, // location
            blockType: blockType, // blockType
            isSprinting: this.isSprinting, // boolean
            isSuper: this.inHealthyRange(),
        })
    }

    private _blockBreak = event => {
        // Skip if not this.player
        if (event.player.name != this.player.name) return
        // Log into nonMoveActivityLog
        this.nonMoveActivityLog.push(activityTypes.BLOCK_BREAK)
    }

    private _entityShootBow = event => {
        // Skip if entity is not PLAYER
        if (event.entity.type != 'PLAYER') return
        // Skip if not this.player
        if (event.entity.name != this.player.name) return
        // Log into nonMoveActivityLog
        this.nonMoveActivityLog.push(activityTypes.SHOOT_BOW)
    }

    private _playerInteract = event => {
        if (event.action == 'RIGHT_CLICK_BLOCK') {
            if (event.clickedBlock.type == 'CAKE_BLOCK') {
                echo(this.player, 'HERE')
                this._playerItemConsume({
                    player: event.player,
                    item: {
                        type: 'CAKE_SLICE',
                    },
                })
            }
        }
    }

    private _entityDamage = event => {
        // Prevent Player from taking lightning or fire damage.
        if (
            event.entity.type == 'PLAYER' &&
            event.entity.name == this.player.name
        ) {
            // LIGHTNING, FIRE, FIRE_TICK
            if (
                event.cause == 'LIGHTNING' ||
                event.cause == 'FIRE' ||
                event.cause == 'FIRE_TICK'
            ) {
                event.setCancelled(true)
                event.entity.setFireTicks(0) // stop player from burning.
            }

            // STARVATION
            if (event.cause == 'STARVATION') {
                echo(this.player, 'You are starving!')
            }
        }

        // Make WITHER take projectile damge, snowballs.
        if (event.entity.type == 'WITHER' && event.cause == 'PROJECTILE') {
            event.setDamage(10)
        }
    }

    private _projectileLaunch = event => {
        if (event.entity.type != 'SNOWBALL') return
        if (!this.hasLightningSnowballs) return

        const eloc = {
            x: Math.round(event.entity.location.x),
            y: Math.round(event.entity.location.y),
            z: Math.round(event.entity.location.z),
        }

        const ploc = {
            x: Math.round(this.player.location.x),
            y: Math.round(this.player.location.y),
            z: Math.round(this.player.location.z),
        }

        if (eloc.x === ploc.x && eloc.x === ploc.x && eloc.z === ploc.z) {
            if (!this.inHealthyRange()) {
                event.setCancelled(true)
                echo(this.player, `can't use lightning while sick!`)
                return // Abort
            }

            if (!this.isSuperCharged) {
                // Bring down foodLevel with every snowball
                if (this.foodLevel > 0) {
                    this.setFoodLevel(Math.max(this.foodLevel - 0.2, 0))
                } else {
                    this.setHealth(Math.max(this.player.health - 0.3, 0))
                }
            }

            // Log into nonMoveActivityLog
            // this.nonMoveActivityLog.push(activityTypes.LIGHTNING_STRIKE)
            // ^ No longer do this, as it effects totalActivityCost too much

            setTimeout(() => {
                this.ensureInfiniteSnowballs()
            }, 1)
        }
    }

    private _projectileHit = event => {
        if (event.entity.shooter.type != 'PLAYER') return
        if (event.entity.shooter.name !== this.player.name) return
        if (!this.hasLightningSnowballs) return
        if (event.entity.type != 'SNOWBALL') return

        if (event.hitEntity) {
            var location = event.hitEntity.location
            location.world.strikeLightning(location)
        } else if (event.hitBlock) {
            var location = event.hitBlock.location
            location.world.strikeLightning(location)
        }
    }

    private _inventoryClick = event => {
        if (event.whoClicked.name !== this.player.name) return
        // Make sure players cannot move snowballs and insulin into other, non-player inventories
        if (event.clickedInventory && event.clickedInventory.type != 'PLAYER') {
            if (this.isLightningSnowballStack(event.cursor)) {
                event.setCancelled(true)
            }
            if (this.isInsulinStack(event.cursor)) {
                event.setCancelled(true)
            }
        } else {
            // PLAYER inventory clicks
            // Creative mode case, disallow clicks on snowballs and insulin
            if (event.click == 'CREATIVE') {
                if (this.isLightningSnowballStack(event.currentItem)) {
                    echo(
                        this.player,
                        'Cannot move lightning snowball while in creative!'
                    )
                    event.setCancelled(true)
                }
                if (this.isInsulinStack(event.currentItem)) {
                    echo(this.player, 'Cannot move insulin while in creative!')
                    event.setCancelled(true)
                }
            }

            // Allow players to update snowballs and insulin slots
            if (event.cursor && event.cursor.type) {
                if (this.isLightningSnowballStack(event.cursor)) {
                    this.snowballSlot = event.slot
                }
                if (this.isInsulinStack(event.cursor)) {
                    this.insulinSlot = event.slot
                }
            }
        }
    }

    private _playerDropItem = event => {
        if (event.player.name !== this.player.name) return
        if (event.itemDrop.type == 'DROPPED_ITEM' && event.itemDrop.itemStack) {
            // Cancel drop snowballs
            if (
                this.hasLightningSnowballs &&
                this.isLightningSnowballStack(event.itemDrop.itemStack)
            ) {
                event.setCancelled(true)
            }
            // Cancel drop insulin
            if (
                this.hasInfiniteInsulin &&
                this.isInsulinStack(event.itemDrop.itemStack)
            ) {
                event.setCancelled(true)
            }
        }
    }

    private _playerDeath = event => {
        if (event.entity.type != 'PLAYER') return
        if (event.entity.name !== this.player.name) return

        // Clean-up dropped items
        setTimeout(() => {
            event.entity.getNearbyEntities(1, 1, 1).forEach(entity => {
                if (entity.type == 'DROPPED_ITEM' && entity.itemStack) {
                    // Remove dropped snowballs
                    if (this.isLightningSnowballStack(entity.itemStack)) {
                        entity.remove()
                    }
                    // Remove dropped insulin
                    if (this.isInsulinStack(entity.itemStack)) {
                        entity.remove()
                    }
                }
            })
        }, 500)
    }

    private _playerRespawn = event => {
        if (event.player.name !== this.player.name) return

        // Ensure infinite snowballs ever present
        if (this.hasLightningSnowballs) {
            this.ensureInfiniteSnowballs()
            setTimeout(() => {
                this.ensureInfiniteSnowballs()
            }, 10) // do it twice, in case respawn inventory is active
        }

        // Ensure infinite insuilin ever present
        if (this.hasInfiniteInsulin) {
            this.ensureInfiniteInsulin()
            setTimeout(() => {
                this.ensureInfiniteInsulin()
            }, 10) // do it twice, in case respawn inventory is active
        }
    }

    private _entityRegainHealth = event => {
        if (event.entity.type != 'PLAYER') return
        if (event.entity.name !== this.player.name) return

        // Ensure /heal command effects internal this.foodlevel
        setTimeout(() => {
            this.setFoodLevel(this.player.foodLevel)
        }, 1)
    }

    private _foodLevelChange = event => {
        if (event.entity.type != 'PLAYER') return
        if (event.entity.name !== this.player.name) return

        // Ensure eating effects internal this.foodlevel
        if (event.foodLevel > this.player.foodLevel) {
            this.setFoodLevel(event.foodLevel)
        }
    }

    setDemoInventory() {
        const server = __plugin.server
        const sender = __plugin.server.consoleSender

        server.dispatchCommand(sender, `clear ${this.player.name}`)

        foods.forEach(item => {
            // server.dispatchCommand(sender, `give ${this.player.name} ${item.type}`)
        })
        server.dispatchCommand(
            sender,
            `give ${this.player.name} cooked_chicken 1`
        )
        if (this.hasLightningSnowballs) this.ensureInfiniteSnowballs()
        if (this.hasInfiniteInsulin) this.ensureInfiniteInsulin()
    }

    ensureInfiniteSnowballs() {
        const itemInSlot = user(this.player).inventory.getItem(
            this.snowballSlot
        )
        if (!itemInSlot || !this.isLightningSnowballStack(itemInSlot)) {
            user(this.player).inventory.bumpItemIntoSlot(
                this.snowballSlot,
                this.makeLigtningSnowballItemStack(1)
            )
        }
        // now make sure there aren't any duplicates
        user(this.player)
            .inventory.getAllitemStacks()
            .forEach((itemStack, i) => {
                if (
                    i != this.snowballSlot &&
                    itemStack &&
                    this.isLightningSnowballStack(itemStack)
                ) {
                    user(this.player).inventory.setEmpty(i)
                }
            })
    }

    removeInfiniteSnowballs() {
        user(this.player)
            .inventory.getAllitemStacks()
            .forEach((itemStack, i) => {
                if (itemStack && this.isLightningSnowballStack(itemStack)) {
                    user(this.player).inventory.setEmpty(i)
                }
            })
    }

    ensureInfiniteInsulin() {
        const itemInSlot = user(this.player).inventory.getItem(this.insulinSlot)
        if (!itemInSlot || !this.isInsulinStack(itemInSlot)) {
            user(this.player).inventory.bumpItemIntoSlot(
                this.insulinSlot,
                this.makeInsulinStack(1)
            )
        }
        // now make sure there aren't any duplicates
        user(this.player)
            .inventory.getAllitemStacks()
            .forEach((itemStack, i) => {
                if (
                    i != this.insulinSlot &&
                    itemStack &&
                    this.isInsulinStack(itemStack)
                ) {
                    user(this.player).inventory.setEmpty(i)
                }
            })
    }

    removeInfiniteInsulin() {
        user(this.player)
            .inventory.getAllitemStacks()
            .forEach((itemStack, i) => {
                if (itemStack && this.isInsulinStack(itemStack)) {
                    user(this.player).inventory.setEmpty(i)
                }
            })
    }

    zapZaps() {
        return ['ZAP!', 'BAM!', 'POW!', 'BOOM!', 'CRASH!', 'ZAP!', 'ZAP!']
    }

    makeLigtningSnowballItemStack = num => {
        const item = items.snowball(num)
        const itemMeta = item.getItemMeta()
        const zapzaps = this.zapZaps()
        const zapzap = zapzaps[Math.floor(Math.random() * zapzaps.length)]
        itemMeta.setDisplayName(zapzap)
        item.setItemMeta(itemMeta)
        return item
    }

    makeInsulinStack(num = 1) {
        const potion = items.potion(num)
        const potionMeta = potion.getItemMeta()
        potionMeta.setDisplayName('Insulin')
        potionMeta.setColor(Color.AQUA)
        potion.setItemMeta(potionMeta)
        return potion
    }

    isInsulinStack(itemStack) {
        return (
            itemStack.type == 'POTION' &&
            itemStack.itemMeta &&
            itemStack.itemMeta.displayName &&
            itemStack.itemMeta.displayName == 'Insulin'
        )
    }

    isLightningSnowballStack(itemStack) {
        return (
            itemStack.type == 'SNOW_BALL' &&
            itemStack.itemMeta &&
            itemStack.itemMeta.displayName &&
            this.zapZaps().includes(itemStack.itemMeta.displayName)
        )
    }
}
