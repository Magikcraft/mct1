
import { Vector3 } from '@magikcraft/mct1/vector3'
import { Vector3World } from '@magikcraft/mct1/vector3/Vector3-WorldUtil'
import * as Mobs from '@magikcraft/mct1/mobs'
const teleport = require('teleport')
import { Logger } from "@magikcraft/mct1/log"
const log = Logger(__filename);

export default class Wither {
    region
    mob
    phase
    target

    constructor(region) {
        this.region = region
    }

    start() {
        // Spawn wither
        this.mob = Mobs.spawn('wither', this.region.randomPoint().toLocation());
        this.setTarget();
    }

    stop() {
        if (this.mob) this.mob.remove()
    }

    setPhase(num) {
        this.phase = num
    }

    setTarget() {
        const { region, mob, phase } = this
        switch (phase) {
            case 1: // attack random
                if (this.target) this.target.remove()
                const loc = region.randomPoint();
                this.target = Mobs.spawn('armor_stand', Vector3World.GetSunPos(loc).toLocation())
                this.target.setVisible(false)
                mob.setTarget(this.target)
                break
            case 2:
            default: // Hunt players
                let nearbyPlayer;
                mob.getNearbyEntities(40, 40, 40).forEach(function (entity) {
                    if (nearbyPlayer) return
                    if (entity.type == 'PLAYER') nearbyPlayer = entity
                });

                if (nearbyPlayer) {
                    log(`Make wither hunt nearby player ${nearbyPlayer.name}!`)
                    mob.setTarget(nearbyPlayer)
                    break // early return
                }

                // No Players near mob! Look for playerInWorld...
                let playerInWorld;
                mob.world.players.forEach((player) => {
                    if (playerInWorld) return
                    playerInWorld = player
                })

                if (playerInWorld) {
                    // Teleport wither near playerInWorld and attack!
                    log(`Make wither teleport to and hunt player ${playerInWorld.name}!`)
                    const randPointNearPlayer = Vector3.GetRandomPointAround(Vector3.FromLocation(playerInWorld.location), 16).toLocation()
                    teleport(mob, randPointNearPlayer)
                    mob.setTarget(playerInWorld)
                }

                break
        }

        if (!mob.isDead()) {
            setTimeout(() => {
                this.setTarget();
            }, 5000);
        }
    }
}