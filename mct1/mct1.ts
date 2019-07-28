import { actionbar, BossBar, TextColor } from '@magikcraft/core'
import * as events from 'events'
import * as inventory from 'inventory'
import * as items from 'items'
import { Logger } from '../log'
import MCT1Player from '../user/MCT1Player'
import { activityCosts, activityTypes } from './activities'
import BarManager from './BarManager'
import foods from './foods'

const log = Logger(__filename)

const Color = Java.type('org.bukkit.Color')

const Food: any = {}
foods.forEach(item => (Food[item.type] = item))

const _bar: BossBar = (undefined as unknown) as BossBar

interface MatchItem<T> {
    lower: number
    upper: number
    value: T
}

const check = (measure: number) => (lower: number, upper: number) =>
    measure >= lower && measure <= upper
function match(measure: number) {
    return function matched<T>(matches: Array<MatchItem<T>>): T {
        return matches.filter(m => check(measure)(m.lower, m.upper))[0].value
    }
}

enum Range {
    Low = 'LOW',
    InRange = 'IN_RANGE',
    High = 'HIGH',
    VeryHigh = 'VERY_HIGH',
}

export class MCT1 {
    public player: Player

    public isSprinting: boolean = false

    public bgl: number = 4
    public insulin: number = 0
    // this is an abstraction of the native food level which seems to get rounded to nearest 0.5.
    // It is used to gain a more fine grained control of player food level
    public foodLevel: number
    public digestionQueue: any = []
    public insulinSensitivityMultiplier: number = 1

    public digestionTimer: any
    public eventListeners: any = []

    public isUSA: boolean = false

    public moveActivityLog: any = []
    public nonMoveActivityLog: any = []
    public superActivityMultiplier: number = 1.1

    public name: string

    public isSuperCharged: boolean = false
    public debugMode: boolean = false

    public hasLightningSnowballs: boolean = true
    public hasInfiniteInsulin: boolean = true
    public hasSuperSpeed: boolean = true
    public hasSuperJump: boolean = true
    public hasNightVision: boolean = false

    public snowballSlot: number = 0
    public insulinSlot: number = 1

    public isStarted: boolean = false
    public mct1Player: MCT1Player

    private lastRange: Range = Range.InRange

    constructor(mct1Player: MCT1Player) {
        this.player = mct1Player.player
        this.mct1Player = mct1Player
        this.name = this.player.name
        this.foodLevel = this.player.foodLevel
    }

    public start() {
        this.stop() // first stop, in case already running

        this.bgl = 5
        this.insulin = 0
        this.lastRange = Range.InRange
        this.setFoodLevel(this.player.foodLevel)
        this.digestionQueue = []

        this.registerEvents()
        this.startDigestion()
        this.renderBars()
        this.doEffects()

        if (this.hasLightningSnowballs) {
            this.ensureInfiniteSnowballs()
        } else {
            this.removeInfiniteSnowballs()
        }

        if (this.hasInfiniteInsulin) {
            this.ensureInfiniteInsulin()
        } else {
            this.removeInfiniteInsulin()
        }

        this.isStarted = true
    }

    public stop() {
        this.unregisterEvents()
        this.stopDigestion()
        BarManager.removeBars(this.player)
        this.cancelEffects()
        this.isStarted = false
    }

