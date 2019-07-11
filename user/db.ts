import { Logger } from '../log'
import * as fs from '../utils/fs'

const log = Logger(__filename)

export default class DB {
    public player: { name: any }
    public isLoading: boolean

    public filename: string
    private database

    constructor(player) {
        this.player = player
        this.isLoading = true
        this.filename = `database/players/${this.player.name}.json`
        this.database = {}
        this.init()
    }

    public get(key: string) {
        return this.database[key] ? this.database[key] : undefined
    }

    public getAll() {
        return this.database
    }

    public set(key: string, data: any) {
        this.database[key] = data
        this._save()
    }

    public delete(key) {
        delete this.database[key]
        this._save()
    }

    public dump() {
        log(
            `DB Data for ${this.player.name}:`,
            JSON.stringify(this.database, null, 2)
        )
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
