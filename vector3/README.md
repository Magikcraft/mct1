# Vector3 Class

The Vector3 class is a near 1:1 implimentation of the Unity API Vector3 class. We decided to use this class as the Unity3D Engine is considered industry standard, and thus going to be easy to on board new users, and they gain valuable skills.

Our specific implimetnation dose not have every item as we use the Vector3 class only for location storage. Where as in the Unity3D Engine its used as location, direction and rotation (Exactly as they are used in maths). While we could use these the same way, the minecraft API handles a lot of elements, and we can always use Vector3 if need be.

## Types

With the magikcraft API, there are many ways that data is stored. This is in part because of the mulitude of layers and data handleing systems operating in between them.

The most important 3 types of data are:
* Standard Coordinates: `x, y, z, world`
* Stringified JSON Location: `{world: ,z:, y:, z:, yaw:, pitch:}`
* Location Object: `(org.bukkit.location) bkLocation`

Consequetly this class handles the importing and exporting of each of these types, to make using the Vector3 class as easy as possible.

## Class Functions

```typescript
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
    // WIll set the vector.y to world top (128)
setWorldBottom(): Vector3,
    // Will set the vector.y to world bottom (256)

// Operands ---------------------------------------------------------------
subtract(vector :Vector3): Vector3, // this - vector
times(number :number): Vector3,     // this * number
multiply(number :number): Vector3,  // this * number
divide(number :number): Vector3,    // this / number
add(vector :Vector3): Vector3,      // this + vector
equals(vector :Vector3): Boolean 
    // Compares this and vector to see if they are identical
    // x,y,z,world are used in this calculation
notEquals(vector :Vector3): Boolean // !equals()
equalsComponent(vector :Vector3): Boolean // equals(), but ommits world
notEqualsComponent(vector :Vector3): Boolean // !equals(), but ommits world

// Statics (Dont use -> this) ---------------------------------------------
// return a new Vector3|number|string etc, vs alters -> this
angle(vectorA :Vector3, vectorB? :Vector3): number,
    // Returns the angle between the two vectors
clampMagnitude(vector :Vector3|any, maxLength? :number|any): number,
    // Returns a copy of vector with its magnitude clamped to maxLength
cross(vectorA :Vector3, vectorB? :Vector3): Vector3,
    // Cross Product of two vectors
minus(vectorA :Vector3, vectorB? :Vector3): Vector3,
    // Minus one vector from another component wise (vectorA - vectorB)
distance(vectorA :Vector3, vectorB? :Vector3): number,
    // Returns the distance between vectorA and vectorB
dot(vectorA :Vector3, vectorB? :Vector3): number,
    // Dot Product of two vectors
lerp(vectorA :Vector3, vectorB? :Vector3|any,
    percent? :number): Vector3,
    // Linearly interpolates between two vectors
lerpUnclamped(vectorA :Vector3, vectorB? :Vector3|any, 
    percent? :number): Vector3,
    // Linearly interpolates between two vectors
    // without 0-1 percent sample clamp
max(vectorA :Vector3, vectorB? :Vector3): Vector3,
    // Returns the largest of two vectors
min(vectorA :Vector3, vectorB? :Vector3): Vector3,
    // Returns the smallest of two vectors
normalize(vectorA :Vector3): Vector3,
    // Will scale the vector so that its magnitude is 1.
    // Clamps the vector into a unit circle
scale(vectorA :Vector3, vectorB? :Vector3): Vector3,
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
```

## Examples

### Importing Vector3's
```javascript
var Vector3 = require('magikcraft/vector3').Vector3;
```

### Make a vector
To use vectors, you need to make a Vector3 Object. This is made though the use of the `new` keyword, in front of `Vector3`
```javascript
var v = new Vector(3, 4, 5);
// v => Vector{3, 4, 5}
```

### Make a vector with a world
Since vectors are supposed to be used in the context of the world, and that minecraft is built around mulitple world. The Vector3 class supports the additon of a world object. This is just a string of the world name, as storing a Java object class (org.bukkit.world) dose not work too well long term.
```javascript
var v = new Vector(3, 4, 5, 'world');
// v => Vector{3, 4, 5, 'world'}
```

### Add/Subtract/Divide/Multiply vectors
```javascript
var vectorA = new Vector(5,2,9);
var vectorB = new Vector(3,8,7);

// *Add*
var v = Vector3.Add(vectorA, vectorB);
// v => Vector{8, 10, 16}

// *Subtract*
var v = Vector3.subtract(vectorA, vectorB);
// v => Vector{5, 2, 9}

// *Divide*
var v = Vector3.multiply(vectorA, 5);
// v => Vector{25, 10, 45}

// *Multiply*
var v = Vector3.divide(vectorB, 2);
// v => Vector{1.5, 4, 3.5}
```

### Get the magnitude/hypenuse of the vector
```javascript
var v = new Vector(3, 4, 5);
var mag = v.magnitude();
// mag => 7.0710678119...
```

### Distance between two vectors
```javascript
var vectorA = new Vector(4, 6, 3);
var vectorB = new Vector(1, 3, 8);
var vectorC = new Vector(2, 9, 5);

// This will use vectorA to compare against vectorB
var dist = Vector3.Distance(vectorA, vectorB);
// dist => 6.5574385243...
```

### Point between two vectors
```javascript
var vectorA = new Vector(4, 6, 3);
var vectorB = new Vector(1, 3, 8);

// All of these will result in the same outcome
var point = Vector3.Lerp(vectorA, vectorB);
          = Vector3.Lerp(vectorA, vectorB, 0.5);
// point => Vector3{2.5, 4.5, 5.5}
```