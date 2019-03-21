import entities = require('entities');
import MobTools = require('mct1/mobs');
const Effect = Java.type('org.bukkit.Effect')
const Sound = Java.type('org.bukkit.Sound')
const Particle = Java.type('org.bukkit.Particle')
const Material = Java.type('org.bukkit.Material')
const Location = Java.type('org.bukkit.Location')
const Vector = Java.type('org.bukkit.util.Vector')
const ItemStack = Java.type('org.bukkit.inventory.ItemStack')
import items = require('items');
const Color = Java.type('org.bukkit.Color')

import { Vector3 } from 'mct1/vector3'
var utils = require('utils')

import { Logger } from 'mct1/log'
const log = Logger(`${[__dirname, __filename].join('/')}`)

export function shootFireballAtTarget(entity, targetLoc) {
    const fb = Java.type("org.bukkit.entity.LargeFireball").class;

    const loc1 = entity.location;
    const loc2 = targetLoc;

    const vec = new Vector(loc1.x - loc2.x, loc1.y - loc2.y, loc1.z - loc2.z).normalize();
    entity.launchProjectile(fb, vec);
}

export function shootDispenser(block, projectileType) {
    const dispenser = block.getState();
    dispenser.inventory.addItem(new ItemStack(Material[projectileType], 1));
    dispenser.dispense();
    if (projectileType.includes('BUCKET')) {
        dispenser.inventory.remove(items.bucket(1))
    }
}

export function createBook(title: string, author: string, pages: any = []) {
    var ItemStack = org.bukkit.inventory.ItemStack;
    var BookMeta = org.bukkit.inventory.meta.BookMeta;
    var Material = org.bukkit.Material;
    var book = new ItemStack(Material.WRITTEN_BOOK, 1);
    var bookMeta = book.getItemMeta();
    bookMeta.setTitle(title) // << Nothing more than 16 chars
    bookMeta.setAuthor(author) // << Would be player name
    bookMeta.setPages(pages);
    book.setItemMeta(bookMeta);
    return book
}

export function openDoorAtLocation(loc, playSound = true) {
    const doorBlock = loc.world.getBlockAt(loc.x, loc.y, loc.z);

    if (doorBlock.data < 4) { // open door
        doorBlock.setData(doorBlock.data + 4);
        if (playSound) {
            const effect = (String(doorBlock.type).indexOf('IRON') !== -1) ? Effect.IRON_DOOR_TOGGLE : Effect.DOOR_TOGGLE;
            loc.world.playEffect(loc, effect, 0);
        }
    }
}

export function closeDoorAtLocation(loc, playSound = true) {
    const doorBlock = loc.world.getBlockAt(loc.x, loc.y, loc.z);
    if (doorBlock.data > 4) { // door is open
        doorBlock.setData(doorBlock.data - 4); // close door
        if (playSound) {
            const effect = (String(doorBlock.type).indexOf('IRON') !== -1) ? Effect.IRON_DOOR_CLOSE : Effect.DOOR_CLOSE;
            loc.world.playEffect(loc, effect, 0);
        }
    }
}

export function showHeartEffectAtLocation(loc) {
    loc.world.playEffect(loc, Effect.HEART, 100);
}

export function spawnGlowingSquid(loc) {
    const mob = MobTools.spawn('squid', loc);
    applyPotionEffect('GLOWING', mob);
}

export function applyPotionEffect(type, entity) {
    const milliseconds = 100000;
    const color = 'WHITE';
    const amplifier = 1;
    const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType')
    if (entity && entity.hasPotionEffect(PotionEffectType[type]) == true) {
        // Skip if effect already active!
        return
    }
    const PotionEffect = Java.type('org.bukkit.potion.PotionEffect')
    const Color = Java.type('org.bukkit.Color')
    const duration = milliseconds / 1000 * 40 // 20 tick. 1 tick = 0.05 seconds
    const c = Color[color]
    const l = PotionEffectType[type]
    const effect = new PotionEffect(l, duration, amplifier, true, true, c)
    entity.addPotionEffect(effect)
}

export function cancelPotionEffect(type, entity) {
    const PotionEffectType = Java.type('org.bukkit.potion.PotionEffectType')
    if (entity && entity.hasPotionEffect(PotionEffectType[type]) == true) {
        entity.removePotionEffect(PotionEffectType[type])
    }
}

export function replaceRegionV1(region, materialType) {
    const world = utils.world(region.getWorld());
    const startLoc: Vector3 = new Vector3(
        Math.min(...region.xArray()),
        Math.min(...region.yArray()),
        Math.min(...region.zArray())
    )
    for (let y = startLoc.y; y <= startLoc.y + region.yLength(); y++) {
        for (let x = startLoc.x; x <= startLoc.x + region.xLength(); x++) {
            for (let z = startLoc.z; z <= startLoc.z + region.zLength(); z++) {
                const block = world.getBlockAt(x, y, z)
                block.setType(Material[materialType])
            }
        }
    }
}

export function getAllBlocksInRegion(loc1, loc2) {
    const blocks: any[] = [];
    let x1 = (loc1.x < loc2.x) ? loc1.x : loc2.x
    let x2 = (loc1.x > loc2.x) ? loc1.x : loc2.x
    let y1 = (loc1.y < loc2.y) ? loc1.y : loc2.y
    let y2 = (loc1.y > loc2.y) ? loc1.y : loc2.y
    let z1 = (loc1.z < loc2.z) ? loc1.z : loc2.z
    let z2 = (loc1.z > loc2.z) ? loc1.z : loc2.z
    for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
            for (let z = z1; z <= z2; z++) {
                blocks.push(new Location(loc1.world, x, y, z).block)
            }
        }
    }
    return blocks
}

export function putItemsInChest(chestBlockLocation, itemStacks, randomSlots = true) {
    const chestBlock = chestBlockLocation.block
    const chest = chestBlock.getState();
    if (randomSlots) {
        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
        const slotNums = shuffleArray(Array.apply(null, Array(24)).map((_, i) => i));
        itemStacks.forEach((itemStack) => {
            const slotNum = 1;
            chest.inventory.setItem(slotNums.pop(), itemStack);
        })
    }
    else {
        itemStacks.forEach((itemStack) => {
            chest.inventory.addItem(itemStack);
        })
    }
}

export function makeInsulinStack(num = 1) {
    const potion = items.potion(num);
    const potionMeta = potion.getItemMeta();
    potionMeta.setDisplayName('Insulin');
    potionMeta.setColor(Color.AQUA);
    potion.setItemMeta(potionMeta);
    return potion
}

export function makeInvisibleArmourStand(loc) {
    const tmpLoc = new Location(loc.world, 0, 1, 0) // put here while visible
    const stand = loc.world.spawnEntity(tmpLoc, entities['armor_stand']());
    stand.setVisible(false);
    stand.teleport(loc); // now it's invisible move it into location
    return stand
}

export function replaceRegion(loc1, loc2, blockType) {
    getAllBlocksInRegion(loc1, loc2).forEach(block => block.setType(Material[blockType]))
}

export function playEffectAtLocation(loc, effectType) {
    loc.world.playEffect(loc, Effect[effectType], 100)
}

export function playSoundAtLocation(loc, soundType) {
    loc.world.playSound(loc, Sound[soundType], 9, 1);
}

export function playEffectInRegion(loc1, loc2, effectType) {
    getAllBlocksInRegion(loc1, loc2).forEach(block => {
        block.location.world.playEffect(block.location, Effect[effectType], 100)
    })
}
