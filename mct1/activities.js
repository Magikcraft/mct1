"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var activityTypes;
(function (activityTypes) {
    // Move activities
    activityTypes["WALK"] = "WALK";
    activityTypes["SWIM"] = "SWIM";
    activityTypes["SPRINT"] = "SPRINT";
    activityTypes["JUMP"] = "JUMP";
    activityTypes["SPRINT_JUMP"] = "SPRINT_JUMP";
    activityTypes["CLIMB_LADDER"] = "CLIMB_LADDER";
    activityTypes["CLIMB_VINE"] = "CLIMB_VINE";
    // Non-move activities
    activityTypes["BLOCK_BREAK"] = "BLOCK_BREAK";
    activityTypes["ATTACK_LIVING_ENTITY"] = "ATTACK_LIVING_ENTITY";
    activityTypes["SHOOT_BOW"] = "SHOOT_BOW";
    activityTypes["LIGHTNING_STRIKE"] = "LIGHTNING_STRIKE";
})(activityTypes = exports.activityTypes || (exports.activityTypes = {}));
var activityCosts;
(function (activityCosts) {
    // Move activities
    activityCosts[activityCosts["WALK"] = 0.01] = "WALK";
    activityCosts[activityCosts["SWIM"] = 0.02] = "SWIM";
    activityCosts[activityCosts["SPRINT"] = 0.1] = "SPRINT";
    activityCosts[activityCosts["JUMP"] = 0.05] = "JUMP";
    activityCosts[activityCosts["SPRINT_JUMP"] = 0.1] = "SPRINT_JUMP";
    activityCosts[activityCosts["CLIMB_LADDER"] = 0.02] = "CLIMB_LADDER";
    activityCosts[activityCosts["CLIMB_VINE"] = 0.02] = "CLIMB_VINE";
    // Non-move activities
    activityCosts[activityCosts["BLOCK_BREAK"] = 0.005] = "BLOCK_BREAK";
    activityCosts[activityCosts["ATTACK_LIVING_ENTITY"] = 0.1] = "ATTACK_LIVING_ENTITY";
    activityCosts[activityCosts["SHOOT_BOW"] = 0.1] = "SHOOT_BOW";
    activityCosts[activityCosts["LIGHTNING_STRIKE"] = 0.1] = "LIGHTNING_STRIKE";
})(activityCosts = exports.activityCosts || (exports.activityCosts = {}));
