import MCT1Player from './MCT1Player'
class MCT1PlayerCacheClass {
    private cache: {
        [playername: string]: MCT1Player
    } = {}

    public getMct1Player(player: BukkitPlayer) {
        if (!player) {
            throw new Error('No Player passed in!')
        }
        if (!MCT1PlayerCache.cache[player.name]) {
            MCT1PlayerCache.cache[player.name] = new MCT1Player(player)
        }
        return MCT1PlayerCache.cache[player.name]
    }
    public deleteMct1Player(player: BukkitPlayer) {
        if (MCT1PlayerCache.cache[player.name]) {
            MCT1PlayerCache.cache[player.name].cleanse()
            MCT1PlayerCache.cache[player.name] = undefined as any
        }
    }
}

const MCT1PlayerCache = new MCT1PlayerCacheClass()

export default MCT1PlayerCache
