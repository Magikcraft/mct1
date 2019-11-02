import { MCT1PlayerCache } from '../user'
import commando from '../utils/commando'
commando('units', (args, player) => {
    const mct1Player = MCT1PlayerCache.getMct1Player(player)
    const currentUnit = mct1Player.mct1.isUSA ? 'mgdl' : 'mmolL'
    echo(player, `Currently using ${currentUnit}`)

    if (args[0] === 'mmol') {
        mct1Player.mct1.isUSA = false
        echo(player, 'Now using mmolL')
        return true
    }
    if (args[0] === 'mgdl') {
        mct1Player.mct1.isUSA = true
        echo(player, 'Now using mgdl')
        return true
    }
    echo(player, 'Usage: /units <mmol | mgdl>')
    return true
})
