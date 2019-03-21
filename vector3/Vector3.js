"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require('utils');
/**
 * Vector3
 * @constructor
 * @param {number} x - The x component axis
 * @param {number} y - The y component axis
 * @param {number} z - The z component axis
 * @param {string} [world] - World setter
 */
var Vector3 = /** @class */ (function () {
    function Vector3(x, y, z, world) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        if (world === void 0) { world = ""; }
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.world = '';
        this.x = x;
        this.y = y;
        this.z = z;
        this.world = world;
    }
    // Inits
    // ----------------------------------------------------------------------------
    /**
     * FromJSON
     * @param {object} JSONlocation - A JSON object containing the scriptcraft/util made JSON Location
     * @returns {Vector3} - The resultant vector
     *
     * Will create a Vector3 object based on the JSON Location
     */
    Vector3.FromJSON = function (JSONlocation) {
        return new Vector3(JSONlocation.x, JSONlocation.y, JSONlocation.z, JSONlocation.world);
    };
    /**
     * toJSON
     * @return {object} - JSON Location
     *
     * Will return a JSON object based of the objects values
     * If no world as been assigned previously, it will default to 'world'
     */
    Vector3.prototype.toJSON = function () {
        var loc = {
            world: this.world || '',
            x: this.x,
            y: this.y,
            z: this.z,
            yaw: 0.0,
            pitch: 0.0
        };
        return loc;
    };
    /**
     * FromLocation
     * @param {object} location - Minecraft/Scriptcrat location object
     * @return {Vector3} - Generated Vector3 from location
     *
     * Will create a Vector3 object based on a location object
     */
    Vector3.FromLocation = function (location) {
        var JSONloc = util.locationToJSON(location);
        return new Vector3(JSONloc.x, JSONloc.y, JSONloc.z, JSONloc.world);
    };
    /**
     * toLocation
     * @return {object} - location
     *
     * Will create a location object based from the vector
     */
    Vector3.prototype.toLocation = function () {
        var loc = {
            world: this.world,
            x: this.x,
            y: this.y,
            z: this.z,
            yaw: 0.0,
            pitch: 0.0
        };
        return util.locationFromJSON(loc);
    };
    /**
     * FromArray
     * @param {Array} array - Vector Array
     *
     * Will take a vector array and return a Vector3
     */
    Vector3.FromArray = function (array) {
        if (array[3]) {
            return new Vector3(array[0], array[1], array[2]);
        }
        else {
            return new Vector3(array[0], array[1], array[2]);
        }
    };
    /**
     * toArray
     * @return {Array} - Vector Array
     *
     * Will return an array from a Vector3 object
     */
    Vector3.prototype.toArray = function () {
        if (this.world == '') {
            return [this.x, this.y, this.z];
        }
        else {
            return [this.x, this.y, this.z, this.world];
        }
    };
    /**
     * back
     * @return {Vector3} - Vector3(0,0,-1)
     *
     * Will return a new Vector3(0,0,-1)
     */
    Vector3.back = function () {
        return new Vector3(0, 0, -1);
    };
    /**
     * forward
     * @return {Vector3} - Vector3(0,0,1)
     *
     * Will return a new Vector3(0,0,1)
     */
    Vector3.forward = function () {
        return new Vector3(0, 0, 1);
    };
    /**
     * right
     * @return {Vector3} - Vector3(1,0,0)
     *
     * Will return a new Vector3(1,0,0)
     */
    Vector3.right = function () {
        return new Vector3(1, 0, 0);
    };
    /**
     * left
     * @return {Vector3} - Vector3(-1,0,0)
     *
     * Will return a new Vector3(-1,0,0)
     */
    Vector3.left = function () {
        return new Vector3(-1, 0, 0);
    };
    /**
     * up
     * @return {Vector3} - Vector3(0,1,0)
     *
     * Will return a new Vector3(0,1,0)
     */
    Vector3.up = function () {
        return new Vector3(0, 1, 0);
    };
    /**
     * down
     * @return {Vector3} - Vector3(0,-1,0)
     *
     * Will return a new Vector3(0,-1,0)
     */
    Vector3.down = function () {
        return new Vector3(0, -1, 0);
    };
    /**
     * unit
     * @return {Vector3} - Vector3(1,1,1)
     * @alias one
     *
     * Will return a new Vector3(1,1,1)
     */
    Vector3.unit = function () {
        return new Vector3(1, 1, 1);
    };
    // Properties
    // ----------------------------------------------------------------------------
    // If this is made as a class, these will return based on its own values
    /**
     * magnitude
     * @return {number} - Magnitude of the vector
     *
     * Will calculate the magnitude of the vector using Pythagorean Theorem
     */
    Vector3.prototype.magnitude = function () {
        return Math.sqrt(Math.pow(this.x, 2) +
            Math.pow(this.y, 2) +
            Math.pow(this.z, 2));
    };
    /**
     * normalized
     * @return {Vector3} - Normalized Vector
     *
     * Will scale the vector so that its magnitude is 1.
     * Clamps the vector into a unit circle
     */
    Vector3.prototype.normalized = function () {
        var ratio = 1 / this.magnitude();
        return new Vector3(this.x * ratio, this.y * ratio, this.z * ratio);
    };
    /**
     * getWorld
     * @param {boolean} worldObj
     *
     * Will return various instances of the world
     * If given: worldObj = true,       then returns a bukkit world object
     *           worldObj = false/null, then returns a string
     */
    Vector3.prototype.getWorld = function (worldObj) {
        worldObj = worldObj || false;
        if (worldObj) {
            return util.world(this.world);
        }
        else {
            return this.world;
        }
    };
    /**
     * set
     * @param {number} x - X axis value
     * @param {number} y - X axis value
     * @param {number} z - X axis value
     * @param {string} [world] - world axis value
     *
     * Allows you to reassign the vector from its core components
     */
    Vector3.prototype.set = function (x, y, z, world) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.world = world || '';
    };
    /**
     * toString
     * @return {string} - Stringified vector object
     *
     * A custom function that outputs a string
     * Will ommit world if this.world is not set
     */
    Vector3.prototype.toString = function () {
        if (this.world == '') {
            return "[" + this.x + ", " + this.y + ", " + this.z + "]";
        }
        else {
            return "[" + this.x + ", " + this.y + ", " + this.z + ", " + this.world + "]";
        }
    };
    /**
     * exportWorld
     * @return {string|any}- Returns the world
     */
    Vector3.prototype.exportWorld = function () {
        if (typeof this.world != 'string') {
            return this.world;
        }
        else {
            return util.world(this.world);
        }
    };
    /**
     * setWorldHeight
     * @return {Vector3}
     *
     * Will set the vector.y to world top (128)
     */
    Vector3.prototype.setWorldHeight = function () {
        return new Vector3(this.x || 0, 128, this.z || 0, this.world);
    };
    /**
     * setWorldBottom
     * @return {Vector3}
     *
     * Will set the vector.y to world bottom (0)
     */
    Vector3.prototype.setWorldBottom = function () {
        return new Vector3(this.x || 0, 0, this.z || 0, this.world);
    };
    // Operands
    // ----------------------------------------------------------------------------
    // /**
    //  * subtract
    //  * @alias Minus
    //  * @param {Vector3} vector - Vector to subtract with
    //  * @return {Vector3} - Subtracted vector
    //  *
    //  * Minus one vector from another
    //  */
    // subtract(vector :Vector3): Vector3 {
    //     return this.minus(this, vector);
    // }
    /**
     * subtract
     * @alias minus
     * @static
     * @param {Vector3} vectorA - Vector to be subtracted
     * @param {Vector3} vectorB - Vector to subtract with
     * @return {Vector3} - Subtracted vector
     *
     * Minus one vector from another
     */
    Vector3.Subtract = function (vectorA, vectorB) {
        return Vector3.Minus(vectorA, vectorB);
    };
    // /**
    //  * times
    //  * @param {number} number - Amount to multiply by
    //  *
    //  * Times a vector by a number
    //  */
    // times(number: number): Vector3 {
    //     return this.multiply(number);
    // }
    /**
     * Times
     * @static
     * @param {Vector3} vectorA - Vector to be multiplied
     * @param {number} number - Amount to multiply by
     *
     * Times a vector by a number
     */
    Vector3.Times = function (vectorA, number) {
        return Vector3.Multiply(vectorA, number);
    };
    // /**
    //  * multiply
    //  * @param {number} number - Amount to multiply by
    //  * @return {Vector3} - Resultant Vector
    //  *
    //  * Times a vector by a number
    //  */
    // multiply(number :number): Vector3 {
    //     return new Vector3(
    //         this.x * number,
    //         this.y * number,
    //         this.x * number,
    //         this.world
    //     );
    // }
    /**
     * multiply
     * @static
     * @param {Vector3} vectorA - Vector to be multiplied
     * @param {number} number - Amount to multiply by
     * @return {Vector3} - Resultant Vector
     *
     * Times a vector by a number
     */
    Vector3.Multiply = function (vector, number) {
        return new Vector3(vector.x * number, vector.y * number, vector.x * number, vector.world);
    };
    // /**
    //  * divide
    //  * @param {number} number - Amount to multiply by
    //  *
    //  * Divides a vector by a number
    //  */
    // divide(number: number): Vector3 {
    //     return new Vector3(
    //         this.x / number,
    //         this.y / number,
    //         this.z / number,
    //         this.world
    //     );
    // }
    /**
     * Divide
     * @static
     * @param {Vector3} vectorA - Vector to be multiplied
     * @param {number} number - Amount to multiply by
     * @return {Vector3} - Resultant Vector
     *
     * Divides a vector by a number
     */
    Vector3.Divide = function (vectorA, number) {
        return new Vector3(vectorA.x / number, vectorA.y / number, vectorA.z / number, vectorA.world);
    };
    // /**
    //  * add
    //  * @param {Vector3} vector - Given Vector
    //  *
    //  * Adds a vector to another vector
    //  */
    // add(vector: Vector3): Vector3 {
    //     return new Vector3(
    //         this.x + vector.x,
    //         this.y + vector.y,
    //         this.z + vector.z,
    //         this.world
    //     );
    // }
    /**
     * Add
     * @static
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @return {Vector3} - Resultant Vector
     *
     * Adds a vector to another vector
     */
    Vector3.Add = function (vectorA, vectorB) {
        return new Vector3(vectorA.x + vectorB.x, vectorA.y + vectorB.y, vectorA.z + vectorB.z, vectorA.world);
    };
    /**
     * EqualsComponent
     * @static
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @return {boolean} - Resultant
     *
     * Checks if vectorA is the same as vectorB, not including world
     */
    Vector3.EqualsComponent = function (vectorA, vectorB) {
        if (vectorA.x == vectorB.x &&
            vectorA.y == vectorB.y &&
            vectorA.z == vectorB.z) {
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * Equals
     * @static
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @return {boolean} - Resultant
     *
     * Checks if vectorA is the same as vectorB, including world
     */
    Vector3.Equals = function (vectorA, vectorB) {
        if (vectorA.x == vectorB.x &&
            vectorA.y == vectorB.y &&
            vectorA.z == vectorB.z &&
            vectorA.world == vectorB.world) {
            return true;
        }
        else {
            return false;
        }
    };
    // Static Methods
    // ----------------------------------------------------------------------------
    // These dont require a new 'class' to be made
    /**
     * Angle
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @return {number} - Angle between the vectors
     *
     * Returns the angle between the two vectors
     */
    Vector3.Angle = function (vectorA, vectorB) {
        return (Vector3.Dot(vectorA, vectorB) /
            (vectorA.magnitude() * vectorB.magnitude()));
    };
    /**
     * ClampMagnitude
     * @param {Vector3} vector - Arbitary Vector
     * @param {number} maxLength - Max length (number)
     * @return {number} - Angle between the vectors
     *
     * Returns a copy of vector with its magnitude clamped to maxLength
     */
    Vector3.ClampMagnitude = function (vector, maxLength) {
        return Math.min(vector.magnitude(), maxLength);
    };
    /**
     * Cross
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @return {Vector3} - Vector cross product
     *
     * Cross Product of two vectors
     */
    Vector3.Cross = function (vectorA, vectorB) {
        return new Vector3(vectorA.y * vectorB.z - vectorA.z * vectorB.y, vectorA.z * vectorB.x - vectorA.x * vectorB.z, vectorA.z * vectorB.y - vectorA.y * vectorB.x, this.GetWorlds(vectorA, vectorB));
    };
    /**
     * Minus
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @return {Vector3} - Minused vector
     *
     * Minus one vector from another component wise (vectorA - vectorB)
     */
    Vector3.Minus = function (vectorA, vectorB) {
        return new Vector3(vectorA.x - vectorB.x, vectorA.y - vectorB.y, vectorA.z - vectorB.z, this.GetWorlds(vectorA, vectorB));
    };
    /**
     * Distance
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @return {number} - Distance between the vectors
     *
     * Returns the distance between vectorA and vectorB
     */
    Vector3.Distance = function (vectorA, vectorB) {
        var vector = new Vector3(Math.abs(vectorA.x - vectorB.x), Math.abs(vectorA.y - vectorB.y), Math.abs(vectorA.z - vectorB.z)
        // World dose not matter, converted to single
        // number in the next step
        );
        return vector.magnitude();
    };
    /**
     * Dot
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @return {number} - Dot product
     *
     * Dot Product of two vectors
     */
    Vector3.Dot = function (vectorA, vectorB) {
        return (vectorA.x * vectorB.x) +
            (vectorA.y * vectorB.y) +
            (vectorA.z * vectorB.z);
    };
    /**
     * Lerp
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @param {number} percent - 0-1 Value for sampling
     * @return {Vector3} - Vector postion between the two at the sampled percentage
     *
     * Linearly interpolates between two vectors
     */
    Vector3.Lerp = function (vectorA, vectorB, percent) {
        percent = Math.max(0, Math.min(1, percent || 0.5));
        return this.LerpUnclamped(vectorA, vectorB, percent);
    };
    /**
     * LerpUnclamped
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @param {number} percent - 0-1 Value for sampling
     * @return {Vector3} - Vector postion between the two at the sampled percentage
     *
     * Linearly interpolates between two vectors, without 0-1 percent sample clamp
     */
    Vector3.LerpUnclamped = function (vectorA, vectorB, percent) {
        // Gets point inbetween the two vectors based on a float
        var vectorBetween = Vector3.Subtract(vectorA, vectorB);
        return vectorA.add(Vector3.Times(vectorBetween, percent || 0.5));
    };
    /**
     * Max
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @return {Vector3} - The larger of the two vectors
     *
     * Returns a vector that is made from the largest components of two vectors
     */
    Vector3.Max = function (vectorA, vectorB) {
        if (vectorA.magnitude() > vectorB.magnitude()) {
            return vectorA;
        }
        else {
            return vectorB;
        }
    };
    /**
     * Min
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @return {Vector3} - The smaller of the two vectors
     *
     * Returns a vector that is made from the smallest components of two vectors
     */
    Vector3.Min = function (vectorA, vectorB) {
        if (vectorA.magnitude() < vectorB.magnitude()) {
            return vectorA;
        }
        else {
            return vectorB;
        }
    };
    // MoveTowards TODO
    /**
     * Normalize
     * @param {Vector3} vector - Vector to Normalize
     *
     * Returns a vector that is made from the smallest components of two vectors
     */
    Vector3.Normalize = function (vector) {
        return vector.normalized();
    };
    // OrthoNormalize TODO
    // Project TODO
    // ProjectOnPlane TODO
    // Reflect TODO
    // RotateTowards TODO
    /**
     * Scale
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     *
     * Multiplies two vectors component-wise.
     */
    Vector3.Scale = function (vectorA, vectorB) {
        return new Vector3(vectorA.x * vectorB.x, vectorA.y * vectorB.y, vectorA.z * vectorB.z, Vector3.GetWorlds(vectorA, vectorB));
    };
    // SignedAngle TODO
    // Slerp TODO
    // SlerpUnclamped TODO
    // SmoothDamp TODO
    // --------------------------------------
    Vector3.Average = function (vectors) {
        if (vectors.length == 0) {
            return vectors[0];
        }
        else {
            var vector = new Vector3(0, 0, 0, this.GetWorldsArray(vectors));
            for (var i = 0; i < vectors.length; i++) {
                vector = Vector3.Add(vector, vectors[i]);
            }
            return Vector3.Divide(vector, vectors.length);
        }
    };
    Vector3.GetWorlds = function (vectorA, vectorB) {
        var worldA = vectorA.world || '';
        var worldB = vectorA.world || '';
        if (worldA == '' && worldB == '') {
            // No world is given
            return '';
        }
        else if (worldA == '') {
            // World B as the given world
            return worldB;
        }
        else if (worldB == '') {
            // World A as the given world
            return worldA;
        }
        else if (worldB == worldA) {
            // Both worlds have the same name
            return worldA;
        }
    };
    Vector3.GetWorldsArray = function (vectors) {
        // var worlds: Array<string> = [];
        // vectors.forEach(function(v) { worlds.push(v.world) });
        // var uWorlds = worlds.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
        // var fWorlds = uWorlds.filter(function(x){ return (x !== (undefined || null || '')); });
        // return fWorlds.length == 0 ? '' : fWorlds.length == 1 ? fWorlds[0] : fWorlds[Math.round(Math.random() * fWorlds.length)]
        // Old code
        var uniqueWorlds = [];
        for (var i = 0; i < vectors.length; i++) {
            if (uniqueWorlds.length == 0) { // If no worlds exist yet
                uniqueWorlds.push(vectors[i].world || ''); // Add it
            }
            else { // If worlds exist
                for (var j = 0; j < uniqueWorlds.length; i++) { // For every unique word
                    if (uniqueWorlds[i] != (vectors[i].world || '')) { // If the dose not exist yet in the array
                        uniqueWorlds.push(vectors[i].world || '');
                    }
                }
            }
            // vectors[i].world || '';
        }
        // Due to the way the logic works, remove blank strings ('')
        var finalWorlds = [];
        for (var k = 0; k < uniqueWorlds.length; k++) {
            if (uniqueWorlds[k] !== (undefined || null || '')) {
                finalWorlds.push(uniqueWorlds[k]);
            }
        }
        if (uniqueWorlds.length == 0) { // No worlds were in the array
            return '';
        }
        else if (uniqueWorlds.length == 1) { // Only one world was found
            return uniqueWorlds[0];
        }
        else {
            return uniqueWorlds[Math.round(Math.random() * uniqueWorlds.length)];
        }
    };
    Vector3.GetRandomPointAround = function (point, radius) {
        var randAngleHoz = Math.round(Math.random() * 360);
        var randAngleVert = Math.round(Math.random() * 360);
        var randDist = Math.random() * radius;
        var x = Math.cos(randAngleHoz) * randDist;
        var y = Math.cos(randAngleVert) * randDist;
        var z = Math.sin(randAngleHoz) * randDist;
        var finalPoint = Vector3.Add(point, new Vector3(x, y, z));
        return finalPoint;
    };
    /**
     * one
     * @return {Vector3} - Vector3(1,1,1)
     * @alias unit
     *
     * Will return a new Vector3(1,1,1)
     */
    Vector3.one = Vector3.unit();
    /**
     * zero
     * @return {Vector3} - Vector3(0,0,0)
     *
     * Will return a new Vector3(0,0,0)
     * Same as calling the constructor without parameters
     */
    Vector3.zero = function () {
        return new Vector3(0, 0, 0);
    };
    /**
     * negativeInfinity
     * @return {Vector3} - Vector3(-Infinity,-Infinity,-Infinity)
     *
     * Will return a new Vector3(-Infinity,-Infinity,-Infinity)
     */
    Vector3.negativeInfinity = function () {
        return new Vector3(-Infinity, -Infinity, -Infinity);
    };
    /**
     * infinity
     * @return {Vector3} - Vector3(Infinity,Infinity,Infinity)
     *
     * Will return a new Vector3(Infinity,Infinity,Infinity)
     */
    Vector3.infinity = function () {
        return new Vector3(Infinity, Infinity, Infinity);
    };
    Vector3.NotEqualsComponent = function (vectorA, vectorB) { return !Vector3.EqualsComponent(vectorA, vectorB); };
    Vector3.NotEquals = function (vectorA, vectorB) { return !Vector3.Equals(vectorA, vectorB); };
    return Vector3;
}());
exports.Vector3 = Vector3;
