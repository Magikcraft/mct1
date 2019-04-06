"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events = require("events");
var quests_1 = require("../quests");
var log_1 = require("../log");
var log = log_1.Logger('event-entity-portal-enter');
log('############ register entityPortalEnter');
events.playerPortal(function (event) {
    log('playerPortal');
    // if (event.entity.type != 'PLAYER') {
    //     return
    // }
    // event.getHandlers().unregisterAll​()
    // log('event.handlers.length', ''+event.handlers.length) 
    var _a = event.from, world = _a.world, x = _a.x, y = _a.y, z = _a.z;
    log('from {x,y,z}', JSON.stringify({ x: Math.round(x), y: Math.round(y), z: Math.round(z) }));
    if (world.name == 'world' && x <= -139 && x >= -141 && y >= 58 && y <= 61 && z >= 217 && z <= 218) {
        log("Entered Portal MCT1 AU / NZ");
        quests_1.questCommand('mct1', 'start', event.player, { mode: 'single' });
        event.setCancelled(true);
    }
    if (world.name == 'world' && x <= -139 && x >= -141 && y >= 58 && y <= 61 && z >= 212 && z <= 213) {
        log("Entered Portal MCT1 USA");
        quests_1.questCommand('mct1', 'start', event.player, { mode: 'single', units: 'mgdl' });
        event.setCancelled(true);
    }
    event.setCancelled(true);
});
