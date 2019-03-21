"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("@magikcraft/mct1/utils/fs");
var log_1 = require("@magikcraft/mct1/log");
var server = require("@magikcraft/mct1/utils/server");
var utils_1 = require("utils");
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
function deleteWorld(worldName, cb) {
    log("Deleting ./" + worldName);
    try {
        var w = utils_1.world(worldName);
        var worldFilePath = w ? w.getWorldFolder().getPath() : undefined;
        mv().deleteWorld(worldName);
        if (worldFilePath && fs.exists(worldFilePath)) {
            log("Removing " + worldFilePath + "...");
            fs.remove(worldFilePath);
        }
        cb && cb();
    }
    catch (e) {
        log(e);
        cb && cb(e);
    }
}
function cloneWorld(worldName, templateWorldName, cb) {
    try {
        log("Cloning " + worldName);
        server.executeCommand("mv import " + templateWorldName + " normal");
        var success = mv().cloneWorld(templateWorldName, worldName, 'normal');
        if (!success) {
            log("Failed to clone world " + templateWorldName);
            return cb && cb("Failed to clone world");
        }
        var world_1 = utils.world(worldName);
        log("World clone complete for " + worldName);
        return cb && cb(null, world_1);
    }
    catch (e) {
        log(e);
        return cb && cb(e, null);
    }
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
            deleteWorld(worldName, function (err) {
                if (err) {
                    return;
                }
                cloneWorld(worldName, templateWorldName, function (err, world) {
                    if (err) {
                        return;
                    }
                    var quest = createQuest({ opts: opts, player: player, questName: questName, world: world });
                    quest.start();
                });
            });
            break;
        case 'import':
            importWorld(templateWorldName);
            break;
        case 'stop':
            // Deleting the world kicks the player from the world
            // This triggers the playerChangedWorld event, which calls the stop() method
            // of the quest object, doing quest cleanup.
            deleteWorld(worldName, function () { return log("Deleted " + worldName); });
            break;
    }
}
