const entities = require('entities')
const Location = Java.type('org.bukkit.Location')

import { Logger } from '@magikcraft/mct1/log'
const log = Logger(__filename)

export function spawn(type, loc) {
    // entities.forEach(e => log('e', e))
    const mob = loc.world.spawnEntity(loc, entities[type]())
    return mob
}

export function targetLocation(mob, targetLoc, attackPlayersOnroute) {
    var mobLoc = mob.getLocation()
    var aiRange = 20
    var distanceToTarget = targetLoc.distance(mobLoc)
    var loc = targetLoc

    if (distanceToTarget > aiRange) {
        var percentDistance = aiRange / distanceToTarget
        loc = _lerp(mobLoc, targetLoc, percentDistance)
    }

    var tmpLoc = new Location(targetLoc.world, 0, 1, 0) // put here while visible
    var target = targetLoc.world.spawnEntity(tmpLoc, entities['armor_stand']())
    target.setVisible(false)
    target.teleport(loc) // now it's invisible move it into location
    mob.setTarget(target)

    setTimeout(function() {
        target.remove()

        if (mob.isDead()) return

        // Continue loop if mob is still aliave and is more than 16 blocks from target
        let continueLoop = targetLoc.distance(mob.getLocation()) > 16

        if (attackPlayersOnroute) {
            // Abort loop if there is a player with 16 block of mob.
            const nearbyEntities = mob.getNearbyEntities(16, 16, 16)
            nearbyEntities.forEach(entity => {
                if (entity.type == 'PLAYER') {
                    continueLoop = false
                }
            })
        }

        if (continueLoop) {
            targetLocation(mob, targetLoc, attackPlayersOnroute)
        }
    }, 2000)
}

/**
 * calculates a point at a percent of the distance between 2 points.
 */
function _lerp(loc1, loc2, percentage) {
    var _loc1 = loc1.clone()
    var value = _loc1.subtract(loc2)
    value = value.multiply(percentage)
    value = loc1.subtract(value)
    return value
}
