"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var questTools = require("../quest-tools");
var journals_1 = require("./journals");
var items = require('items');
exports.ChestItems = {
    jailCell: [
        questTools.makeInsulinStack(1),
        items.cookedChicken(5),
    ],
    jail: [
        journals_1.Journals.jail2,
        items.cookedChicken(5),
    ],
    sunken: [
        journals_1.Journals.sunken,
        items.ironSword(1),
        items.shield(1),
        items.legacyCookedFish(2),
        items.bakedPotato(2),
        items.bread(2),
        items.apple(5),
        items.cookie(5),
        items.carrot(3),
    ],
    magmarun: [
        journals_1.Journals.magmarun,
        items.cookedChicken(3),
        items.legacyCookedFish(3),
        items.bakedPotato(3),
        items.bread(8),
        items.apple(5),
        items.cookie(5),
        items.carrot(3),
    ],
    magmaboss: [
        journals_1.Journals.magmaboss,
        items.cookedChicken(10),
        items.legacyCookedFish(10),
        items.bakedPotato(10),
        items.bread(10),
        items.apple(10),
        items.cookie(10),
        items.carrot(10),
    ],
};
