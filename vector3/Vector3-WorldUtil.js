"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector3_1 = require("./Vector3");
var blocks = require("blocks");
var Vector3World = /** @class */ (function () {
    function Vector3World() {
    }
    // Will get the first safe spawnable block
    Vector3World.GetSafePos = function (vector) {
        var world = vector.toLocation().world;
        var priorPos = vector;
        var currentPos = vector;
        var hasFoundBlock = false;
        var priorBlock = null;
        while (!hasFoundBlock) {
            var block = world.getBlockAt(currentPos.x, currentPos.y, currentPos.z);
            if (blocks.air != block) {
                // If its registered anything else (ground) move it up
                if (blocks.air == priorBlock && priorBlock != null) {
                    //
                    return priorPos;
                }
                priorPos = currentPos;
                priorBlock = block;
                currentPos = new Vector3_1.Vector3(currentPos.x, currentPos.y + 1, currentPos.z);
            }
            else {
                // If its registered air, move it down
                if (blocks.air != priorBlock && priorBlock != null) {
                    return priorPos;
                }
                priorPos = currentPos;
                priorBlock = block;
                currentPos = new Vector3_1.Vector3(currentPos.x, currentPos.y - 1, currentPos.z);
            }
            priorBlock = block;
        }
        return vector; // If it all fails, return Vector3
    };
    // Will get the first block in the Y axis that is touched by sun
    Vector3World.GetSunPos = function (vector) {
        var world = vector.toLocation().world;
        var priorPos = vector.setWorldHeight();
        var currentPos = vector.setWorldHeight();
        var finalPos = vector.setWorldHeight();
        var hasFoundBlock = false;
        while (!hasFoundBlock) {
            var block = world.getBlockAt(currentPos.x, currentPos.y, currentPos.z);
            // log("Checking for block, at: " + new Vector3(currentPos.x,currentPos.y,currentPos.z).toString() + ", block is: " + block.getType​());
            if (block.getType() != 'AIR') {
                // log("Block has been found: " + block.getType​());
                hasFoundBlock = true;
                finalPos = new Vector3_1.Vector3(priorPos.x, priorPos.y + 1, priorPos.z, vector.world);
                // log("Final Position: " + finalPos.toString());
                return finalPos;
            }
            else {
                // log("No Block Found: " + block.getType​());
                priorPos = currentPos;
                currentPos = new Vector3_1.Vector3(currentPos.x, currentPos.y - 1, currentPos.z);
            }
        }
        return finalPos;
    };
    // Will generate an array of Vector3's that span between two points
    Vector3World.Line = function (vectorA, vectorB) {
        var dx = vectorB.x - vectorA.x;
        var dy = vectorB.y - vectorA.y;
        var dz = vectorB.z - vectorA.z;
        var iterations = Math.max(dx, dy, dz);
        for (var i = 0; i < iterations; i++) { }
        // dx = x2 - x1
        // dy = y2 - y1
        // for x from x1 to x2 {
        //     y = y1 + dy * (x - x1) / dx
        //     plot(x, y)
        // }
        return [new Vector3_1.Vector3(0, 0, 0)];
    };
    // Will generate an array of Vector3's that will be in a radis out a point
    Vector3World.FlatCircle = function (vector, radius) {
        return [new Vector3_1.Vector3(0, 0, 0)];
    };
    return Vector3World;
}());
exports.Vector3World = Vector3World;
