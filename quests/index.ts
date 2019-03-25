import { Logger } from '@magikcraft/mct1/log'
import * as Multiverse from '@magikcraft/mct1/world/multiverse'
import { QuestConfig } from 'quests/Quest'

const log = Logger(__filename)

const quests = {
    mct1: {
        // alias for mct1-prologue
        filePath: '@magikcraft/mct1/quests/mct1/prologue',
        worldName: 'mct1-start',
        nextQuestName: 'mct1-jail',
    },
    'mct1-prologue': {
        filePath: '@magikcraft/mct1/quests/mct1/prologue',
        worldName: 'mct1-start',
        nextQuestName: 'mct1-jail',
    },
    'mct1-jail': {
        filePath: '@magikcraft/mct1/quests/mct1/jail',
        worldName: 'mct1-jail',
        nextQuestName: 'mct1-sunken',
    },
    'mct1-sunken': {
        filePath: '@magikcraft/mct1/quests/mct1/sunken',
        worldName: 'mct1-sunken-v2',
        nextQuestName: 'mct1-magmarun',
    },
    'mct1-magmarun': {
        filePath: '@magikcraft/mct1/quests/mct1/magmarun',
        worldName: 'mct1-magmarun',
        nextQuestName: 'mct1-magmaboss',
    },
    'mct1-magmaboss': {
        filePath: '@magikcraft/mct1/quests/mct1/magmaboss',
        worldName: 'mct1-magmaboss',
        nextQuestName: 'mct1-breakout',
    },
    'mct1-breakout': {
        filePath: '@magikcraft/mct1/quests/mct1/breakout',
        worldName: 'mct1-breakout',
        nextQuestName: 'mct1-village',
    },
    'mct1-village': {
        filePath: '@magikcraft/mct1/quests/mct1/village',
        worldName: 'mct1-start',
        nextQuestName: 'mct1-breakout2',
    },
    'mct1-breakout2': {
        filePath: '@magikcraft/mct1/quests/mct1/breakout2',
        worldName: 'mct1-breakout',
        nextQuestName: 'mct1-village',
    },
}

const availableQuests = Object.keys(quests)
    .sort()
    .reduce((prev, current) => `${prev}, ${current}`)

export function questCommand(questName, method, player, opts) {
    const quest = quests[questName]

    if (!questName || !quest) {
        echo(player, `Usage: /quest <quest-name> <command> <player>`)
        return echo(player, `Available quests: ${availableQuests}`)
    }
    const templateWorldName = quests[questName].worldName
    const worldName =
        opts.mode === 'single'
            ? `${templateWorldName}--${player.name}`
            : `${templateWorldName}-multi`

    doCommand(worldName, templateWorldName, questName, player, method, opts)
}

function createQuest({ questName, player, world, opts }) {
    const QuestClass = require(quests[questName].filePath).default

    const questConfig: QuestConfig = {
        name: questName,
        nextQuestName: quests[questName].nextQuestName,
        player,
        world,
        options: opts,
    }

    const quest = new QuestClass(questConfig)
    return quest
}

async function doCommand(
    worldName,
    templateWorldName,
    questName,
    player,
    method,
    opts
) {
    switch (method) {
        case 'start':
            echo(player, `Starting quest ${questName}...`)
            const world = await Multiverse.cloneWorld(
                worldName,
                templateWorldName
            )
            createQuest({ opts, player, questName, world }).start()
            break
        case 'import':
            Multiverse.importWorld(templateWorldName)
            break
        case 'stop':
            // Deleting the world kicks the player from the world
            // This triggers the playerChangedWorld event, which calls the stop() method
            // of the quest object, doing quest cleanup.
            await Multiverse.destroyWorld(worldName)
            break
    }
}
