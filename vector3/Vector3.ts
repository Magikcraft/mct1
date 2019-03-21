var util = require('utils');

export interface JSONloc {
    x: number,
    y: number,
    z: number,
    pitch: number,
    yaw: number,
    world: string
}

export interface iVector3 {

    // Vars -------------------------------------------------------------------
    x :number,      // Def of x variable
    y :number,      // Def of y variable
    z :number,      // Def of z variable
    world :string,  // Def of world variable

    // Type Conversions / Constructors ----------------------------------------
    FromJSON(JSONlocation: JSONloc),    // Scriptcraft Location JSON -> Vector3
    toJSON(): JSONloc,                  // Vector3 -> Scriptcraft Location JSON
    FromLocation(location),             // bkLocation -> Vector3
    toLocation(): JSONloc,              // Vector3 -> bkLocation
    FromArray(array: Array<number>),    // Array -> Vector3
    toArray(): Array<number|string>,    // Vector3 -> Array

    // Methods ----------------------------------------------------------------
    magnitude(): number,
        // Will return hypotenuse of vector
        // Uses Pythagorean Theorem to calculate this
    normalized(): Vector3,
        // Will scale the vector so that its magnitude is 1.
        // Clamps the vector into a unit circle
    getWorld(worldObj? :boolean): string|any,
        // Will return various instances of the world
        // If given: worldObj = true,       then returns a bukkit world object
        //           worldObj = false/null, then returns a string
    set(x :number, y :number, z :number, world:string),
        // Allows you to set values of the vector, without accessing
        // the core x,y,z,world elements
    toString(): string,
        // A custom function that outputs a string
        // Will ommit world if this.world is not set
    exportWorld(): any,
        // Will return a bukkit world object of the this.world value
    setWorldHeight(): Vector3,
        // Will set the vector.y to world top (128)
    setWorldBottom(): Vector3,
        // Will set the vector.y to world bottom (256)

    // Operands ---------------------------------------------------------------
    Subtract(vector :Vector3): Vector3, // this - vector
    Times(number :number): Vector3,     // this * number
    Multiply(number :number): Vector3,  // this * number
    Divide(number :number): Vector3,    // this / number
    Add(vector :Vector3): Vector3,      // this + vector
    Equals(vector :Vector3): Boolean
        // Compares this and vector to see if they are identical
        // x,y,z,world are used in this calculation
    NotEquals(vector :Vector3): Boolean // !equals()
    EqualsComponent(vector :Vector3): Boolean // equals(), but ommits world
    NotEqualsComponent(vector :Vector3): Boolean // !equals(), but ommits world

    // Statics (Dont use -> this) ---------------------------------------------
    // return a new Vector3|number|string etc, vs alters -> this
    Angle(vectorA :Vector3, vectorB :Vector3): number,
        // Returns the angle between the two vectors
    ClampMagnitude(vector :Vector3, maxLength :number): number,
        // Returns a copy of vector with its magnitude clamped to maxLength
    Cross(vectorA :Vector3, vectorB :Vector3): Vector3,
        // Cross Product of two vectors
    Minus(vectorA :Vector3, vectorB :Vector3): Vector3,
        // Minus one vector from another component wise (vectorA - vectorB)
    Distance(vectorA :Vector3, vectorB :Vector3): number,
        // Returns the distance between vectorA and vectorB
    Dot(vectorA :Vector3, vectorB :Vector3): number,
        // Dot Product of two vectors
    Lerp(vectorA :Vector3, vectorB :Vector3, percent :number): Vector3,
        // Linearly interpolates between two vectors
    LerpUnclamped(vectorA :Vector3, vectorB :Vector3, percent :number): Vector3,
        // Linearly interpolates between two vectors
        // without 0-1 percent sample clamp
    Max(vectorA :Vector3, vectorB :Vector3): Vector3,
        // Returns the largest of two vectors
    Min(vectorA :Vector3, vectorB :Vector3): Vector3,
        // Returns the smallest of two vectors
    Normalize(vectorA :Vector3): Vector3,
        // Will scale the vector so that its magnitude is 1.
        // Clamps the vector into a unit circle
    Scale(vectorA :Vector3, vectorB :Vector3): Vector3,
        // Multiplies two vectors component-wise.
    Average(vectors: Array<Vector3>): Vector3,
        // Averages a array of vectors to find the center
    GetWorlds(vectorA :Vector3, vectorB :Vector3),
        // Will come to a consensus on which world to use
        // Then apply that world to the two vectors
        // Used as a precaution of someone makes a vector with no world
    GetWorldsArray(vectors: Array<Vector3>): string
        // Will come to a consensus on which world to use
        // Then apply that world to all of vectors
        // Used as a precaution of someone makes a vector with no world
}

