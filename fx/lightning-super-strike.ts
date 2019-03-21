const Location = Java.type('org.bukkit.Location')
import { Logger } from '@magikcraft/mct1/log'
const log = Logger(__filename)

export function kaboom(loc, distance = 10, delay = 100) {
    setTimeout(() => {
        const d = distance
        const locs = [
            new Location(loc.world, loc.x + d, loc.y + 0, loc.z + d),
            new Location(loc.world, loc.x - d, loc.y + 0, loc.z + d),
            new Location(loc.world, loc.x + d, loc.y + 0, loc.z - d),
            new Location(loc.world, loc.x - d, loc.y + 0, loc.z - d),
            new Location(loc.world, loc.x + d, loc.y + 0, loc.z + 0),
            new Location(loc.world, loc.x - d, loc.y + 0, loc.z + 0),
            new Location(loc.world, loc.x + 0, loc.y + 0, loc.z + d),
            new Location(loc.world, loc.x + 0, loc.y + 0, loc.z - d),
        ]
        locs.forEach(location => {
            location.world.strikeLightning(location)
        })

        if (distance > 0) {
            distance--
            kaboom(loc, distance, delay)
        }
    }, delay)
}
