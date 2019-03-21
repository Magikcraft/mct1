import * as fs from 'mct1/utils/fs'

import { Logger } from 'mct1/log'
const log = Logger(`${[__dirname, __filename].join('/')}`)

export default class DB {
    player
    isLoading: boolean
    private database

    filename: string

    constructor(player) {
        this.player = player
        this.isLoading = true
        this.filename = `database/players/${this.player.name}.json`
        this.database = {}
        this.init()
    }

    get(key: string) {
        return (this.database[key])
            ? this.database[key]
            : undefined
    }

    getAll() {
        return this.database
    }

    set(key: string, data: any) {
        this.database[key] = data
        this._save()
    }

    delete(key) {
        delete this.database[key]
        this._save()
    }

    dump() {
        log(`DB Data for ${this.player.name}:`, JSON.stringify(this.database, null, 2))
    }

    private _save() {
        // Save to filesystem
        fs.writeFile(this.filename, JSON.stringify(this.database, null, 2))

        // TODO:
        this.exportRemote()
    }

    private init() {
        // TODO:
        this.fetchRemote()

        try {
            // ansync read data from filesystem
            const database = JSON.parse(fs.readFile(this.filename))
            this.database = database
        } catch (e) {
            // Fuck JSON.parse
        }

        // Done!
        this.isLoading = false

        // TEMP
        // this.dump()
    }

    private fetchRemote() {
        // ansync fetch all player data from remote DB
        // TODO
    }

    private exportRemote() {
        // async send player data row to remote DB
        // TODO
    }
}