import * as questTools from '../quest-tools'
import { Journals } from './journals'
const items = require('items')

export const ChestItems = {
    jailCell: [questTools.makeInsulinStack(1), items.cookedChicken(5)],
    jail: [Journals.jail2, items.cookedChicken(5)],
    sunken: [
        Journals.sunken,
        items.ironSword(1),
        items.shield(1),
        items.cookedCod(2),
        items.bakedPotato(2),
        items.bread(2),
        items.apple(5),
        items.cookie(5),
        items.carrot(3),
    ],
    magmarun: [
        Journals.magmarun,
        items.cookedChicken(3),
        items.cookedCod(3),
        items.bakedPotato(3),
        items.bread(8),
        items.apple(5),
        items.cookie(5),
        items.carrot(3),
    ],
    magmaboss: [
        Journals.magmaboss,
        items.cookedChicken(10),
        items.cookedCod(10),
        items.bakedPotato(10),
        items.bread(10),
        items.apple(10),
        items.cookie(10),
        items.carrot(10),
    ],
}
