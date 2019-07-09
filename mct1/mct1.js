"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events = require("events");
var inventory = require("inventory");
var items = require("items");
var bossbar_1 = require("../bossbar");
var log_1 = require("../log");
var user_1 = require("../user");
var activities_1 = require("./activities");
var foods_1 = require("./foods");
var log = log_1.Logger(__filename);
var Color = Java.type('org.bukkit.Color');
var Food = {};
foods_1.default.forEach(function (item) { return (Food[item.type] = item); });
var _bar = undefined;
var MCT1 = /** @class */ (function () {
    function MCT1(player) {
        var _this = this;
        this.isSprinting = false;
        this.bgl = 4;
        this.insulin = 0;
        this.digestionQueue = [];
        this.insulinSensitivityMultiplier = 1;
        this.eventListeners = [];
        this.isUSA = false;
        this.bars = {
            bgl: _bar,
            digestion1: _bar,
            digestion2: _bar,
            insulin: _bar,
        };
        this.moveActivityLog = [];
        this.nonMoveActivityLog = [];
        this.superActivityMultiplier = 1.1;
        this.isSuperCharged = false;
        this.debugMode = false;
        this.hasLightningSnowballs = true;
        this.hasInfiniteInsulin = true;
        this.hasSuperSpeed = true;
        this.hasSuperJump = true;
        this.hasNightVision = false;
        this.snowballSlot = 0;
        this.insulinSlot = 1;
        this.isStarted = false;
        this.setSuperSpeed = function (bool) { return (_this.hasSuperSpeed = bool); };
        this.setSuperJump = function (bool) { return (_this.hasSuperJump = bool); };
        this.setNightVision = function (bool) { return (_this.hasNightVision = bool); };
        this.inHealthyRange = function () { return _this.bgl >= 4 && _this.bgl <= 8; };
        this.unregisterEvents = function () {
            log("Unregistering events for " + _this.name);
            _this.eventListeners.forEach(function (listener, i) {
                listener.unregister();
                delete _this.eventListeners[i];
            });
        };
        this.makeLigtningSnowballItemStack = function (num) {
            var item = items.snowball(num);
            var itemMeta = item.getItemMeta();
            var zapzaps = _this.zapZaps();
            var zapzap = zapzaps[Math.floor(Math.random() * zapzaps.length)];
            itemMeta.setDisplayName(zapzap);
            item.setItemMeta(itemMeta);
            return item;
        };
        this._playerItemConsume = function (event) {
            // Skip if not this.player
            if (event.player.name != _this.player.name) {
                return;
            }
            log(_this.player.name + " ate a " + event.item.type + "!");
            // Act on know FOOD eat...
            if (Food[event.item.type]) {
                var item = {
                    carbsDigested: 0,
                    food: Food[event.item.type],
                    timestamp: Math.floor(Date.now() / 1000),
                };
                _this.digestionQueue.push(item);
                _this.renderBars();
                if (_this.debugMode) {
                    echo(_this.player, "You ate a " + event.item.type + ", carbs " + Food[event.item.type].carbs + ", GI " + Food[event.item.type].GI + ".");
                }
            }
            // Act on POTION drink... (insulin)
            else if (_this.isInsulinStack(event.item)) {
                // important! use double arrow (not triple)
                log(_this.player.name + " drank an INSULIN POTION!");
                _this.insulin = Math.min(_this.insulin + 2, 20);
                _this.renderBars();
                setTimeout(function () {
                    // log('clean-up inventory');
                    inventory(_this.player).remove(items.glassBottle(1));
                    if (_this.hasInfiniteInsulin) {
                        _this.ensureInfiniteInsulin();
                    }
                }, 1);
                if (_this.debugMode) {
                    echo(_this.player, "You drank an INSULIN POTION!");
                }
            }
        };
        this._playerToggleSprint = function (event) {
            // Skip if not this.player
            if (event.player.name != _this.player.name) {
                return;
            }
            _this.isSprinting = event.isSprinting();
        };
        this._playerMove = function (event) {
            // Skip if not this.player
            if (event.player.name != _this.player.name) {
                return;
            }
            var blockType = event.to.block.type.toString();
            if (blockType.includes('WATER')) {
                // If "in block" is water, check for "standing on" block instead...
                // Because standing on a solid block in water is not really swimming!
                var blockLoc = event.to.block.location;
                blockLoc.setY(blockLoc.y - 1); // if block below is still water, then is swimming!
                blockType = blockLoc.block.type.toString();
            }
            _this.moveActivityLog.push({
                blockType: blockType,
                from: event.from,
                isSprinting: _this.isSprinting,
                isSuper: _this.inHealthyRange(),
                to: event.to,
            });
        };
        this._blockBreak = function (event) {
            // Skip if not this.player
            if (event.player.name != _this.player.name) {
                return;
            }
            // Log into nonMoveActivityLog
            _this.nonMoveActivityLog.push(activities_1.activityTypes.BLOCK_BREAK);
        };
        this._entityShootBow = function (event) {
            // Skip if entity is not PLAYER
            if (event.entity.type != 'PLAYER') {
                return;
            }
            // Skip if not this.player
            if (event.entity.name != _this.player.name) {
                return;
            }
            // Log into nonMoveActivityLog
            _this.nonMoveActivityLog.push(activities_1.activityTypes.SHOOT_BOW);
        };
        this._playerInteract = function (event) {
            if (event.action == 'RIGHT_CLICK_BLOCK') {
                if (event.clickedBlock.type == 'CAKE_BLOCK') {
                    echo(_this.player, 'HERE');
                    _this._playerItemConsume({
                        item: {
                            type: 'CAKE_SLICE',
                        },
                        player: event.player,
                    });
                }
            }
        };
        this._entityDamage = function (event) {
            // Prevent Player from taking lightning or fire damage.
            if (event.entity.type == 'PLAYER' &&
                event.entity.name == _this.player.name) {
                // LIGHTNING, FIRE, FIRE_TICK
                if (event.cause == 'LIGHTNING' ||
                    event.cause == 'FIRE' ||
                    event.cause == 'FIRE_TICK') {
                    event.setCancelled(true);
                    event.entity.setFireTicks(0); // stop player from burning.
                }
                // STARVATION
                if (event.cause == 'STARVATION') {
                    echo(_this.player, 'You are starving!');
                }
            }
            // Make WITHER take projectile damge, snowballs.
            if (event.entity.type == 'WITHER' && event.cause == 'PROJECTILE') {
                event.setDamage(10);
                event.setDamage(2);
            }
        };
        this._projectileLaunch = function (event) {
            if (event.entity.type != 'SNOWBALL') {
                return;
            }
            if (!_this.hasLightningSnowballs) {
                return;
            }
            var eloc = {
                x: Math.round(event.entity.location.x),
                y: Math.round(event.entity.location.y),
                z: Math.round(event.entity.location.z),
            };
            var ploc = {
                x: Math.round(_this.player.location.x),
                y: Math.round(_this.player.location.y),
                z: Math.round(_this.player.location.z),
            };
            if (eloc.x === ploc.x && eloc.x === ploc.x && eloc.z === ploc.z) {
                if (!_this.inHealthyRange()) {
                    event.setCancelled(true);
                    echo(_this.player, "can't use lightning while sick!");
                    return; // Abort
                }
                if (!_this.isSuperCharged) {
                    // Bring down foodLevel with every snowball
                    if (_this.foodLevel > 0) {
                        _this.setFoodLevel(Math.max(_this.foodLevel - 0.2, 0));
                    }
                    else {
                        _this.setHealth(Math.max(_this.player.health - 0.3, 0));
                    }
                }
                // Log into nonMoveActivityLog
                // this.nonMoveActivityLog.push(activityTypes.LIGHTNING_STRIKE)
                // ^ No longer do this, as it effects totalActivityCost too much
                setTimeout(function () {
                    _this.ensureInfiniteSnowballs();
                }, 1);
            }
        };
        this._projectileHit = function (event) {
            if (event.entity.shooter.type != 'PLAYER') {
                return;
            }
            if (event.entity.shooter.name !== _this.player.name) {
                return;
            }
            if (!_this.hasLightningSnowballs) {
                return;
            }
            if (event.entity.type != 'SNOWBALL') {
                return;
            }
            if (event.hitEntity) {
                var location = event.hitEntity.location;
                location.world.strikeLightning(location);
            }
            else if (event.hitBlock) {
                var location = event.hitBlock.location;
                location.world.strikeLightning(location);
            }
        };
        this._inventoryClick = function (event) {
            if (event.whoClicked.name !== _this.player.name) {
                return;
            }
            // Make sure players cannot move snowballs and insulin into other, non-player inventories
            if (event.clickedInventory && event.clickedInventory.type != 'PLAYER') {
                if (_this.isLightningSnowballStack(event.cursor)) {
                    event.setCancelled(true);
                }
                if (_this.isInsulinStack(event.cursor)) {
                    event.setCancelled(true);
                }
            }
            else {
                // PLAYER inventory clicks
                // Creative mode case, disallow clicks on snowballs and insulin
                if (event.click == 'CREATIVE') {
                    if (_this.isLightningSnowballStack(event.currentItem)) {
                        echo(_this.player, 'Cannot move lightning snowball while in creative!');
                        event.setCancelled(true);
                    }
                    if (_this.isInsulinStack(event.currentItem)) {
                        echo(_this.player, 'Cannot move insulin while in creative!');
                        event.setCancelled(true);
                    }
                }
                // Allow players to update snowballs and insulin slots
                if (event.cursor && event.cursor.type) {
                    if (_this.isLightningSnowballStack(event.cursor)) {
                        _this.snowballSlot = event.slot;
                    }
                    if (_this.isInsulinStack(event.cursor)) {
                        _this.insulinSlot = event.slot;
                    }
                }
            }
        };
        this._playerDropItem = function (event) {
            if (event.player.name !== _this.player.name) {
                return;
            }
            if (event.itemDrop.type == 'DROPPED_ITEM' && event.itemDrop.itemStack) {
                // Cancel drop snowballs
                if (_this.hasLightningSnowballs &&
                    _this.isLightningSnowballStack(event.itemDrop.itemStack)) {
                    event.setCancelled(true);
                }
                // Cancel drop insulin
                if (_this.hasInfiniteInsulin &&
                    _this.isInsulinStack(event.itemDrop.itemStack)) {
                    event.setCancelled(true);
                }
            }
        };
        this._playerDeath = function (event) {
            if (event.entity.type != 'PLAYER') {
                return;
            }
            if (event.entity.name !== _this.player.name) {
                return;
            }
            // Clean-up dropped items
            setTimeout(function () {
                event.entity.getNearbyEntities(1, 1, 1).forEach(function (entity) {
                    if (entity.type == 'DROPPED_ITEM' && entity.itemStack) {
                        // Remove dropped snowballs
                        if (_this.isLightningSnowballStack(entity.itemStack)) {
                            entity.remove();
                        }
                        // Remove dropped insulin
                        if (_this.isInsulinStack(entity.itemStack)) {
                            entity.remove();
                        }
                    }
                });
            }, 500);
        };
        this._playerRespawn = function (event) {
            if (event.player.name !== _this.player.name) {
                return;
            }
            // Ensure infinite snowballs ever present
            if (_this.hasLightningSnowballs) {
                _this.ensureInfiniteSnowballs();
                setTimeout(function () {
                    _this.ensureInfiniteSnowballs();
                }, 10); // do it twice, in case respawn inventory is active
            }
            // Ensure infinite insuilin ever present
            if (_this.hasInfiniteInsulin) {
                _this.ensureInfiniteInsulin();
                setTimeout(function () {
                    _this.ensureInfiniteInsulin();
                }, 10); // do it twice, in case respawn inventory is active
            }
        };
        this._entityRegainHealth = function (event) {
            if (event.entity.type != 'PLAYER') {
                return;
            }
            if (event.entity.name !== _this.player.name) {
                return;
            }
            // Ensure /heal command effects internal this.foodlevel
            setTimeout(function () {
                _this.setFoodLevel(_this.player.foodLevel);
            }, 1);
        };
        this._foodLevelChange = function (event) {
            if (event.entity.type != 'PLAYER') {
                return;
            }
            if (event.entity.name !== _this.player.name) {
                return;
            }
            // Ensure eating effects internal this.foodlevel
            if (event.foodLevel > _this.player.foodLevel) {
                _this.setFoodLevel(event.foodLevel);
            }
        };
        this.player = player;
        this.mct1Player = user_1.makeMCT1Player(player);
        this.name = player.name;
        this.foodLevel = this.player.foodLevel;
    }
    MCT1.prototype.start = function () {
        this.stop(); // first stop, in case already running
        this.bgl = 5;
        this.insulin = 0;
        this.setFoodLevel(this.player.foodLevel);
        this.digestionQueue = [];
        this.registerEvents();
        this.startDigestion();
        this.renderBars();
        this.doEffects();
        if (this.hasLightningSnowballs) {
            this.ensureInfiniteSnowballs();
        }
        else {
            this.removeInfiniteSnowballs();
        }
        if (this.hasInfiniteInsulin) {
            this.ensureInfiniteInsulin();
        }
        else {
            this.removeInfiniteInsulin();
        }
        this.isStarted = true;
    };
    MCT1.prototype.stop = function () {
        this.unregisterEvents();
        this.stopDigestion();
        this.removeBars();
        this.cancelEffects();
        this.isStarted = false;
    };
    MCT1.prototype.setDebugMode = function (bool) {
        if (bool) {
            echo(this.player, "MCT1 debug ON");
            this.debugMode = true;
            this.setInfiniteInsulin(true);
            this.setInfiniteSnowballs(true);
            this.setSuperJump(true);
            this.setSuperSpeed(true);
            this.setDemoInventory();
            this.start();
        }
        else {
            echo(this.player, "MCT1 debug OFF");
            this.debugMode = false;
        }
    };
    MCT1.prototype.setFoodLevel = function (float) {
        this.foodLevel = Math.min(float, 20);
        this.player.setFoodLevel(Math.round(this.foodLevel * 2) / 2);
    };
    MCT1.prototype.setHealth = function (float) {
        this.player.setHealth(float);
    };
    MCT1.prototype.setInfiniteSnowballs = function (bool) {
        this.hasLightningSnowballs = bool;
        // If MCT1 is running, update inventory, else will be done on start.
        if (this.isStarted) {
            if (bool) {
                this.ensureInfiniteSnowballs();
            }
            else {
                this.removeInfiniteSnowballs();
            }
        }
    };
    MCT1.prototype.setInfiniteInsulin = function (bool) {
        this.hasInfiniteInsulin = bool;
        // If MCT1 is running, update inventory, else will be done on start.
        if (this.isStarted) {
            if (bool) {
                this.ensureInfiniteInsulin();
            }
            else {
                this.removeInfiniteInsulin();
            }
        }
    };
    MCT1.prototype.setSuperCharged = function (bool) {
        if (bool) {
            // this.cancelNegativeEffects()
            // this.cancelSuperPowers()
            this.isSuperCharged = true;
            this.hasNightVision = true;
            this.player.setHealth(20);
            this.setFoodLevel(20);
            // server.dispatchCommand(sender, `god ${this.player.name} ON`)
            this.mct1Player.setGodMode(true);
            this.giveSuperPowers();
        }
        else {
            this.isSuperCharged = false;
            this.mct1Player.setGodMode(false);
            // server.dispatchCommand(sender, `god ${this.player.name} OFF`)
            this.cancelSuperPowers();
        }
    };
    MCT1.prototype.registerEvents = function () {
        log('registerEvents');
        this.eventListeners.push(events.playerItemConsume(this._playerItemConsume), events.playerToggleSprint(this._playerToggleSprint), events.playerMove(this._playerMove), events.blockBreak(this._blockBreak), events.entityShootBow(this._entityShootBow), events.playerInteract(this._playerInteract), events.entityDamage(this._entityDamage), events.projectileLaunch(this._projectileLaunch), events.projectileHit(this._projectileHit), events.inventoryClick(this._inventoryClick), events.playerDeath(this._playerDeath), events.playerRespawn(this._playerRespawn), events.entityRegainHealth(this._entityRegainHealth), events.foodLevelChange(this._foodLevelChange), events.playerDropItem(this._playerDropItem));
    };
    MCT1.prototype.renderBars = function () {
        var _this = this;
        // bars.bgl color
        var color = 'GREEN';
        if (this.bgl >= 4 && this.bgl <= 8) {
            color = 'GREEN';
        }
        else if ((this.bgl < 4 && this.bgl > 2) ||
            (this.bgl > 8 && this.bgl <= 12)) {
            color = 'YELLOW';
        }
        else {
            color = 'RED';
        }
        // bars.bgl
        var bgl = Math.round(this.bgl * 10) / 10;
        if (this.isUSA) {
            bgl = Math.round(bgl * 18);
        }
        if (!this.bars.bgl) {
            this.bars.bgl = bossbar_1.BossBar.bar('', this.player);
            this.bars.bgl.style(bossbar_1.BossBar.style.NOTCHED_20).render();
        }
        this.bars.bgl
            .text("BGL: " + bgl) // round to 1 decimal
            .color(bossbar_1.BossBar.color[color])
            .progress((this.bgl / 20) * 100);
        // bars.insulin
        if (!this.bars.insulin) {
            this.bars.insulin = bossbar_1.BossBar.bar('', this.player);
            this.bars.insulin
                .color(bossbar_1.BossBar.color.BLUE)
                .style(bossbar_1.BossBar.style.NOTCHED_20)
                .render();
        }
        var insulinLabel = Math.round(this.insulin * 10) / 10;
        var insulinPercent = (this.insulin / 20) * 100;
        this.bars.insulin
            .text("Insulin: " + insulinLabel) // round to 1 decimal
            .progress(insulinPercent); // insulin as percentage, rounded to 1 decimal
        // Bring high GI items to top of digestionQueue
        var highGIItems = this.digestionQueue.filter(function (item) { return item.food.GI === 'high'; });
        var lowGIItems = this.digestionQueue.filter(function (item) { return item.food.GI === 'low'; });
        this.digestionQueue = highGIItems.concat(lowGIItems);
        // digestion Bar(s)
        var digestionItems = this.digestionQueue.slice(0, 2);
        if (!digestionItems[0] && this.bars.digestion1) {
            this.bars.digestion1.remove();
        }
        if (!digestionItems[1] && this.bars.digestion2) {
            this.bars.digestion2.remove();
        }
        digestionItems.forEach(function (item, i) {
            var index = "digestion" + (i + 1);
            var percentDigested = (item.carbsDigested / item.food.carbs) * 100;
            if (!_this.bars[index]) {
                _this.bars[index] = bossbar_1.BossBar.bar('', _this.player)
                    .style(bossbar_1.BossBar.style.NOTCHED_20)
                    .render();
            }
            var label = _this.debugMode
                ? "Digesting: " + item.food.label + ", " + item.food.carbs + " carbs, " + item.food.GI + " GI"
                : "Digesting: " + item.food.label;
            _this.bars[index]
                .text(label)
                .color(item.food.GI === 'high'
                ? bossbar_1.BossBar.color.PINK
                : bossbar_1.BossBar.color.PURPLE)
                .progress(100 - percentDigested)
                .render();
        });
    };
    MCT1.prototype.removeBars = function () {
        if (this.bars.bgl) {
            this.bars.bgl.remove();
            this.bars.bgl = undefined;
        }
        if (this.bars.insulin) {
            this.bars.insulin.remove();
            this.bars.insulin = undefined;
        }
        if (this.bars.digestion1) {
            this.bars.digestion1.remove();
            this.bars.digestion1 = undefined;
        }
        if (this.bars.digestion2) {
            this.bars.digestion2.remove();
            this.bars.digestion2 = undefined;
        }
    };
    MCT1.prototype.startDigestion = function (tickCount) {
        var _this = this;
        if (tickCount === void 0) { tickCount = 1; }
        this.digestionTimer = setInterval(function () {
            // Do digestion if not dead!
            if (!_this.player.isDead()) {
                _this.digestion(tickCount);
                tickCount++;
            }
        }, 1000);
    };
    MCT1.prototype.stopDigestion = function () {
        if (this.digestionTimer) {
            clearInterval(this.digestionTimer);
            this.digestionTimer = undefined;
        }
    };
    MCT1.prototype.digestion = function (tickCount) {
        if (tickCount % 5 === 0) {
            var totalActivityCost = this.calculateTotalActivityCost();
            this.resetActivityLogs();
            this.setInsulinSensitivity(totalActivityCost);
            if (!this.isSuperCharged) {
                // only do if NOT isSuperCharged
                var reduceFoodAmount = totalActivityCost / 1.5;
                this.setFoodLevel(Math.max(this.foodLevel - reduceFoodAmount, 0));
            }
        }
        // Every 10 ticks...
        if (tickCount % 10 === 0) {
            // bgl rises slowly, even if not digesting...
            this.bgl += 0.1;
            // If this.player has food in digestionQueue, up foodlevel
            if (this.digestionQueue && this.digestionQueue.length > 0) {
                this.setFoodLevel(Math.min(this.foodLevel + 1, 20));
            }
        }
        // Every 5 ticks...
        if (tickCount % 5 === 0 && this.digestionQueue[0]) {
            // Regenerate if inHealthyRange
            if (this.inHealthyRange()) {
                this.player.setHealth(Math.min(this.player.health + 0.5, 20));
            }
        }
        // handle insulin in system
        if (this.insulin > 0) {
            this.insulin = Math.max(this.insulin - 0.1, 0);
            this.bgl -= 0.15 * this.insulinSensitivityMultiplier;
            // log('Insulin effect of bgl: ', (0.15 * this.insulinSensitivityMultiplier))
        }
        // handle digestionQueue
        if (this.digestionQueue[0]) {
            if (this.digestionQueue[0].food.GI === 'high') {
                // high GI, digest faster...
                this.digestionQueue[0].carbsDigested += 1;
                this.bgl += 0.2;
            }
            else {
                // low GI, digest slower...
                this.digestionQueue[0].carbsDigested += 0.5;
                this.bgl += 0.1;
            }
            if (this.insulin > 0) {
                // if insulin in system, boost health!
                if (this.player.health < 20) {
                    this.player.setHealth(Math.min(this.player.health + 0.5, 20));
                }
            }
            if (this.digestionQueue[0].carbsDigested >=
                this.digestionQueue[0].food.carbs) {
                // finished digesting... remove from queue...
                this.digestionQueue.splice(0, 1);
            }
        }
        // bgl should never go below 2!
        if (this.bgl < 2) {
            this.bgl = 2;
        }
        // bgl should never go above 20!
        if (this.bgl > 20) {
            this.bgl = 20;
        }
        this.renderBars();
        this.doEffects();
        // Never allow this.player to be full!
        if (this.foodLevel >= 20) {
            this.setFoodLevel(19.5);
        }
    };
    MCT1.prototype.doEffects = function () {
        if (this.bgl >= 4 && this.bgl <= 8) {
            // Healthy Range
            this.cancelNegativeEffects();
            this.giveSuperPowers();
        }
        else {
            // Out of range...
            this.cancelSuperPowers();
            this.giveNegativeEffects();
        }
    };
    MCT1.prototype.cancelEffects = function () {
        this.cancelNegativeEffects();
        this.cancelSuperPowers();
    };
    MCT1.prototype.giveNegativeEffects = function () {
        // Confusion!
        if ((this.bgl < 4 && this.bgl >= 3) ||
            (this.bgl > 8 && this.bgl <= 12)) {
            this._makeEffect('CONFUSION', 3500);
        }
        // More Confusion!
        else if (this.bgl < 3 || this.bgl > 16) {
            this._makeEffect('CONFUSION', 6000);
        }
        // Layer additional effects.
        if (this.bgl <= 2 || this.bgl >= 16) {
            this._makeEffect('BLINDNESS', 5000);
            this._makeEffect('POISON', 5000);
        }
    };
    MCT1.prototype.cancelNegativeEffects = function () {
        this._cancelEffect('CONFUSION');
        this._cancelEffect('BLINDNESS');
        this._cancelEffect('POISON');
    };
    MCT1.prototype.giveSuperPowers = function () {
        if (this.hasSuperSpeed) {
            this._makeEffect('SPEED', 10000000, 'WHITE', 2);
        }
        if (this.hasSuperJump) {
            this._makeEffect('JUMP', 10000000, 'WHITE', 1);
        }
        if (this.hasNightVision) {
            this._makeEffect('NIGHT_VISION', 10000000, 'WHITE', 1);
        }
        if (this.isSuperCharged) {
            this._makeEffect('GLOWING', 10000000, 'WHITE');
            this._makeEffect('REGENERATION', 10000000, 'WHITE');
        }
    };
    MCT1.prototype.cancelSuperPowers = function () {
        this._cancelEffect('SPEED');
        this._cancelEffect('JUMP');
        this._cancelEffect('GLOWING');
        this._cancelEffect('NIGHT_VISION');
        this._cancelEffect('REGENERATION');
    };
    MCT1.prototype._makeEffect = function (type, milliseconds, color, amplifier) {
        if (color === void 0) { color = 'GREEN'; }
        if (amplifier === void 0) { amplifier = 1; }
        var PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType');
        if (this.player &&
            this.player.hasPotionEffect(PotionEffectType[type]) == true) {
            // Skip if effect already active!
            return;
        }
        var PotionEffect = Java.type('org.bukkit.potion.PotionEffect');
        var duration = (milliseconds / 1000) * 40; // 20 tick. 1 tick = 0.05 seconds
        var c = Color[color];
        var l = PotionEffectType[type];
        var effect = new PotionEffect(l, duration, amplifier, true, true, c);
        this.player.addPotionEffect(effect);
    };
    MCT1.prototype._cancelEffect = function (type) {
        var PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType');
        if (this.player &&
            this.player.hasPotionEffect(PotionEffectType[type]) == true) {
            this.player.removePotionEffect(PotionEffectType[type]);
        }
    };
    MCT1.prototype.resetActivityLogs = function () {
        this.moveActivityLog = [];
        this.nonMoveActivityLog = [];
    };
    MCT1.prototype.calculateTotalActivityCost = function () {
        var _this = this;
        var moveActivities = this.extractActivitiesFromMoveLog();
        var nonMoveActivities = this.nonMoveActivityLog;
        // Join activity arrays into a single activities array
        var activities = moveActivities.concat(nonMoveActivities);
        // log('######### activities #########')
        // activities.forEach(activity => log(activity))
        var totalActivityCost = 0;
        activities.forEach(function (activity) {
            var isSuper = false;
            if (activity.includes('SUPER_')) {
                isSuper = true;
                activity = activity.replace('SUPER_', '');
            }
            var activityCost = parseFloat(activities_1.activityCosts[activity]);
            totalActivityCost += isSuper
                ? activityCost * _this.superActivityMultiplier
                : activityCost;
        });
        return totalActivityCost;
    };
    MCT1.prototype.setInsulinSensitivity = function (totalActivityCost) {
        if (totalActivityCost >= 0 && totalActivityCost <= 0.075) {
            this.insulinSensitivityMultiplier = 1;
        }
        else if (totalActivityCost > 0.075 && totalActivityCost <= 0.5) {
            this.insulinSensitivityMultiplier = 1.2;
        }
        else if (totalActivityCost > 0.5 && totalActivityCost <= 1.25) {
            this.insulinSensitivityMultiplier = 1.5;
        }
        else if (totalActivityCost > 1.25) {
            this.insulinSensitivityMultiplier = 1.8;
        }
    };
    MCT1.prototype.extractActivitiesFromMoveLog = function () {
        var activities = [];
        // iterate over moveActivityLog and determine activities
        var distTravelled = 0;
        this.moveActivityLog.forEach(function (mLog, i) {
            var isUpward = mLog.to.y.toFixed(2) > mLog.from.y.toFixed(2);
            var activity;
            if (mLog.blockType == 'LADDER') {
                activity = activities_1.activityTypes.CLIMB_LADDER;
            }
            else if (mLog.blockType == 'VINE') {
                activity = activities_1.activityTypes.CLIMB_VINE;
            }
            else if (mLog.blockType.includes('WATER')) {
                activity = activities_1.activityTypes.SWIM;
            }
            else if (isUpward && mLog.isSprinting) {
                activity = activities_1.activityTypes.SPRINT_JUMP;
            }
            else if (isUpward) {
                activity = activities_1.activityTypes.JUMP;
            }
            else if (mLog.isSprinting) {
                activity = activities_1.activityTypes.SPRINT;
            }
            else {
                activity = activities_1.activityTypes.WALK;
            }
            if (mLog.isSuper) {
                activity = "SUPER_" + activity;
            }
            // calc distTravelled
            var xDiff = mLog.to.x - mLog.from.x;
            var yDiff = mLog.to.y - mLog.from.y;
            var distVertical = mLog.to.z - mLog.from.z;
            var distHorizontal = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
            var distTotal = Math.sqrt(distVertical * distVertical + distHorizontal * distHorizontal);
            // log('distTotal: ' + distTotal);
            distTravelled += distTotal;
            if (distTravelled >= 1) {
                distTravelled -= 1; // reset
                if (activity == activities_1.activityTypes.SPRINT_JUMP ||
                    activity == activities_1.activityTypes.JUMP) {
                    var lastActitiy = activities[activities.length - 1];
                    if (activity != lastActitiy) {
                        activities.push(activity);
                    }
                }
                else {
                    activities.push(activity);
                }
            }
        });
        return activities;
    };
    MCT1.prototype.setDemoInventory = function () {
        var server = __plugin.server;
        var sender = __plugin.server.consoleSender;
        server.dispatchCommand(sender, "clear " + this.player.name);
        foods_1.default.forEach(function (item) {
            // server.dispatchCommand(
            //     sender,
            //     `give ${this.player.name} ${item.type}`
            // )
        });
        server.dispatchCommand(sender, "give " + this.player.name + " cooked_chicken 1");
        if (this.hasLightningSnowballs) {
            this.ensureInfiniteSnowballs();
        }
        if (this.hasInfiniteInsulin) {
            this.ensureInfiniteInsulin();
        }
    };
    MCT1.prototype.ensureInfiniteSnowballs = function () {
        var _this = this;
        var itemInSlot = this.mct1Player.inventory.getItem(this.snowballSlot);
        if (!itemInSlot || !this.isLightningSnowballStack(itemInSlot)) {
            this.mct1Player.inventory.bumpItemIntoSlot(this.snowballSlot, this.makeLigtningSnowballItemStack(1));
        }
        // now make sure there aren't any duplicates
        this.mct1Player
            .inventory.getAllitemStacks()
            .forEach(function (itemStack, i) {
            if (i != _this.snowballSlot &&
                itemStack &&
                _this.isLightningSnowballStack(itemStack)) {
                _this.mct1Player.inventory.setEmpty(i);
            }
        });
    };
    MCT1.prototype.removeInfiniteSnowballs = function () {
        var _this = this;
        this.mct1Player
            .inventory.getAllitemStacks()
            .forEach(function (itemStack, i) {
            if (itemStack && _this.isLightningSnowballStack(itemStack)) {
                _this.mct1Player.inventory.setEmpty(i);
            }
        });
    };
    MCT1.prototype.ensureInfiniteInsulin = function () {
        var _this = this;
        var itemInSlot = this.mct1Player.inventory.getItem(this.insulinSlot);
        if (!itemInSlot || !this.isInsulinStack(itemInSlot)) {
            this.mct1Player.inventory.bumpItemIntoSlot(this.insulinSlot, this.makeInsulinStack(1));
        }
        // now make sure there aren't any duplicates
        this.mct1Player
            .inventory.getAllitemStacks()
            .forEach(function (itemStack, i) {
            if (i != _this.insulinSlot &&
                itemStack &&
                _this.isInsulinStack(itemStack)) {
                _this.mct1Player.inventory.setEmpty(i);
            }
        });
    };
    MCT1.prototype.removeInfiniteInsulin = function () {
        var _this = this;
        this.mct1Player
            .inventory.getAllitemStacks()
            .forEach(function (itemStack, i) {
            if (itemStack && _this.isInsulinStack(itemStack)) {
                _this.mct1Player.inventory.setEmpty(i);
            }
        });
    };
    MCT1.prototype.zapZaps = function () {
        return ['ZAP!', 'BAM!', 'POW!', 'BOOM!', 'CRASH!', 'ZAP!', 'ZAP!'];
    };
    MCT1.prototype.makeInsulinStack = function (num) {
        if (num === void 0) { num = 1; }
        var potion = items.potion(num);
        var potionMeta = potion.getItemMeta();
        potionMeta.setDisplayName('Insulin');
        potionMeta.setColor(Color.AQUA);
        potion.setItemMeta(potionMeta);
        return potion;
    };
    MCT1.prototype.isInsulinStack = function (itemStack) {
        return (itemStack.type == 'POTION' &&
            itemStack.itemMeta &&
            itemStack.itemMeta.displayName &&
            itemStack.itemMeta.displayName == 'Insulin');
    };
    MCT1.prototype.isLightningSnowballStack = function (itemStack) {
        return (itemStack.type == 'SNOW_BALL' &&
            itemStack.itemMeta &&
            itemStack.itemMeta.displayName &&
            this.zapZaps().includes(itemStack.itemMeta.displayName));
    };
    return MCT1;
}());
exports.MCT1 = MCT1;
