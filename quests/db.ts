import * as fs from 'mct1/utils/fs'

export default class DB {
    questName: string
    isLoading: boolean
    private database

    filename: string

    constructor(questName) {
        this.questName = questName
        this.isLoading = true
        this.filename = `database/questTracking/${this.questName}.json`
        this.database = []
        this.init()
    }

    // get () {
    // 	return (this.database)
    // 		? this.database
    // 		: undefined
    // }

    // getAll () {
    // 	return this.database
    // }

    push(data: any) {
        this.database.push(data)
        this._save()
    }

    private _save() {
        // Save to filesystem
        fs.writeFile(this.filename, JSON.stringify(this.database, null, 2))
    }

    private init() {
        try {
            // ansync read data from filesystem
            const database = JSON.parse(fs.readFile(this.filename))
            this.database = database
        } catch (e) {
            // Boo JSON.parse
        }

        // Done!
        this.isLoading = false
    }
}