import { Logger } from '../log'
import { MCT1PlayerCache } from '../user'
import { WorldManager } from '../world'
import { Multiverse } from '../world/multiverse'
import { Quest, QuestConfig } from './Quest'

const log = Logger(__filename)

const quests = {
    'mct1-prologue': {
        filePath: '../quests/mct1/prologue',
        worldName: 'mct1-start',
        nextQuestName: 'mct1-jail',
    },
    'mct1-jail': {
        filePath: '../quests/mct1/jail',
        worldName: 'mct1-jail',
        nextQuestName: 'mct1-sunken',
    },
    'mct1-sunken': {
        filePath: '../quests/mct1/sunken',
        worldName: 'mct1-sunken-v2',
        nextQuestName: 'mct1-magmarun',
    },
    'mct1-magmarun': {
        filePath: '../quests/mct1/magmarun',
        worldName: 'mct1-magmarun',
        nextQuestName: 'mct1-magmaboss',
    },
    'mct1-magmaboss': {
        filePath: '../quests/mct1/magmaboss',
        worldName: 'mct1-magmaboss',
        nextQuestName: 'mct1-breakout',
    },
    'mct1-breakout': {
        filePath: '../quests/mct1/breakout',
        worldName: 'mct1-breakout',
        nextQuestName: 'mct1-village',
    },
    'mct1-village': {
        filePath: '../quests/mct1/village',
        worldName: 'mct1-start',
        nextQuestName: 'mct1-breakout2',
    },
    'mct1-breakout2': {
        filePath: '../quests/mct1/breakout2',
        worldName: 'mct1-breakout',
        nextQuestName: 'mct1-village',
    },
}

const availableQuests = Object.keys(quests)
    .sort()
    .reduce((prev, current) => `${prev}, ${current}`)

export async function questCommand({ questName, method, player, opts }) {
    if (questName === 'mct1') {
        questName = 'mct1-prologue'
    }

    if (questName === 'stop') {
        const userQuest = MCT1PlayerCache.getMct1Player(player).quest
        if (userQuest) {
            questName = userQuest.name
            method = 'stop'
            echo(player, `Stopping quest ${questName}...`)
        } else {
            return echo(player, `No quest is running.`)
        }
    }

    const quest = quests[questName]
    if (!questName || !quest) {
        echo(player, `Usage: /quest <quest-name> <command> <player>`)
        return echo(player, `Available quests: ${availableQuests}`)
    }

    const templateWorldName = quests[questName].worldName
    const playername = opts.mode === 'single' ? player.name : undefined
    const mct1Player = MCT1PlayerCache.getMct1Player(player)

    switch (method) {
        case 'start':
            // echo(player, `Starting quest ${questName}...`)
            log(`Starting quest ${questName} for ${player}`)
            const managedWorld = await WorldManager.createManagedWorld(
                templateWorldName,
                player.name
            )

            if (!managedWorld) {
                return
            }

            const QuestClass = require(quests[questName].filePath).default

            const questConfig: QuestConfig = {
                name: questName,
                nextQuestName: quests[questName].nextQuestName,
                options: opts,
                player,
                world: managedWorld,
            }

            const thisQuest: Quest = new QuestClass(questConfig)
            mct1Player.quest = thisQuest
            thisQuest.start()
            break
        case 'import':
            Multiverse.importWorld(templateWorldName)
            break
        case 'stop':
            mct1Player.mct1.stop()
            mct1Player.quest = undefined
            // Deleting the world kicks the player from the world
            // This triggers the playerChangedWorld event, which calls the stop() method
            // of the quest object, doing quest cleanup.
            WorldManager.deleteWorldsForPlayer(player.name)
            break
    }
}
