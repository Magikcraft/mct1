import * as events from 'events'

import { questCommand } from '../quests'
import { Logger } from '../log'
const log = Logger('event-entity-portal-enter')

log('############ register entityPortalEnter')
events.playerPortal(event => {
    log('playerPortal')
    // if (event.entity.type != 'PLAYER') {
    //     return
    // }
    // event.getHandlers().unregisterAll​()
    // log('event.handlers.length', ''+event.handlers.length)

    const { world, x, y, z } = event.from
    log(
        'from {x,y,z}',
        JSON.stringify({ x: Math.round(x), y: Math.round(y), z: Math.round(z) })
    )

    if (
        world.name == 'world' &&
        x <= -139 &&
        x >= -141 &&
        y >= 58 &&
        y <= 61 &&
        z >= 217 &&
        z <= 218
    ) {
        log(`Entered Portal MCT1 AU / NZ`)
        questCommand('mct1', 'start', event.player, { mode: 'single' })
        event.setCancelled(true)
    }
    if (
        world.name == 'world' &&
        x <= -139 &&
        x >= -141 &&
        y >= 58 &&
        y <= 61 &&
        z >= 212 &&
        z <= 213
    ) {
        log(`Entered Portal MCT1 USA`)
        questCommand('mct1', 'start', event.player, {
            mode: 'single',
            units: 'mgdl',
        })
        event.setCancelled(true)
    }

    event.setCancelled(true)
})
