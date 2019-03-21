"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vector3_1 = require("@magikcraft/mct1/vector3");
var util = require('utils');
var vectorA = null;
var vectorB = null;
/**
 * Region
 * @constructor
 * @param {Vector3} vectorA - First Vector
 * @param {Vector3} vectorB - Second Vector
 * @param {string} [name] - Optional Name/ID
 *
 * Creates and instance of a region
 */
var Region = /** @class */ (function () {
    function Region(vectorA, vectorB, world, name) {
        if (world === void 0) { world = ""; }
        if (name === void 0) { name = ""; }
        this.vectorA = new vector3_1.Vector3(0, 0, 0, '');
        this.vectorB = new vector3_1.Vector3(0, 0, 0, '');
        this.world = '';
        this.name = '';
        this.vectorA = vectorA || vector3_1.Vector3.zero;
        this.vectorB = vectorB || vector3_1.Vector3.zero;
        this.world = world;
        this.name = name;
    }
    /**
     * ToArray
     * @return {Array} - Array Region Object
     *
     * Will create an array from the region object
     * >> array -> [ [0,0,0], [0,0,0] ];
     */
    Region.prototype.toArray = function () {
        return [this.vectorA.toArray(), this.vectorB.toArray()];
    };
    /**
     * FromArray
     * @param {Array} array - Given Array
     *
     * Will return a region object based on the array
     */
    Region.prototype.FromArray = function (array) {
        var region = new Region(new vector3_1.Vector3(array[0][0], array[0][1], array[0][2]), new vector3_1.Vector3(array[1][0], array[1][1], array[1][2]));
        if (array[0][4]) { // World in vectorA exists
            region.vectorA.world = array[0][4];
        }
        if (array[0][4]) { // World in vectorA exists
            region.vectorB.world = array[1][4];
        }
        return region;
    };
    /**
     * toString
     * @return {string} - String version of region
     *
     * Will return a string version of the region
     */
    Region.prototype.toString = function () {
        if (this.world == '' && this.name == '') { // Only vectors given
            return "[" + this.vectorA.toString() + "," + this.vectorB.toString() + "]";
        }
        else if (this.name == '' && this.world != '') { // No ID given
            return "[" + this.vectorA.toString() + "," + this.vectorB.toString() + ", " + this.world + "]";
        }
        else if (this.name != '' && this.world == '') { // All args where given
            return "[" + this.vectorA.toString() + "," + this.vectorB.toString() + ", (Name)" + this.world + "]";
        }
        else {
            return "[" + this.vectorA.toString() + "," + this.vectorB.toString() + ", " + this.world + ", " + this.name + "]";
        }
    };
    /**
     * xArray
     * @returns {Array} - X real space array
     *
     * Returns an array with all points that the array
     * exists in on the x axis
     * >> [ 201, 202, 203... ]
     */
    Region.prototype.xArray = function () {
        var smallestBounds = this.getSmallestPoint();
        var regionSize = this.getSize();
        var returnable = [];
        for (var i = 0; i < regionSize.x; i++) {
            returnable.push(smallestBounds.x + i);
        }
        return returnable;
    };
    /**
     * yArray
     * @returns {Array} - Y real space array
     *
     * Returns an array with all points that the array
     * exists in on the y axis
     * >> [ 201, 202, 203... ]
     */
    Region.prototype.yArray = function () {
        var smallestBounds = this.getSmallestPoint();
        var regionSize = this.getSize();
        var returnable = [];
        for (var i = 0; i < (regionSize.y || 1); i++) {
            returnable.push(smallestBounds.y + i);
        }
        return returnable;
    };
    /**
     * xArray
     * @returns {Array} - X real space array
     *
     * Returns an array with all points that the array
     * exists in on the x axis
     * >> [ 201, 202, 203... ]
     */
    Region.prototype.zArray = function () {
        var smallestBounds = this.getSmallestPoint();
        var regionSize = this.getSize();
        var returnable = [];
        for (var i = 0; i < (regionSize.z || 1); i++) {
            returnable.push(smallestBounds.z + i);
        }
        return returnable;
    };
    /**
     * xLength
     * @returns {number} - The length of the region in the x axis
     *
     * Will calculate the length of the the x axis of the region
    */
    Region.prototype.xLength = function () {
        return Math.abs(this.vectorA.x - this.vectorB.x);
    };
    /**
     * yLength
     * @returns {number} - The length of the region in the y axis
     *
     * Will calculate the length of the the y axis of the region
    */
    Region.prototype.yLength = function () {
        return Math.abs(this.vectorA.y - this.vectorB.y);
    };
    /**
     * zLength
     * @returns {number} - The length of the region in the z axis
     *
     * Will calculate the length of the the z axis of the region
    */
    Region.prototype.zLength = function () {
        return Math.abs(this.vectorA.z - this.vectorB.z);
    };
    /**
     * contains
     * @param {Vector3} sampleVector - Point to compare against the region
     * @returns {boolean} - True of False if the point is in the region
     *
     * Sample the region to see if the vector is in the region
     */
    Region.prototype.contains = function (sampleVector) {
        if (this.world == sampleVector.world) {
            if ((sampleVector.x || 0) < Math.min(this.vectorA.x, this.vectorB.x)) {
                return false;
            }
            else if ((sampleVector.x || 0) > Math.max(this.vectorA.x, this.vectorB.x)) {
                return false;
            }
            else if ((sampleVector.y || 0) < Math.min(this.vectorA.y, this.vectorB.y)) {
                return false;
            }
            else if ((sampleVector.y || 0) > Math.max(this.vectorA.y, this.vectorB.y)) {
                return false;
            }
            else if ((sampleVector.z || 0) < Math.min(this.vectorA.z, this.vectorB.z)) {
                return false;
            }
            else if ((sampleVector.z || 0) > Math.max(this.vectorA.z, this.vectorB.z)) {
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    };
    /**
     * getSmallestPoint
     * @return {Vector3} - Smallest Point
     *
     * This will get the smallest component point of the region
     * >> [[26,43,78], [12,42,25]] => [12,42,25]
     */
    Region.prototype.getSmallestPoint = function () {
        return new vector3_1.Vector3(Math.min(this.vectorA.x, this.vectorB.x), Math.min(this.vectorA.y, this.vectorB.y), Math.min(this.vectorA.z, this.vectorB.z), this.world);
    };
    /**
     * getLargestPoint
     * @return {Vector3} - Largest Point
     *
     * This will get the largest component point of the region
     * >> [[26,43,78], [12,42,25]] => [26,43,78]
     */
    Region.prototype.getLargestPoint = function () {
        return new vector3_1.Vector3(Math.max(this.vectorA.x, this.vectorB.x), Math.max(this.vectorA.y, this.vectorB.y), Math.max(this.vectorA.z, this.vectorB.z), this.world);
    };
    /**
     * getCenterPoint
     * @return {Vector3} - Center point of the region
     *
     * Returns the center point of the region as a vector3
     */
    Region.prototype.getCenterPoint = function () {
        var smallestPoint = this.getSmallestPoint();
        var size = this.getSize();
        return new vector3_1.Vector3(smallestPoint.x + (size.x / 2), smallestPoint.y + (size.y / 2), smallestPoint.z + (size.z / 2), this.world);
    };
    /**
     * getWorld
     * @param {boolean} [worldObj] - Optional bool to export world name
     */
    Region.prototype.getWorld = function (worldObj) {
        this._unifyWorldNames();
        worldObj = worldObj || false;
        if (worldObj) {
            return util.world(this.world);
        }
        else {
            return this.world;
        }
    };
    /**
     * getSize
     * @return {Vector3} - Size as vector
     *
     * Will return the size of the region as a vector
     */
    Region.prototype.getSize = function () {
        return new vector3_1.Vector3(Math.abs(this.vectorA.x - this.vectorB.x), Math.abs(this.vectorA.y - this.vectorB.y), Math.abs(this.vectorA.z - this.vectorB.z), this.world);
    };
    /**
     * randomPoint
     * @return {Vector3} - Point in region space
     *
     * Will get a random point inside the region
     */
    Region.prototype.randomPoint = function () {
        var regionSize = this.getSize(); // << Returns Vector3
        var smallestPoint = this.getSmallestPoint();
        var vec = new vector3_1.Vector3(Math.round(smallestPoint.x + Math.random() * (regionSize.x || 0)), Math.round(smallestPoint.y + Math.random() * (regionSize.y || 0)), Math.round(smallestPoint.z + Math.random() * (regionSize.z || 0)), this.world);
        return vec;
    };
    /**
     * randomPoints
     * @param {number} [amount] - Number of coords to return
     * @return {Array} - Points in region space (Vector3 Array)
     *
     * Will create an array of Vector3 points within the region
     */
    Region.prototype.randomPoints = function (amount) {
        amount = amount || 1;
        if (amount == 0) {
            return [this.randomPoint()];
        }
        else {
            var coords = [];
            for (var i = 0; i < amount; i++) {
                coords.push(this.randomPoint());
            }
            return coords;
        }
    };
    /**
     * closestPoint
     * @param {Vector3} location - Given location as vector3
     * @return {Vector3} - Closest point in region to location
     *
     * Will return the closest position to the location
     * within the region.
     *
     * Location: [24,18,36]
     * Region: [[62,632,2], [23,63,10]]
     * >> Closest Point: [24,63,10]
     */
    Region.prototype.closestPoint = function (location) {
        // Test to see if the location is in the region first
        // Less computation for the engine to do
        if (this.contains(location)) {
            // The location is in the region
            return location;
        }
        else {
            // Get all of the closet points in panes
            var locationArray = location.toArray();
            var greatestBounds = this.getLargestPoint().toArray; // << Vector3 Returns
            var smallestBounds = this.getSmallestPoint().toArray; // << Vector3 Returns
            var arrayPositions = [];
            for (var a = 0; a < 3; a++) { // Check through all axis's
                // If the location is greater than the greatest bounds
                if (location[a] > greatestBounds[a]) {
                    arrayPositions.push([greatestBounds[a]]);
                    // If the location is smaller than the smallest bounds
                }
                else if (location[a] < smallestBounds[a]) {
                    arrayPositions.push([smallestBounds[a]]);
                    // The location must be within the bounds.
                }
                else {
                    // Depending on the iteration, get the appropiate axis's array
                    switch (a) {
                        case 0:
                            arrayPositions.push(this.xArray());
                            break;
                        case 1:
                            arrayPositions.push(this.yArray());
                            break;
                        case 2:
                            arrayPositions.push(this.zArray());
                            break;
                        default:
                            break;
                    }
                }
            }
            // Test for the closest point
            var closestPoint = new vector3_1.Vector3(Infinity, Infinity, Infinity, this.world);
            var closestDist = Infinity;
            for (var x = 0; x < arrayPositions[0].length; x++) {
                for (var y = 0; y < arrayPositions[1].length; y++) {
                    for (var z = 0; z < arrayPositions[2].length; z++) {
                        // If the distance between the two points is the least
                        // so far, replace the closest point
                        var testPoint = new vector3_1.Vector3(arrayPositions[0][x], arrayPositions[1][y], arrayPositions[2][z], this.world);
                        var testDist = vector3_1.Vector3.Distance(testPoint, location);
                        if (testDist < closestDist) {
                            closestDist = testDist;
                            closestPoint = testPoint;
                        }
                    }
                }
            }
            return closestPoint;
        }
    };
    /**
     * distToClosestPoint
     * @param {Vector3} location - Given location as vector3
     * @return {number} - Distance to point
     *
     * Will return the distance to the closest point in the region
     * Refer to closestPoint
     */
    Region.prototype.distToClosestPoint = function (location) {
        return vector3_1.Vector3.Distance(this.closestPoint(location), location);
    };
    /**
     * AreOverlaping
     * @param {Region} regionA - First Region
     * @param {Region} regionB - Second Region
     * @return {boolean} - True if the regions overlap
     *
     * Will return true if the regions overlap
     */
    Region.prototype.AreOverlaping = function (regionA, regionB) {
        var centerB = regionB.getCenterPoint();
        var queryPoint = regionA.closestPoint(centerB);
        return regionB.isIn(queryPoint) ? true : false;
    };
    Region.prototype.Alter = function (region, amount, direction) {
        if (!direction) {
            // Change in all directions
            var smallestVector = region.getSmallestPoint();
            var largestVector = region.getLargestPoint();
            var alterVector = new vector3_1.Vector3(1 * amount, 1 * amount, 1 * amount);
            var vectorA = vector3_1.Vector3.Minus(smallestVector, alterVector);
            var vectorB = vector3_1.Vector3.Add(largestVector, alterVector);
            return new Region(vectorA, vectorB);
        }
        else if (!direction[0]) {
            // Not array, but direction given
            var smallestVector = region.getSmallestPoint();
            var largestVector = region.getLargestPoint();
            if (direction == vector3_1.Direction.UP) {
                smallestVector.y = Math.max(0, Math.min(largestVector.y + amount, 128));
            }
            else if (direction == vector3_1.Direction.EAST) {
                largestVector.x += amount;
                return new Region(smallestVector, largestVector);
            }
            else if (direction == vector3_1.Direction.NORTH) {
                largestVector.z += amount;
                return new Region(smallestVector, largestVector);
            }
            else if (direction == vector3_1.Direction.DOWN) {
                smallestVector.y = Math.max(0, Math.min(smallestVector.y - amount, 128));
                return new Region(smallestVector, largestVector);
            }
            else if (direction == vector3_1.Direction.SOUTH) {
                smallestVector.x -= amount;
                return new Region(smallestVector, largestVector);
            }
            else if (direction == vector3_1.Direction.WEST) {
                smallestVector.z -= amount;
                return new Region(smallestVector, largestVector);
            }
            else {
                return this.Alter(region, amount);
            }
        }
        else {
            // Has to be array
            // Do the operation[0],
            // If last, return, else remove [0] and try again
            var _region = this.Alter(region, amount, direction[direction.length - 1]);
            if (direction.length == 1) {
                return _region;
            }
            else {
                return this.Alter(_region, amount, direction.pop());
            }
        }
        return region;
    };
    Region.prototype.Expand = function (region, amount, direction) {
        amount = Math.abs(amount || 1);
        return this.Alter(region, amount, direction);
    };
    Region.prototype.Contract = function (region, amount, direction) {
        amount = -Math.abs(amount || 1);
        return this.Alter(region, amount, direction);
    };
    /**
     * _unifyWorldNames
     *
     * Fixes and unifies the names for regions
     * Criticaly important
     */
    Region.prototype._unifyWorldNames = function () {
        if (this.world == '') {
            var worldA = this.vectorA.world || '';
            var worldB = this.vectorA.world || '';
            if (worldA == '' && worldB == '') {
                // No world is given in the regions
                // Just give it a null world
                this.vectorA.world = '';
                this.vectorB.world = '';
                this.world = '';
            }
            else if (worldA == '') {
                // World B as the given world
                // Assign the region and vectorA worlds to vectorB's world
                this.vectorA.world = worldB;
                this.world = worldB;
                return worldB;
            }
            else if (worldB == '') {
                // World A as the given world
                // Assign the region and vectorB worlds to vectorA's world
                this.vectorB.world = worldA;
                this.world = worldA;
                return worldA;
            }
            else if (worldB == worldA) {
                // Both worlds have the same name
                // Assign the region world to the two vectors one's
                this.world = worldA;
            }
        }
        else {
            this.vectorA.world = this.world;
            this.vectorB.world = this.world;
        }
    };
    return Region;
}());
exports.Region = Region;