/**
 * Vector3
 * @constructor
 * @param {number} x - The x component axis
 * @param {number} y - The y component axis
 * @param {number} z - The z component axis
 * @param {string} [world] - World setter
 */
export class Vector3 {

    x: number = 0;
    y: number = 0;
    z: number = 0;
    world: string = '';

    constructor(x = 0, y = 0, z = 0, world = "") {
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
    static FromJSON(JSONlocation: JSONloc): Vector3 {
        return new Vector3(
        JSONlocation.x,
        JSONlocation.y,
        JSONlocation.z,
        JSONlocation.world
        );
    }

    /**
     * toJSON
     * @return {object} - JSON Location
     *
     * Will return a JSON object based of the objects values
     * If no world as been assigned previously, it will default to 'world'
     */
    toJSON(): JSONloc {
        var loc: JSONloc = {
            world: this.world || '',
            x: this.x,
            y: this.y,
            z: this.z,
            yaw: 0.0,
            pitch: 0.0
        };
        return loc;
    }

    /**
     * FromLocation
     * @param {object} location - Minecraft/Scriptcrat location object
     * @return {Vector3} - Generated Vector3 from location
     *
     * Will create a Vector3 object based on a location object
     */
    static FromLocation(location): Vector3 {
        var JSONloc = util.locationToJSON(location);
        return new Vector3(JSONloc.x, JSONloc.y, JSONloc.z, JSONloc.world);
    }

    /**
     * toLocation
     * @return {object} - location
     *
     * Will create a location object based from the vector
     */
    toLocation() {
        var loc : JSONloc = {
            world: this.world,
            x: this.x,
            y: this.y,
            z: this.z,
            yaw: 0.0,
            pitch: 0.0
        };
        return util.locationFromJSON(loc);
    }

    /**
     * FromArray
     * @param {Array} array - Vector Array
     *
     * Will take a vector array and return a Vector3
     */
    static FromArray(array) {
        if(array[3]) {
            return new Vector3(array[0], array[1], array[2]);
        } else {
            return new Vector3(array[0], array[1], array[2]);
        }
    }

    /**
     * toArray
     * @return {Array} - Vector Array
     *
     * Will return an array from a Vector3 object
     */
    toArray() {
        if(this.world == '') {
            return [this.x, this.y, this.z];
        } else {
            return [this.x, this.y, this.z, this.world];
        }
    }

    /**
     * back
     * @return {Vector3} - Vector3(0,0,-1)
     *
     * Will return a new Vector3(0,0,-1)
     */
    static back() {
        return new Vector3(0, 0, -1);
    }
    /**
     * forward
     * @return {Vector3} - Vector3(0,0,1)
     *
     * Will return a new Vector3(0,0,1)
     */
    static forward() {
        return new Vector3(0, 0, 1);
    }
    /**
     * right
     * @return {Vector3} - Vector3(1,0,0)
     *
     * Will return a new Vector3(1,0,0)
     */
    static right() {
        return new Vector3(1, 0, 0);
    }
    /**
     * left
     * @return {Vector3} - Vector3(-1,0,0)
     *
     * Will return a new Vector3(-1,0,0)
     */
    static left() {
        return new Vector3(-1, 0, 0);
    }
    /**
     * up
     * @return {Vector3} - Vector3(0,1,0)
     *
     * Will return a new Vector3(0,1,0)
     */
    static up() {
        return new Vector3(0, 1, 0);
    }
    /**
     * down
     * @return {Vector3} - Vector3(0,-1,0)
     *
     * Will return a new Vector3(0,-1,0)
     */
    static down() {
        return new Vector3(0, -1, 0);
    }
    /**
     * unit
     * @return {Vector3} - Vector3(1,1,1)
     * @alias one
     *
     * Will return a new Vector3(1,1,1)
     */
    static unit() {
        return new Vector3(1, 1, 1);
    }
    /**
     * one
     * @return {Vector3} - Vector3(1,1,1)
     * @alias unit
     *
     * Will return a new Vector3(1,1,1)
     */
    static one = Vector3.unit();
    /**
     * zero
     * @return {Vector3} - Vector3(0,0,0)
     *
     * Will return a new Vector3(0,0,0)
     * Same as calling the constructor without parameters
     */
    static zero = function() {
        return new Vector3(0, 0, 0);
    };
    /**
     * negativeInfinity
     * @return {Vector3} - Vector3(-Infinity,-Infinity,-Infinity)
     *
     * Will return a new Vector3(-Infinity,-Infinity,-Infinity)
     */
    static negativeInfinity = function() {
        return new Vector3(-Infinity, -Infinity, -Infinity);
    };
    /**
     * infinity
     * @return {Vector3} - Vector3(Infinity,Infinity,Infinity)
     *
     * Will return a new Vector3(Infinity,Infinity,Infinity)
     */
    static infinity = function() {
        return new Vector3(Infinity, Infinity, Infinity);
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
    magnitude(): number {
        return Math.sqrt(
            Math.pow(this.x,2) +
            Math.pow(this.y,2) +
            Math.pow(this.z,2)
        );
    }

    /**
     * normalized
     * @return {Vector3} - Normalized Vector
     *
     * Will scale the vector so that its magnitude is 1.
     * Clamps the vector into a unit circle
     */
    normalized() {
        var ratio = 1 / this.magnitude();
        return new Vector3(this.x * ratio, this.y * ratio, this.z * ratio);
    }

    /**
     * getWorld
     * @param {boolean} worldObj
     *
     * Will return various instances of the world
     * If given: worldObj = true,       then returns a bukkit world object
     *           worldObj = false/null, then returns a string
     */
    getWorld(worldObj?: boolean): string|any {
        worldObj = worldObj || false;
        if(worldObj) {
            return util.world(this.world);
        } else {
            return this.world;
        }
    }

    /**
     * set
     * @param {number} x - X axis value
     * @param {number} y - X axis value
     * @param {number} z - X axis value
     * @param {string} [world] - world axis value
     *
     * Allows you to reassign the vector from its core components
     */
    set(x:number, y:number, z:number, world?:string) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.world = world || '';
    }
    /**
     * toString
     * @return {string} - Stringified vector object
     *
     * A custom function that outputs a string
     * Will ommit world if this.world is not set
     */
    toString(): string {
        if(this.world == '') {
            return "[" + this.x + ", " + this.y + ", " + this.z + "]";
        } else {
            return "[" + this.x + ", " + this.y + ", " + this.z + ", " + this.world + "]";
        }
    }
    /**
     * exportWorld
     * @return {string|any}- Returns the world
     */
    exportWorld(): any {
        if( typeof this.world != 'string') {
            return this.world;
        } else {
            return util.world(this.world);
        }
    }
    /**
     * setWorldHeight
     * @return {Vector3}
     *
     * Will set the vector.y to world top (128)
     */
    setWorldHeight(): Vector3 {
        return new Vector3(
            this.x || 0,
            128,
            this.z || 0,
            this.world
        );
    }
    /**
     * setWorldBottom
     * @return {Vector3}
     *
     * Will set the vector.y to world bottom (0)
     */
    setWorldBottom(): Vector3 {
        return new Vector3(
            this.x || 0,
            0,
            this.z || 0,
            this.world
        );
    }

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
    static Subtract(vectorA :Vector3, vectorB: Vector3): Vector3 {
        return Vector3.Minus(vectorA, vectorB);
    }
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
    static Times(vectorA: Vector3, number: number): Vector3 {
        return Vector3.Multiply(vectorA, number);
    }
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
    static Multiply(vector: Vector3, number :number): Vector3 {
        return new Vector3(
            vector.x * number,
            vector.y * number,
            vector.x * number,
            vector.world
        );
    }

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
    static Divide(vectorA: Vector3, number: number): Vector3 {
        return new Vector3(
            vectorA.x / number,
            vectorA.y / number,
            vectorA.z / number,
            vectorA.world
        );
    }

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
    static Add(vectorA: Vector3, vectorB: Vector3): Vector3 {
        return new Vector3(
            vectorA.x + vectorB.x,
            vectorA.y + vectorB.y,
            vectorA.z + vectorB.z,
            vectorA.world
        );
    }

    /**
     * EqualsComponent
     * @static
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @return {boolean} - Resultant
     *
     * Checks if vectorA is the same as vectorB, not including world
     */
    static EqualsComponent(vectorA: Vector3, vectorB: Vector3): boolean {
        if (vectorA.x == vectorB.x &&
            vectorA.y == vectorB.y &&
            vectorA.z == vectorB.z) {
            return true;
        } else {
            return false;
        }
    }
    static NotEqualsComponent = (vectorA, vectorB) => !Vector3.EqualsComponent(vectorA, vectorB);

    /**
     * Equals
     * @static
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @return {boolean} - Resultant
     *
     * Checks if vectorA is the same as vectorB, including world
     */
    static Equals(vectorA: Vector3, vectorB: Vector3): boolean {
        if (vectorA.x == vectorB.x &&
            vectorA.y == vectorB.y &&
            vectorA.z == vectorB.z &&
            vectorA.world == vectorB.world) {
            return true;
        } else {
            return false;
        }
    }
    static NotEquals = (vectorA, vectorB) => !Vector3.Equals(vectorA, vectorB);

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
    static Angle(vectorA, vectorB) {
        return (
            Vector3.Dot(vectorA, vectorB) /
            (vectorA.magnitude() * vectorB.magnitude())
        );
    }

    /**
     * ClampMagnitude
     * @param {Vector3} vector - Arbitary Vector
     * @param {number} maxLength - Max length (number)
     * @return {number} - Angle between the vectors
     *
     * Returns a copy of vector with its magnitude clamped to maxLength
     */
    static ClampMagnitude(vector, maxLength) {
        return Math.min(vector.magnitude(), maxLength);
    }

    /**
     * Cross
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @return {Vector3} - Vector cross product
     *
     * Cross Product of two vectors
     */
    static Cross(vectorA, vectorB) {
        return new Vector3(
            vectorA.y * vectorB.z - vectorA.z * vectorB.y,
            vectorA.z * vectorB.x - vectorA.x * vectorB.z,
            vectorA.z * vectorB.y - vectorA.y * vectorB.x,
            this.GetWorlds(vectorA, vectorB)
        );
    }
    /**
     * Minus
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @return {Vector3} - Minused vector
     *
     * Minus one vector from another component wise (vectorA - vectorB)
     */
    static Minus(vectorA, vectorB) {
        return new Vector3 (
            vectorA.x - vectorB.x,
            vectorA.y - vectorB.y,
            vectorA.z - vectorB.z,
            this.GetWorlds(vectorA, vectorB)
        );
    }

    /**
     * Distance
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @return {number} - Distance between the vectors
     *
     * Returns the distance between vectorA and vectorB
     */
    static Distance(vectorA, vectorB) {
        var vector = new Vector3 (
            Math.abs(vectorA.x - vectorB.x ),
            Math.abs(vectorA.y - vectorB.y ),
            Math.abs(vectorA.z - vectorB.z )
            // World dose not matter, converted to single
            // number in the next step
        );
        return vector.magnitude();
    }

    /**
     * Dot
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @return {number} - Dot product
     *
     * Dot Product of two vectors
     */
    static Dot(vectorA, vectorB) {
        return  (vectorA.x * vectorB.x) +
                (vectorA.y * vectorB.y) +
                (vectorA.z * vectorB.z);
    }

    /**
     * Lerp
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @param {number} percent - 0-1 Value for sampling
     * @return {Vector3} - Vector postion between the two at the sampled percentage
     *
     * Linearly interpolates between two vectors
     */
    static Lerp(vectorA, vectorB, percent) {
        percent = Math.max(0, Math.min(1, percent || 0.5));
        return this.LerpUnclamped(vectorA, vectorB, percent);
    }

    /**
     * LerpUnclamped
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @param {number} percent - 0-1 Value for sampling
     * @return {Vector3} - Vector postion between the two at the sampled percentage
     *
     * Linearly interpolates between two vectors, without 0-1 percent sample clamp
     */
    static LerpUnclamped(vectorA, vectorB, percent) {
        // Gets point inbetween the two vectors based on a float
        var vectorBetween = Vector3.Subtract(vectorA, vectorB);
        return vectorA.add(Vector3.Times(vectorBetween, percent || 0.5));
    }

    /**
     * Max
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @return {Vector3} - The larger of the two vectors
     *
     * Returns a vector that is made from the largest components of two vectors
     */
    static Max(vectorA, vectorB) {
        if (vectorA.magnitude() > vectorB.magnitude()) {
            return vectorA;
        } else {
            return vectorB;
        }
    }

    /**
     * Min
     * @param {Vector3} vectorA - First Vector
     * @param {Vector3} vectorB - Second Vector
     * @return {Vector3} - The smaller of the two vectors
     *
     * Returns a vector that is made from the smallest components of two vectors
     */
    static Min(vectorA, vectorB) {
        if (vectorA.magnitude() < vectorB.magnitude()) {
            return vectorA;
        } else {
            return vectorB;
        }
    }

    // MoveTowards TODO

    /**
     * Normalize
     * @param {Vector3} vector - Vector to Normalize
     *
     * Returns a vector that is made from the smallest components of two vectors
     */
    static Normalize(vector) {
        return vector.normalized();
    }

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
    static Scale(vectorA, vectorB) {
        return new Vector3(
            vectorA.x * vectorB.x,
            vectorA.y * vectorB.y,
            vectorA.z * vectorB.z,
            Vector3.GetWorlds(vectorA, vectorB)
        );
    }

    // SignedAngle TODO
    // Slerp TODO
    // SlerpUnclamped TODO
    // SmoothDamp TODO

    // --------------------------------------

    static Average(vectors: Array<Vector3>): Vector3 {
        if(vectors.length == 0) { return vectors[0]; } else {
            var vector = new Vector3(0,0,0, this.GetWorldsArray(vectors));
            for (let i = 0; i < vectors.length; i++) {
                vector = Vector3.Add(vector, vectors[i]);
            }
            return Vector3.Divide(vector, vectors.length);
        }
    }
    static GetWorlds(vectorA :Vector3, vectorB :Vector3) {
        var worldA = vectorA.world || '';
        var worldB = vectorA.world || '';
        if(worldA == '' && worldB == '') {
            // No world is given
            return ''
        } else if(worldA == '') {
            // World B as the given world
            return worldB;
        } else if(worldB == '') {
            // World A as the given world
            return worldA;
        } else if(worldB == worldA) {
            // Both worlds have the same name
            return worldA;
        }
    }
    static GetWorldsArray(vectors: Array<Vector3>): string {
        // var worlds: Array<string> = [];
        // vectors.forEach(function(v) { worlds.push(v.world) });
        // var uWorlds = worlds.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
        // var fWorlds = uWorlds.filter(function(x){ return (x !== (undefined || null || '')); });
        // return fWorlds.length == 0 ? '' : fWorlds.length == 1 ? fWorlds[0] : fWorlds[Math.round(Math.random() * fWorlds.length)]

        // Old code
        var uniqueWorlds: Array<string> = [];
        for(var i = 0; i < vectors.length; i++) {
            if(uniqueWorlds.length == 0) { // If no worlds exist yet
                uniqueWorlds.push(vectors[i].world || ''); // Add it
            } else { // If worlds exist
                for(var j = 0; j < uniqueWorlds.length; i++) { // For every unique word
                    if(uniqueWorlds[i] != (vectors[i].world || '')) { // If the dose not exist yet in the array
                        uniqueWorlds.push(vectors[i].world || '')
                    }
                }
            }
            // vectors[i].world || '';
        }
        // Due to the way the logic works, remove blank strings ('')
        var finalWorlds: Array<string> = [];
        for(var k = 0; k < uniqueWorlds.length; k++) {
            if(uniqueWorlds[k] !== (undefined || null || '')) {
                finalWorlds.push(uniqueWorlds[k]);
            }
        }

        if(uniqueWorlds.length == 0) { // No worlds were in the array
            return '';
        } else if(uniqueWorlds.length == 1) { // Only one world was found
            return uniqueWorlds[0];
        } else {
            return uniqueWorlds[Math.round(Math.random() * uniqueWorlds.length)]
        }
    }
    static GetRandomPointAround(point: Vector3, radius: number) {
        const randAngleHoz = Math.round(Math.random() * 360);
        const randAngleVert = Math.round(Math.random() * 360);
        const randDist = Math.random() * radius;
        const x = Math.cos(randAngleHoz) * randDist;
        const y = Math.cos(randAngleVert) * randDist;
        const z = Math.sin(randAngleHoz) * randDist;
        const finalPoint = Vector3.Add(point, new Vector3(x,y,z));
        return finalPoint;
    }
}