    public setDebugMode(bool: boolean) {
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

    public setSuperSpeed = (bool: boolean) => (this.hasSuperSpeed = bool)
    public setSuperJump = (bool: boolean) => (this.hasSuperJump = bool)
    public setNightVision = (bool: boolean) => (this.hasNightVision = bool)

    public setFoodLevel(float: number) {
        this.foodLevel = Math.min(float, 20)
        this.player.setFoodLevel(Math.round(this.foodLevel * 2) / 2)
    }

    public setHealth(float: number) {
        this.player.setHealth(float)
    }

    public setInfiniteSnowballs(bool: boolean) {
        this.hasLightningSnowballs = bool
        // If MCT1 is running, update inventory, else will be done on start.
        if (this.isStarted) {
            if (bool) {
                this.ensureInfiniteSnowballs()
            } else {
                this.removeInfiniteSnowballs()
            }
        }
    }

    public setInfiniteInsulin(bool: boolean) {
        this.hasInfiniteInsulin = bool
        // If MCT1 is running, update inventory, else will be done on start.
        if (this.isStarted) {
            if (bool) {
                this.ensureInfiniteInsulin()
            } else {
                this.removeInfiniteInsulin()
            }
        }
    }

    public setSuperCharged(bool: boolean) {
        if (bool) {
            // this.cancelNegativeEffects()
            // this.cancelSuperPowers()
            this.isSuperCharged = true
            this.hasNightVision = true
            this.player.setHealth(20)
            this.setFoodLevel(20)
            // server.dispatchCommand(sender, `god ${this.player.name} ON`)
            this.mct1Player.setGodMode(true)
            this.giveSuperPowers()
        } else {
            this.isSuperCharged = false
            this.mct1Player.setGodMode(false)
            // server.dispatchCommand(sender, `god ${this.player.name} OFF`)
            this.cancelSuperPowers()
        }
    }

    public inHealthyRange = () => this.bgl >= 4 && this.bgl <= 8

    public registerEvents() {
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

    public unregisterEvents = () => {
        log(`Unregistering events for ${this.name}`)
        this.eventListeners.forEach((listener, i) => {
            listener.unregister()
            delete this.eventListeners[i]
        })
    }

    private getBglDisplayValue() {
        return this.isUSA
            ? Math.round(this.bgl * 18) / 10
            : Math.round(this.bgl * 10) / 10
    }

    private roundToOneDecimalPlace(value: number) {
        return (value / 20) * 100
    }

    private getBglBarColor() {
        return match(this.bgl)([
            { lower: 4, upper: 8, value: BossBar.Color.GREEN },
            { lower: 2, upper: 4, value: BossBar.Color.YELLOW },
            { lower: 8, upper: 12, value: BossBar.Color.YELLOW },
            { lower: 0, upper: 100, value: BossBar.Color.RED },
        ])
    }

    private sortDigestionQueue(queue) {
        // Bring high GI items to top of digestionQueue
        return queue
            .filter(item => item.food.GI === 'high')
            .concat(queue.filter(item => item.food.GI === 'low'))
    }

    public renderBars() {
        const bglBarColor = this.getBglBarColor()
        const bglDisplayValue = this.getBglDisplayValue()

        BarManager.getBglBar(this.player)
            .text(`BGL: ${bglDisplayValue}`)
            .color(bglBarColor)
            .progress(this.roundToOneDecimalPlace(this.bgl))

        const insulinLabel = Math.round(this.insulin * 10) / 10
        const insulinPercent = this.roundToOneDecimalPlace(this.insulin)

        BarManager.getInsulinBar(this.player)
            .text(`Insulin: ${insulinLabel}`) // round to 1 decimal
            .progress(insulinPercent) // insulin as percentage, rounded to 1 decimal

        this.digestionQueue = this.sortDigestionQueue(this.digestionQueue)

        // digestion Bar(s)
        const digestionItems = this.digestionQueue.slice(0, 2)
        if (!digestionItems[0]) {
            BarManager.removeDigestionBar1(this.player)
        }
        if (!digestionItems[1]) {
            BarManager.removeDigestionBar2(this.player)
        }

        digestionItems.forEach((item, i) => {
            const percentDigested = (item.carbsDigested / item.food.carbs) * 100

            const label = this.debugMode
                ? `Digesting: ${item.food.label}, ${item.food.carbs} carbs, ${
                      item.food.GI
                  } GI`
                : `Digesting: ${item.food.label}`

            BarManager[`getDigestionBar${i + 1}`](this.player)
                .text(label)
                .color(
                    item.food.GI === 'high'
                        ? BossBar.Color.PINK
                        : BossBar.Color.PURPLE
                )
                .progress(100 - percentDigested)
        })
    }

    public startDigestion(tickCount = 1) {
        this.digestionTimer = setInterval(() => {
            // Do digestion if not dead!
            if (!this.player.isDead()) {
                this.metabolism(tickCount)
                tickCount++
            }
        }, 1000)
    }

    public stopDigestion() {
        if (this.digestionTimer) {
            clearInterval(this.digestionTimer)
            this.digestionTimer = undefined
        }
    }

    private calculateBglRange(): Range {
        return match(this.bgl)([
            { lower: 4, upper: 8, value: Range.InRange },
            { lower: 2, upper: 4, value: Range.Low },
            { lower: 8, upper: 12, value: Range.High },
            { lower: 0, upper: 100, value: Range.VeryHigh },
        ])
    }

    public metabolism(tickCount) {
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

        const BGL_MIN = 2
        const BGL_MAX = 20
        this.bgl = Math.max(BGL_MIN, Math.min(this.bgl, BGL_MAX))

        this.renderBars()
        this.doEffects()

        // Never allow this.player to be full!
        if (this.foodLevel >= 20) {
            this.setFoodLevel(19.5)
        }

        const currentBglRange = this.calculateBglRange()
        this.doActionHint(currentBglRange)
        this.setLastRange(currentBglRange)
    }

    private setLastRange(currentRange: Range) {
        const userJustWentIntoHealthyRange =
            currentRange != this.lastRange && currentRange == Range.InRange
        if (userJustWentIntoHealthyRange) {
            actionbar(
                this.player.name,
                'Good - you are back in range',
                TextColor.GREEN
            )
        }
        this.lastRange = currentRange
    }

    private doActionHint(currentRange: Range) {
        const noFood = !this.digestionQueue || this.digestionQueue.length == 0
        const noInsulin = this.insulin == 0
        if (currentRange == Range.Low && noFood) {
            actionbar(
                this.player.name,
                'You are low and need carbs - eat food',
                TextColor.RED
            )
        }

        if (currentRange == Range.High && noInsulin) {
            actionbar(
                this.player.name,
                'You are going high - take insulin',
                TextColor.YELLOW
            )
        }

        if (currentRange == Range.VeryHigh && noInsulin) {
            actionbar(
                this.player.name,
                'You are going very high - take insulin!',
                TextColor.RED
            )
        }
    }

    public doEffects() {
        const fns = match(this.bgl)([
            {
                // healthy range
                lower: 4,
                upper: 8,
                value: [this.cancelNegativeEffects, this.giveSuperPowers],
            },
            {
                // default case
                lower: 1,
                upper: 100,
                value: [this.cancelSuperPowers, this.giveNegativeEffects],
            },
        ])
        fns.forEach(fn => fn.bind(this)())
    }

    public cancelEffects() {
        this.cancelNegativeEffects()
        this.cancelSuperPowers()
    }

    public giveNegativeEffects() {
        const CONFUSION_MILD = { effect: 'CONFUSION', strength: 3500 }
        const CONFUSION_HEAVY = { effect: 'CONFUSION', strength: 6000 }
        const BLINDNESS = { effect: 'BLINDNESS', strength: 5000 }
        const POISON = { effect: 'POISON', strength: 5000 }

        const effects = match(this.bgl)([
            { lower: 1, upper: 2.1, value: [BLINDNESS, POISON] },
            { lower: 2.1, upper: 3, value: [CONFUSION_HEAVY] },
            { lower: 3, upper: 4, value: [CONFUSION_MILD] },
            { lower: 4, upper: 8, value: [] },
            { lower: 8, upper: 12, value: [CONFUSION_MILD] },
            { lower: 12, upper: 16, value: [CONFUSION_HEAVY] },
            { lower: 16, upper: 100, value: [BLINDNESS, POISON] },
        ])

        effects.forEach(e => this._makeEffect(e.effect, e.strength))
    }

    public cancelNegativeEffects() {
        ;['CONFUSION', 'BLINDNESS', 'POISON'].forEach(e =>
            this._cancelEffect(e)
        )
    }

    public giveSuperPowers() {
        if (this.hasSuperSpeed) {
            this._makeEffect('SPEED', 10000000, 'WHITE', 2)
        }
        if (this.hasSuperJump) {
            this._makeEffect('JUMP', 10000000, 'WHITE', 1)
        }
        if (this.hasNightVision) {
            this._makeEffect('NIGHT_VISION', 10000000, 'WHITE', 1)
        }

        if (this.isSuperCharged) {
            this._makeEffect('GLOWING', 10000000, 'WHITE')
            this._makeEffect('REGENERATION', 10000000, 'WHITE')
        }
    }

    public cancelSuperPowers() {
        ;['SPEED', 'JUMP', 'GLOWING', 'NIGHT_VISION', 'REGENERATION'].forEach(
            e => this._cancelEffect(e)
        )
    }

    public _makeEffect(type, milliseconds, color = 'GREEN', amplifier = 1) {
        const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType')
        if (
            this.player &&
            this.player.hasPotionEffect(PotionEffectType[type]) == true
        ) {
            // Skip if effect already active!
            return
        }

        const PotionEffect = Java.type('org.bukkit.potion.PotionEffect')
        const duration = (milliseconds / 1000) * 40 // 20 tick. 1 tick = 0.05 seconds
        const c = Color[color]
        const l = PotionEffectType[type]
        const effect = new PotionEffect(l, duration, amplifier, true, true, c)
        this.player.addPotionEffect(effect)
    }

    public _cancelEffect(type) {
        const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType')
        if (
            this.player &&
            this.player.hasPotionEffect(PotionEffectType[type]) == true
        ) {
            this.player.removePotionEffect(PotionEffectType[type])
        }
    }

    public resetActivityLogs() {
        this.moveActivityLog = []
        this.nonMoveActivityLog = []
    }

    public calculateTotalActivityCost() {
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

    public setInsulinSensitivity(totalActivityCost) {
        this.insulinSensitivityMultiplier = match(totalActivityCost)([
            { lower: 0, upper: 0.075, value: 1 },
            { lower: 0.075, upper: 0.5, value: 1.2 },
            { lower: 0.5, upper: 1.25, value: 1.5 },
            { lower: 1.25, upper: 100, value: 1.8 },
        ])
    }

    public extractActivitiesFromMoveLog() {
        const activities: any = []

        // iterate over moveActivityLog and determine activities
        let distTravelled = 0
        this.moveActivityLog.forEach((mLog, i) => {
            const isUpward = mLog.to.y.toFixed(2) > mLog.from.y.toFixed(2)

            let activity
            if (mLog.blockType == 'LADDER') {
                activity = activityTypes.CLIMB_LADDER
            } else if (mLog.blockType == 'VINE') {
                activity = activityTypes.CLIMB_VINE
            } else if (mLog.blockType.includes('WATER')) {
                activity = activityTypes.SWIM
            } else if (isUpward && mLog.isSprinting) {
                activity = activityTypes.SPRINT_JUMP
            } else if (isUpward) {
                activity = activityTypes.JUMP
            } else if (mLog.isSprinting) {
                activity = activityTypes.SPRINT
            } else {
                activity = activityTypes.WALK
            }

            if (mLog.isSuper) {
                activity = `SUPER_${activity}`
            }

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
                    if (activity != lastActitiy) {
                        activities.push(activity)
                    }
                } else {
                    activities.push(activity)
                }
            }
        })

        return activities
    }

    public setDemoInventory() {
        const server = __plugin.server
        const sender = __plugin.server.consoleSender

        server.dispatchCommand(sender, `clear ${this.player.name}`)

        foods.forEach(item => {
            // server.dispatchCommand(
            //     sender,
            //     `give ${this.player.name} ${item.type}`
            // )
        })
        server.dispatchCommand(
            sender,
            `give ${this.player.name} cooked_chicken 1`
        )
        if (this.hasLightningSnowballs) {
            this.ensureInfiniteSnowballs()
        }
        if (this.hasInfiniteInsulin) {
            this.ensureInfiniteInsulin()
        }
    }

    public ensureInfiniteSnowballs() {
        const itemInSlot = this.mct1Player.inventory.getItem(this.snowballSlot)
        if (!itemInSlot || !this.isLightningSnowballStack(itemInSlot)) {
            this.mct1Player.inventory.bumpItemIntoSlot(
                this.snowballSlot,
                this.makeLigtningSnowballItemStack(1)
            )
        }
        // now make sure there aren't any duplicates
        this.mct1Player.inventory.getAllitemStacks().forEach((itemStack, i) => {
            if (
                i != this.snowballSlot &&
                itemStack &&
                this.isLightningSnowballStack(itemStack)
            ) {
                this.mct1Player.inventory.setEmpty(i)
            }
        })
    }

    public removeInfiniteSnowballs() {
        this.mct1Player.inventory.getAllitemStacks().forEach((itemStack, i) => {
            if (itemStack && this.isLightningSnowballStack(itemStack)) {
                this.mct1Player.inventory.setEmpty(i)
            }
        })
    }

    public ensureInfiniteInsulin() {
        const itemInSlot = this.mct1Player.inventory.getItem(this.insulinSlot)
        if (!itemInSlot || !this.isInsulinStack(itemInSlot)) {
            this.mct1Player.inventory.bumpItemIntoSlot(
                this.insulinSlot,
                this.makeInsulinStack(1)
            )
        }
        // now make sure there aren't any duplicates
        this.mct1Player.inventory.getAllitemStacks().forEach((itemStack, i) => {
            if (
                i != this.insulinSlot &&
                itemStack &&
                this.isInsulinStack(itemStack)
            ) {
                this.mct1Player.inventory.setEmpty(i)
            }
        })
    }

    public removeInfiniteInsulin() {
        this.mct1Player.inventory.getAllitemStacks().forEach((itemStack, i) => {
            if (itemStack && this.isInsulinStack(itemStack)) {
                this.mct1Player.inventory.setEmpty(i)
            }
        })
    }

    public zapZaps() {
        return ['ZAP!', 'BAM!', 'POW!', 'BOOM!', 'CRASH!', 'ZAP!', 'ZAP!']
    }

    public makeLigtningSnowballItemStack = num => {
        const item = items.snowball(num)
        const itemMeta = item.getItemMeta()
        const zapzaps = this.zapZaps()
        const zapzap = zapzaps[Math.floor(Math.random() * zapzaps.length)]
        itemMeta.setDisplayName(zapzap)
        item.setItemMeta(itemMeta)
        return item
    }

    public makeInsulinStack(num = 1) {
        const potion = items.potion(num)
        const potionMeta = potion.getItemMeta()
        potionMeta.setDisplayName('Insulin')
        potionMeta.setColor(Color.AQUA)
        potion.setItemMeta(potionMeta)
        return potion
    }

    public isInsulinStack(itemStack) {
        return (
            itemStack.type == 'POTION' &&
            itemStack.itemMeta &&
            itemStack.itemMeta.displayName &&
            itemStack.itemMeta.displayName == 'Insulin'
        )
    }

    public isLightningSnowballStack(itemStack) {
        return (
            itemStack.type == 'SNOW_BALL' &&
            itemStack.itemMeta &&
            itemStack.itemMeta.displayName &&
            this.zapZaps().includes(itemStack.itemMeta.displayName)
        )
    }

    private _playerItemConsume = event => {
        // Skip if not this.player
        if (event.player.name != this.player.name) {
            return
        }

        log(`${this.player.name} ate a ${event.item.type}!`)

        // Act on know FOOD eat...
        if (Food[event.item.type]) {
            const item = {
                carbsDigested: 0,
                food: Food[event.item.type],
                timestamp: Math.floor(Date.now() / 1000),
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
                if (this.hasInfiniteInsulin) {
                    this.ensureInfiniteInsulin()
                }
            }, 1)

            if (this.debugMode) {
                echo(this.player, `You drank an INSULIN POTION!`)
            }
        }
    }

