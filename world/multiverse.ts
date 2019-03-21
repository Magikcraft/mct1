// export function Multiverse() {

// }

// const Multiverse = __plugin.server
//         .getPluginManager()
//         .getPlugin('Multiverse-Core')

interface IMultiverse {
    cloneWorld(
        templateWorldName: string,
        worldName: string,
        mode: 'normal'
    ): BukkitWorld
    deleteWorld(worldName: string)
}

export const Multiverse = (): IMultiverse =>
    __plugin.server.getPluginManager().getPlugin('Multiverse-Core')
