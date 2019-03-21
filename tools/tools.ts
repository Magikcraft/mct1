import utils = require('utils')
const Location = Java.type('org.bukkit.Location')
const Material = Java.type('org.bukkit.Material')
const ItemStack = Java.type('org.bukkit.inventory.ItemStack')
const Color = Java.type('org.bukkit.Color')

export function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

export function locationToJSON(location) {
    return {
        worldName: location.world.name,
        x: location.x,
        y: location.y,
        z: location.z,
        yaw: location.yaw,
        pitch: location.pitch,
    }
}

export function locationFromJSON(locationJSON) {
    const world = utils.world(locationJSON.worldName)
    if (!world) return undefined
    return new Location(
        world,
        locationJSON.x,
        locationJSON.y,
        locationJSON.z,
        locationJSON.yaw,
        locationJSON.pitch
    )
}

export function itemStackToJSON(itemStack) {
    // if (itemStack.itemMeta && itemStack.itemMeta.pages) {
    //     const pages: any[] = []
    //     itemStack.itemMeta.pages.forEach(page => pages.push(page))
    //     log('pages', JSON.stringify(pages))
    // }

    return {
        type: itemStack.type.toString(),
        amount: itemStack.amount,
        data: itemStack.data || undefined,
        meta: {
            displayName:
                itemStack.itemMeta && itemStack.itemMeta.displayName
                    ? itemStack.itemMeta.displayName
                    : undefined,
            // Potion can have color
            colorRGB:
                itemStack.itemMeta && itemStack.itemMeta.color
                    ? itemStack.itemMeta.color.asRGB()
                    : undefined,
            // Book has title, author, pages
            title:
                itemStack.itemMeta && itemStack.itemMeta.title
                    ? itemStack.itemMeta.title
                    : undefined,
            author:
                itemStack.itemMeta && itemStack.itemMeta.author
                    ? itemStack.itemMeta.author
                    : undefined,
            pages:
                itemStack.itemMeta && itemStack.itemMeta.pages
                    ? // ? itemStack.itemMeta.pages
                      _pagestoJSON(itemStack.itemMeta.pages)
                    : undefined,
        },
    }
}

export function itemStackFromJSON(itemStackJSON) {
    const itemStack = new ItemStack(
        Material[itemStackJSON.type],
        itemStackJSON.amount
    )
    if (itemStackJSON.data) itemStack.setData(itemStackJSON.data)

    // itemMeta
    const itemMeta = itemStack.getItemMeta()
    if (itemStackJSON.meta.displayName)
        itemMeta.setDisplayName(itemStackJSON.meta.displayName)
    if (itemStackJSON.meta.colorRGB)
        itemMeta.setColor(Color.fromRGB(itemStackJSON.meta.colorRGB))
    if (itemStackJSON.meta.title) itemMeta.setTitle(itemStackJSON.meta.title)
    if (itemStackJSON.meta.author) itemMeta.setAuthor(itemStackJSON.meta.author)
    if (itemStackJSON.meta.pages) itemMeta.setPages(itemStackJSON.meta.pages)

    itemStack.setItemMeta(itemMeta)
    return itemStack
}

function _pagestoJSON(pages) {
    const _pages: any[] = []
    pages.forEach(page => _pages.push(page.toString()))
    return _pages
}

export function range(num: number, offset: number = 0) {
    return Array.apply(null, Array(num)).map((_, i) => i + offset)
}
