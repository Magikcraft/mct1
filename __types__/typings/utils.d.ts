interface JSONLoc {
    x: number
    y: number
    z: number
    yaw: number
    pitch: number
    world: BukkitWorld
}
declare module 'utils' {
    function player(name: string): BukkitPlayer
    function players(): BukkitPlayer[]
    function getWorld(world: any): BukkitWorld
    function world(world: any): BukkitWorld
    function locationToJSON(location: BukkitLocation): JSONLoc
    function locationFromJSON(location: JSONLoc): BukkitLocation
}
