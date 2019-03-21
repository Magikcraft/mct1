import User from './user'
export * from './permissions'
export * from './effects'

// We have used the "user" namespace for this to distinguish it from the "player".

// Stores all user instances by player names.
const Users: any = {}

// Main getter method for a user.
// Example usage: `user(player).mct1.start()`
export function user(player): User {
    if (!player) {
        throw new Error('No Player passed in!')
    }
    if (!Users[player.name]) {
        Users[player.name] = new User(player)
    }
    return Users[player.name]
}

// Deletes the user.
export function userDelete(player) {
    if (Users[player.name]) {
        Users[player.name].cleanse()
        delete Users[player.name]
    }
}
