import * as fs from 'mct1/utils/fs'
import { Logger } from 'mct1/log'
import * as server from 'mct1/utils/server'
import { QuestConfig } from 'quests/Quest'

const utils = require('utils') // tslint:disable-line

const log = Logger(`${[__dirname, __filename].join('/')}`)

const quests = {
    'mct1': { // alias for mct1-prologue
        filePath: 'mct1/quests/mct1/prologue',
        worldName: 'mct1-start',
        nextQuestName: 'mct1-jail',
    },
    'mct1-prologue': {
        filePath: 'mct1/quests/mct1/prologue',
        worldName: 'mct1-start',
        nextQuestName: 'mct1-jail',
    },
    'mct1-jail': {
        filePath: 'mct1/quests/mct1/jail',
        worldName: 'mct1-jail',
        nextQuestName: 'mct1-sunken',
    },
    'mct1-sunken': {
        filePath: 'mct1/quests/mct1/sunken',
        worldName: 'mct1-sunken-v2',
        nextQuestName: 'mct1-magmarun',
    },
    'mct1-magmarun': {
        filePath: 'mct1/quests/mct1/magmarun',
        worldName: 'mct1-magmarun',
        nextQuestName: 'mct1-magmaboss',
    },
    'mct1-magmaboss': {
        filePath: 'mct1/quests/mct1/magmaboss',
        worldName: 'mct1-magmaboss',
        nextQuestName: 'mct1-breakout',
    },
    'mct1-breakout': {
        filePath: 'mct1/quests/mct1/breakout',
        worldName: 'mct1-breakout',
        nextQuestName: 'mct1-village',
    },
    'mct1-village': {
        filePath: 'mct1/quests/mct1/village',
        worldName: 'mct1-start',
        nextQuestName: 'mct1-breakout2',
    },
    'mct1-breakout2': {
        filePath: 'mct1/quests/mct1/breakout2',
        worldName: 'mct1-breakout',
        nextQuestName: 'mct1-village',
    },
}

const availableQuests = Object.keys(quests).sort().reduce((prev, current) => `${prev}, ${current}`)

export function questCommand(questName, method, player, opts) {
    const quest = quests[questName]

    if (!questName || !quest) {
        echo(player, `Usage: /quest <quest-name> <command> <player>`)
        return echo(player, `Available quests: ${availableQuests}`)
    }
    const templateWorldName = quests[questName].worldName
    const worldName = opts.mode === 'single'
        ? `${templateWorldName}--${player.name}`
        : `${templateWorldName}-multi`

    doCommand(worldName, templateWorldName, questName, player, method, opts)
}

function mv() {
    return __plugin.server
        .getPluginManager()
        .getPlugin('Multiverse-Core')
}

function importWorld(templateWorldName: string) {
    server.executeCommand(`mv import ${templateWorldName} normal`)
}

function deleteWorld(worldName: string, cb) {
    try {
        mv().deleteWorld(worldName)
        if (fs.exists(`./${worldName}`)) {
            fs.remove(`./${worldName}`)
        }
        cb && cb()
    } catch (e) {
        log(e)
        cb && cb(e)
    }
}

function cloneWorld(worldName: string, templateWorldName: string, cb) {
    try {
        log(`Cloning ${worldName}`)
        server.executeCommand(`mv import ${templateWorldName} normal`)
        const success = mv().cloneWorld(templateWorldName, worldName, 'normal')
        if (!success) {
            log(`Failed to clone world ${templateWorldName}`)
            return cb && cb(`Failed to clone world`)
        }
        const world = utils.world(worldName)
        log(`World clone complete for ${worldName}`)
        return cb && cb(null, world)
    } catch (e) {
        log(e)
        return cb && cb(e, null)
    }
}

function createQuest({ questName, player, world, opts }) {
    // This dynamic import is a code smell
    // It needs a higher-order abstraction that takes a configuration object
    const QuestClass = require(quests[questName].filePath).default;

    const questConfig: QuestConfig = {
        name: questName,
        nextQuestName: quests[questName].nextQuestName,
        player,
        world,
        options: opts
    }

    const quest = new QuestClass(questConfig)
    return quest
}

function doCommand(worldName, templateWorldName, questName, player, method, opts) {
    switch (method) {
        case 'start':
            echo(player, `Starting quest ${questName}...`)
            deleteWorld(worldName, err => {
                if (err) {
                    return
                }
                cloneWorld(worldName, templateWorldName, (err, world) => {
                    if (err) {
                        return
                    }
                    const quest = createQuest({ opts, player, questName, world })
                    quest.start()
                })
            })
            break
        case 'import':
            importWorld(templateWorldName)
            break
        case 'stop':
            // Deleting the world kicks the player from the world
            // This triggers the playerChangedWorld event, which calls the stop() method
            // of the quest object, doing quest cleanup.
            deleteWorld(worldName, () => log(`Deleted ${worldName}`))
            break
    }
}
