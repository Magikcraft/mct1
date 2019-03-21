"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("@magikcraft/mct1/utils/fs");
var log_1 = require("@magikcraft/mct1/log");
var server = require("@magikcraft/mct1/utils/server");
var utils = require('utils'); // tslint:disable-line
var log = log_1.Logger(__filename);
var quests = {
    'mct1': {
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
};
var availableQuests = Object.keys(quests).sort().reduce(function (prev, current) { return prev + ", " + current; });
function questCommand(questName, method, player, opts) {
    var quest = quests[questName];
    if (!questName || !quest) {
        echo(player, "Usage: /quest <quest-name> <command> <player>");
        return echo(player, "Available quests: " + availableQuests);
    }
    var templateWorldName = quests[questName].worldName;
    var worldName = opts.mode === 'single'
        ? templateWorldName + "--" + player.name
        : templateWorldName + "-multi";
    doCommand(worldName, templateWorldName, questName, player, method, opts);
}
exports.questCommand = questCommand;
function mv() {
    return __plugin.server
        .getPluginManager()
        .getPlugin('Multiverse-Core');
}
function importWorld(templateWorldName) {
    server.executeCommand("mv import " + templateWorldName + " normal");
}
function deleteWorld(worldName) {
    return new Promise(function (resolve) {
        log("Deleting ./" + worldName);
        var w = utils.world(worldName);
        var worldFilePath = w ? w.getWorldFolder().getPath() : "worlds/" + worldName;
        mv().deleteWorld(worldName);
        if (fs.exists(worldFilePath)) {
            log("Removing file " + worldFilePath + "...");
            fs.remove(worldFilePath);
        }
        resolve(worldName);
    });
}
function cloneWorld(worldName, templateWorldName) {
    return new Promise(function (resolve, reject) {
        log("Cloning " + worldName);
        server.executeCommand("mv import " + templateWorldName + " normal");
        deleteWorld(worldName)
            .finally(function () {
            var success = mv().cloneWorld(templateWorldName, worldName, 'normal');
            if (!success) {
                return reject("Failed to clone world " + templateWorldName);
            }
            var world = utils.world(worldName);
            log("World clone complete for " + worldName);
            return resolve(world);
        })
            .catch(log);
    });
}
function createQuest(_a) {
    var questName = _a.questName, player = _a.player, world = _a.world, opts = _a.opts;
    var QuestClass = require(quests[questName].filePath).default;
    var questConfig = {
        name: questName,
        nextQuestName: quests[questName].nextQuestName,
        player: player,
        world: world,
        options: opts
    };
    var quest = new QuestClass(questConfig);
    return quest;
}
function doCommand(worldName, templateWorldName, questName, player, method, opts) {
    switch (method) {
        case 'start':
            echo(player, "Starting quest " + questName + "...");
            deleteWorld(worldName)
                .then(function () {
                cloneWorld(worldName, templateWorldName)
                    .then(function (world) {
                    var quest = createQuest({ opts: opts, player: player, questName: questName, world: world });
                    quest.start();
                })
                    .catch(log);
            })
                .catch(log);
            break;
        case 'import':
            importWorld(templateWorldName);
            break;
        case 'stop':
            // Deleting the world kicks the player from the world
            // This triggers the playerChangedWorld event, which calls the stop() method
            // of the quest object, doing quest cleanup.
            deleteWorld(worldName)
                .then(function () { return log("Deleted " + worldName); })
                .catch(log);
            break;
    }
}