    private _playerToggleSprint = event => {
        // Skip if not this.player
        if (event.player.name != this.player.name) {
            return
        }
        this.isSprinting = event.isSprinting()
    }

    private _playerMove = event => {
        // Skip if not this.player
        if (event.player.name != this.player.name) {
            return
        }

        let blockType = event.to.block.type.toString()

        if (blockType.includes('WATER')) {
            // If "in block" is water, check for "standing on" block instead...
            // Because standing on a solid block in water is not really swimming!
            const blockLoc = event.to.block.location
            blockLoc.setY(blockLoc.y - 1) // if block below is still water, then is swimming!
            blockType = blockLoc.block.type.toString()
        }

        this.moveActivityLog.push({
            blockType, // blockType
            from: event.from, // location
            isSprinting: this.isSprinting, // boolean
            isSuper: this.inHealthyRange(),
            to: event.to, // location
        })
    }

    private _blockBreak = event => {
        // Skip if not this.player
        if (event.player.name != this.player.name) {
            return
        }
        // Log into nonMoveActivityLog
        this.nonMoveActivityLog.push(activityTypes.BLOCK_BREAK)
    }

    private _entityShootBow = event => {
        // Skip if entity is not PLAYER
        if (event.entity.type != 'PLAYER') {
            return
        }
        // Skip if not this.player
        if (event.entity.name != this.player.name) {
            return
        }
        // Log into nonMoveActivityLog
        this.nonMoveActivityLog.push(activityTypes.SHOOT_BOW)
    }

