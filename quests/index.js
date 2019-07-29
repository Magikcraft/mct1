"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("../log");
var user_1 = require("../user");
var world_1 = require("../world");
var multiverse_1 = require("../world/multiverse");
var log = log_1.Logger(__filename);
var quests = {
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
};
var availableQuests = Object.keys(quests)
    .sort()
    .reduce(function (prev, current) { return prev + ", " + current; });
function questCommand(_a) {
    var questName = _a.questName, method = _a.method, player = _a.player, opts = _a.opts;
    return __awaiter(this, void 0, void 0, function () {
        var userQuest, quest, templateWorldName, playername, mct1Player, _b, managedWorld, QuestClass, questConfig, thisQuest;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (questName === 'mct1') {
                        questName = 'mct1-prologue';
                    }
                    if (questName === 'stop') {
                        userQuest = user_1.MCT1PlayerCache.getMct1Player(player).quest;
                        if (userQuest) {
                            questName = userQuest.name;
                            method = 'stop';
                            echo(player, "Stopping quest " + questName + "...");
                        }
                        else {
                            return [2 /*return*/, echo(player, "No quest is running.")];
                        }
                    }
                    quest = quests[questName];
                    if (!questName || !quest) {
                        echo(player, "Usage: /quest <quest-name> <command> <player>");
                        return [2 /*return*/, echo(player, "Available quests: " + availableQuests)];
                    }
                    templateWorldName = quests[questName].worldName;
                    playername = opts.mode === 'single' ? player.name : undefined;
                    mct1Player = user_1.MCT1PlayerCache.getMct1Player(player);
                    _b = method;
                    switch (_b) {
                        case 'start': return [3 /*break*/, 1];
                        case 'import': return [3 /*break*/, 3];
                        case 'stop': return [3 /*break*/, 4];
                    }
                    return [3 /*break*/, 5];
                case 1:
                    // echo(player, `Starting quest ${questName}...`)
                    log("Starting quest " + questName + " for " + player);
                    return [4 /*yield*/, world_1.WorldManager.createManagedWorld(templateWorldName, player.name)];
                case 2:
                    managedWorld = _c.sent();
                    if (!managedWorld) {
                        return [2 /*return*/];
                    }
                    QuestClass = require(quests[questName].filePath).default;
                    questConfig = {
                        name: questName,
                        nextQuestName: quests[questName].nextQuestName,
                        options: opts,
                        player: player,
                        world: managedWorld,
                    };
                    thisQuest = new QuestClass(questConfig);
                    mct1Player.quest = thisQuest;
                    thisQuest.start();
                    return [3 /*break*/, 5];
                case 3:
                    multiverse_1.Multiverse.importWorld(templateWorldName);
                    return [3 /*break*/, 5];
                case 4:
                    mct1Player.mct1.stop();
                    mct1Player.quest = undefined;
                    // Deleting the world kicks the player from the world
                    // This triggers the playerChangedWorld event, which calls the stop() method
                    // of the quest object, doing quest cleanup.
                    world_1.WorldManager.deleteWorldsForPlayer(player.name);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.questCommand = questCommand;
