declare module "utils" {
    function player(name: string): BukkitPlayer
    function players(): BukkitPlayer[]
    function getWorld(world: any): BukkitWorld
    function world(world: any): BukkitWorld
}