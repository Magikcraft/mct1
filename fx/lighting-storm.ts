import { Region } from '@magikcraft/mct1/regions'
import { Logger } from '@magikcraft/mct1/log'
const log = Logger(__filename)
var util = require('utils')

let lightningTimes = 0
let region: Region
let times: number
let delayMin: number
let delayAvg: number
let count: number = 0
let cap: number = 0
let stopped: boolean = false

export function start(
    _region: Region,
    _delayMin: number = 500,
    _delayAvg: number = 2500,
    _cap: number = Infinity
) {
    stopped = false
    region = _region
    delayMin = _delayMin || 500
    delayAvg = _delayAvg || 2500
    cap = _cap || Infinity
    _lightningStrike()
}

export function stop() {
    stopped = true
}

function _lightningStrike() {
    if (stopped) return

    var _region = region.randomPoint()
    var _location = _region.toLocation()
    _location.world.strikeLightning(_location)
    const interval = delayMin + Math.random() * delayAvg

    var players = _location.world.getPlayers()
    if (players.length >= 1 && count < cap) {
        count++
        setTimeout(() => {
            _lightningStrike()
        }, interval)
    }
}
