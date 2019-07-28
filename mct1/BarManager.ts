import { BossBar } from '@magikcraft/core'

const Mct1BarNamespace = 'mct1-bars'

interface PlayerBarCache {
    bgl: BossBar
    insulin: BossBar
    digestion1: BossBar
    digestion2: BossBar
}

interface BarCache {
    players: {
        [playername: string]: PlayerBarCache
    }
}
class BarManagerClass {
    barCache: BarCache = {} as BarCache

    getBglBar(player: Player) {
        const bars = this.getPlayerCache(player)
        if (!bars.bgl) {
            bars.bgl = new BossBar(
                player,
                Mct1BarNamespace,
                `${player.name}-bgl`
            )
            bars.bgl.style(BossBar.Style.NOTCHED_20)
        }
        return bars.bgl
    }

    getInsulinBar(player) {
        const bars = this.getPlayerCache(player)
        if (!bars.insulin) {
            bars.insulin = new BossBar(
                player,
                Mct1BarNamespace,
                `${player.name}-insulin`
            )
            bars.insulin
                .color(BossBar.Color.BLUE)
                .style(BossBar.Style.NOTCHED_20)
        }
        return bars.insulin
    }

    getDigestionBar1(player) {
        const bars = this.getPlayerCache(player)
        if (!bars.digestion1) {
            bars.digestion1 = new BossBar(
                player,
                Mct1BarNamespace,
                `${player.name}-digestion1`
            )
            bars.digestion1
                .color(BossBar.Color.BLUE)
                .style(BossBar.Style.NOTCHED_20)
        }
        return bars.digestion1
    }

    getDigestionBar2(player) {
        const bars = this.getPlayerCache(player)
        if (!bars.digestion2) {
            bars.digestion2 = new BossBar(
                player,
                Mct1BarNamespace,
                `${player.name}-digestion2`
            )
            bars.digestion2
                .color(BossBar.Color.BLUE)
                .style(BossBar.Style.NOTCHED_20)
        }
        return bars.digestion2
    }

    removeDigestionBar1(player) {
        this.removeBarsImpl(`${Mct1BarNamespace}:${player.name}-digestion1`)
        delete this.getPlayerCache(player).digestion1
    }

    removeDigestionBar2(player) {
        this.removeBarsImpl(`${Mct1BarNamespace}:${player.name}-digestion2`)
        delete this.getPlayerCache(player).digestion2
    }

    removeBars(player) {
        this.removeBarsImpl(`${Mct1BarNamespace}:${player.name}-`)
        delete this.getPlayerCache(player).bgl
        delete this.getPlayerCache(player).insulin
        delete this.getPlayerCache(player).digestion1
        delete this.getPlayerCache(player).digestion2
    }

    removeAllBars() {
        this.removeBarsImpl(`${Mct1BarNamespace}:`)
    }

    private removeBarsImpl(predicate: string) {
        const keys: NamespacedKey[] = []
        const bossBars = __plugin.server.getBossBars()
        while (bossBars.hasNext()) {
            const b = bossBars.next()
            keys.push(b.getKey())
        }
        keys.filter(k => k.toString().indexOf(predicate) === 0).forEach(k => {
            const bar = __plugin.server.getBossBar(k)
            if (bar) {
                bar.removeAll()
            }
            __plugin.server.removeBossBar(k)
        })
    }

    private getPlayerCache(player): PlayerBarCache {
        if (!this.barCache[player.name]) {
            this.barCache[player.name] = {}
        }
        return this.barCache[player.name]
    }
}

const BarManager = new BarManagerClass()

export default BarManager
