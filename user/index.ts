import MCT1Player from './MCT1Player'
export * from './effects'
export * from './permissions'

// We have used the "user" namespace for this to distinguish it from the "player".

// Stores all user instances by player names.
const MCT1Players: any = {}

// Main getter method for a user.
// Example usage: `user(player).mct1.start()`
export function makeMCT1Player(player): MCT1Player {
    if (!player) {
        throw new Error('No Player passed in!')
    }
    if (!MCT1Players[player.name]) {
        MCT1Players[player.name] = new MCT1Player(player)
    }
    return MCT1Players[player.name]
}

// Deletes the user.
export function userDelete(player) {
    if (MCT1Players[player.name]) {
        MCT1Players[player.name].cleanse()
        delete MCT1Players[player.name]
    }
}