    private _playerInteract = event => {
        if (event.action == 'RIGHT_CLICK_BLOCK') {
            if (event.clickedBlock.type == 'CAKE_BLOCK') {
                echo(this.player, 'HERE')
                this._playerItemConsume({
                    item: {
                        type: 'CAKE_SLICE',
                    },
                    player: event.player,
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
            event.setDamage(2)
        }
    }

    private _projectileLaunch = event => {
        if (event.entity.type != 'SNOWBALL') {
            return
        }
        if (!this.hasLightningSnowballs) {
            return
        }

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
        if (event.entity.shooter.type != 'PLAYER') {
            return
        }
        if (event.entity.shooter.name !== this.player.name) {
            return
        }
        if (!this.hasLightningSnowballs) {
            return
        }
        if (event.entity.type != 'SNOWBALL') {
            return
        }

        if (event.hitEntity) {
            const location = event.hitEntity.location
            location.world.strikeLightning(location)
        } else if (event.hitBlock) {
            const location = event.hitBlock.location
            location.world.strikeLightning(location)
        }
    }

    private _inventoryClick = event => {
        if (event.whoClicked.name !== this.player.name) {
            return
        }
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
        if (event.player.name !== this.player.name) {
            return
        }
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
        if (event.entity.type != 'PLAYER') {
            return
        }
        if (event.entity.name !== this.player.name) {
            return
        }

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
        if (event.player.name !== this.player.name) {
            return
        }

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
        if (event.entity.type != 'PLAYER') {
            return
        }
        if (event.entity.name !== this.player.name) {
            return
        }

        // Ensure /heal command effects internal this.foodlevel
        setTimeout(() => {
            this.setFoodLevel(this.player.foodLevel)
        }, 1)
    }

    private _foodLevelChange = event => {
        if (event.entity.type != 'PLAYER') {
            return
        }
        if (event.entity.name !== this.player.name) {
            return
        }

        // Ensure eating effects internal this.foodlevel
        if (event.foodLevel > this.player.foodLevel) {
            this.setFoodLevel(event.foodLevel)
        }
    }
}
