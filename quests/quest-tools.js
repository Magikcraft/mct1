"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MobTools = require("@magikcraft/mct1/mobs");
var vector3_1 = require("@magikcraft/mct1/vector3");
var entities = require("entities");
var items = require("items");
var utils = require("utils");
var Effect = Java.type('org.bukkit.Effect');
var Sound = Java.type('org.bukkit.Sound');
var Material = Java.type('org.bukkit.Material');
var Location = Java.type('org.bukkit.Location');
var Vector = Java.type('org.bukkit.util.Vector');
var ItemStack = Java.type('org.bukkit.inventory.ItemStack');
var Color = Java.type('org.bukkit.Color');
function shootFireballAtTarget(entity, targetLoc) {
    var fb = Java.type('org.bukkit.entity.LargeFireball').class;
    var loc1 = entity.location;
    var loc2 = targetLoc;
    var vec = new Vector(loc1.x - loc2.x, loc1.y - loc2.y, loc1.z - loc2.z).normalize();
    entity.launchProjectile(fb, vec);
}
exports.shootFireballAtTarget = shootFireballAtTarget;
function shootDispenser(block, projectileType) {
    var dispenser = block.getState();
    dispenser.inventory.addItem(new ItemStack(Material[projectileType], 1));
    dispenser.dispense();
    if (projectileType.includes('BUCKET')) {
        dispenser.inventory.remove(items.bucket(1));
    }
}
exports.shootDispenser = shootDispenser;
function createBook(title, author, pages) {
    if (pages === void 0) { pages = []; }
    var ItemStack = org.bukkit.inventory.ItemStack;
    var BookMeta = org.bukkit.inventory.meta.BookMeta;
    var Material = org.bukkit.Material;
    var book = new ItemStack(Material.WRITTEN_BOOK, 1);
    var bookMeta = book.getItemMeta();
    bookMeta.setTitle(title); // << Nothing more than 16 chars
    bookMeta.setAuthor(author); // << Would be player name
    bookMeta.setPages(pages);
    book.setItemMeta(bookMeta);
    return book;
}
exports.createBook = createBook;
function openDoorAtLocation(loc, playSound) {
    if (playSound === void 0) { playSound = true; }
    var doorBlock = loc.world.getBlockAt(loc.x, loc.y, loc.z);
    if (doorBlock.data < 4) {
        // open door
        doorBlock.setData(doorBlock.data + 4);
        if (playSound) {
            var effect = String(doorBlock.type).indexOf('IRON') !== -1
                ? Effect.IRON_DOOR_TOGGLE
                : Effect.DOOR_TOGGLE;
            loc.world.playEffect(loc, effect, 0);
        }
    }
}
exports.openDoorAtLocation = openDoorAtLocation;
function closeDoorAtLocation(loc, playSound) {
    if (playSound === void 0) { playSound = true; }
    var doorBlock = loc.world.getBlockAt(loc.x, loc.y, loc.z);
    if (doorBlock.data > 4) {
        // door is open
        doorBlock.setData(doorBlock.data - 4); // close door
        if (playSound) {
            var effect = String(doorBlock.type).indexOf('IRON') !== -1
                ? Effect.IRON_DOOR_CLOSE
                : Effect.DOOR_CLOSE;
            loc.world.playEffect(loc, effect, 0);
        }
    }
}
exports.closeDoorAtLocation = closeDoorAtLocation;
function showHeartEffectAtLocation(loc) {
    loc.world.playEffect(loc, Effect.HEART, 100);
}
exports.showHeartEffectAtLocation = showHeartEffectAtLocation;
function spawnGlowingSquid(loc) {
    var mob = MobTools.spawn('squid', loc);
    applyPotionEffect('GLOWING', mob);
}
exports.spawnGlowingSquid = spawnGlowingSquid;
function applyPotionEffect(type, entity) {
    var milliseconds = 100000;
    var color = 'WHITE';
    var amplifier = 1;
    var PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType');
    if (entity && entity.hasPotionEffect(PotionEffectType[type]) == true) {
        // Skip if effect already active!
        return;
    }
    var PotionEffect = Java.type('org.bukkit.potion.PotionEffect');
    var Color = Java.type('org.bukkit.Color');
    var duration = (milliseconds / 1000) * 40; // 20 tick. 1 tick = 0.05 seconds
    var c = Color[color];
    var l = PotionEffectType[type];
    var effect = new PotionEffect(l, duration, amplifier, true, true, c);
    entity.addPotionEffect(effect);
}
exports.applyPotionEffect = applyPotionEffect;
function cancelPotionEffect(type, entity) {
    var PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType');
    if (entity && entity.hasPotionEffect(PotionEffectType[type]) == true) {
        entity.removePotionEffect(PotionEffectType[type]);
    }
}
exports.cancelPotionEffect = cancelPotionEffect;
function replaceRegionV1(region, materialType) {
    var world = utils.world(region.getWorld());
    var startLoc = new vector3_1.Vector3(Math.min.apply(Math, region.xArray()), Math.min.apply(Math, region.yArray()), Math.min.apply(Math, region.zArray()));
    for (var y = startLoc.y; y <= startLoc.y + region.yLength(); y++) {
        for (var x = startLoc.x; x <= startLoc.x + region.xLength(); x++) {
            for (var z = startLoc.z; z <= startLoc.z + region.zLength(); z++) {
                var block = world.getBlockAt(x, y, z);
                block.setType(Material[materialType]);
            }
        }
    }
}
exports.replaceRegionV1 = replaceRegionV1;
function getAllBlocksInRegion(loc1, loc2) {
    var blocks = [];
    var x1 = loc1.x < loc2.x ? loc1.x : loc2.x;
    var x2 = loc1.x > loc2.x ? loc1.x : loc2.x;
    var y1 = loc1.y < loc2.y ? loc1.y : loc2.y;
    var y2 = loc1.y > loc2.y ? loc1.y : loc2.y;
    var z1 = loc1.z < loc2.z ? loc1.z : loc2.z;
    var z2 = loc1.z > loc2.z ? loc1.z : loc2.z;
    for (var x = x1; x <= x2; x++) {
        for (var y = y1; y <= y2; y++) {
            for (var z = z1; z <= z2; z++) {
                blocks.push(new Location(loc1.world, x, y, z).block);
            }
        }
    }
    return blocks;
}
exports.getAllBlocksInRegion = getAllBlocksInRegion;
function putItemsInChest(chestBlockLocation, itemStacks, randomSlots) {
    if (randomSlots === void 0) { randomSlots = true; }
    var chestBlock = chestBlockLocation.block;
    var chest = chestBlock.getState();
    if (randomSlots) {
        var shuffleArray = function (array) {
            var _a;
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                _a = [array[j], array[i]], array[i] = _a[0], array[j] = _a[1];
            }
            return array;
        };
        var slotNums_1 = shuffleArray(Array.apply(null, Array(24)).map(function (_, i) { return i; }));
        itemStacks.forEach(function (itemStack) {
            var slotNum = 1;
            chest.inventory.setItem(slotNums_1.pop(), itemStack);
        });
    }
    else {
        itemStacks.forEach(function (itemStack) {
            chest.inventory.addItem(itemStack);
        });
    }
}
exports.putItemsInChest = putItemsInChest;
function makeInsulinStack(num) {
    if (num === void 0) { num = 1; }
    var potion = items.potion(num);
    var potionMeta = potion.getItemMeta();
    potionMeta.setDisplayName('Insulin');
    potionMeta.setColor(Color.AQUA);
    potion.setItemMeta(potionMeta);
    return potion;
}
exports.makeInsulinStack = makeInsulinStack;
function makeInvisibleArmourStand(loc) {
    var tmpLoc = new Location(loc.world, 0, 1, 0); // put here while visible
    var stand = loc.world.spawnEntity(tmpLoc, entities['armor_stand']());
    stand.setVisible(false);
    stand.teleport(loc); // now it's invisible move it into location
    return stand;
}
exports.makeInvisibleArmourStand = makeInvisibleArmourStand;
function replaceRegion(loc1, loc2, blockType) {
    getAllBlocksInRegion(loc1, loc2).forEach(function (block) {
        return block.setType(Material[blockType]);
    });
}
exports.replaceRegion = replaceRegion;
function playEffectAtLocation(loc, effectType) {
    loc.world.playEffect(loc, Effect[effectType], 100);
}
exports.playEffectAtLocation = playEffectAtLocation;
function playSoundAtLocation(loc, soundType) {
    loc.world.playSound(loc, Sound[soundType], 9, 1);
}
exports.playSoundAtLocation = playSoundAtLocation;
function playEffectInRegion(loc1, loc2, effectType) {
    getAllBlocksInRegion(loc1, loc2).forEach(function (block) {
        block.location.world.playEffect(block.location, Effect[effectType], 100);
    });
}
exports.playEffectInRegion = playEffectInRegion;
