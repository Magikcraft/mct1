import { Vector3 } from './Vector3'
import * as blocks from 'blocks'

export class Vector3World {
    // Will get the first safe spawnable block
    static GetSafePos(vector: Vector3): Vector3 {
        var world = vector.toLocation().world
        var priorPos = vector
        var currentPos = vector
        var hasFoundBlock = false
        var priorBlock = null
        while (!hasFoundBlock) {
            var block = world.getBlockAt(
                currentPos.x,
                currentPos.y,
                currentPos.z
            )
            if (blocks.air != block) {
                // If its registered anything else (ground) move it up
                if (blocks.air == priorBlock && priorBlock != null) {
                    //
                    return priorPos
                }
                priorPos = currentPos
                priorBlock = block
                currentPos = new Vector3(
                    currentPos.x,
                    currentPos.y + 1,
                    currentPos.z
                )
            } else {
                // If its registered air, move it down
                if (blocks.air != priorBlock && priorBlock != null) {
                    return priorPos
                }
                priorPos = currentPos
                priorBlock = block
                currentPos = new Vector3(
                    currentPos.x,
                    currentPos.y - 1,
                    currentPos.z
                )
            }
            priorBlock = block
        }
        return vector // If it all fails, return Vector3
    }
    // Will get the first block in the Y axis that is touched by sun
    static GetSunPos(vector: Vector3): Vector3 {
        const world = vector.toLocation().world
        var priorPos = vector.setWorldHeight()
        var currentPos = vector.setWorldHeight()
        var finalPos = vector.setWorldHeight()
        var hasFoundBlock = false
        while (!hasFoundBlock) {
            var block = world.getBlockAt(
                currentPos.x,
                currentPos.y,
                currentPos.z
            )
            // log("Checking for block, at: " + new Vector3(currentPos.x,currentPos.y,currentPos.z).toString() + ", block is: " + block.getType​());
            if (block.getType() != 'AIR') {
                // log("Block has been found: " + block.getType​());
                hasFoundBlock = true
                finalPos = new Vector3(
                    priorPos.x,
                    priorPos.y + 1,
                    priorPos.z,
                    vector.world
                )
                // log("Final Position: " + finalPos.toString());
                return finalPos
            } else {
                // log("No Block Found: " + block.getType​());
                priorPos = currentPos
                currentPos = new Vector3(
                    currentPos.x,
                    currentPos.y - 1,
                    currentPos.z
                )
            }
        }
        return finalPos
    }
    // Will generate an array of Vector3's that span between two points
    static Line(vectorA: Vector3, vectorB: Vector3): Array<Vector3> {
        const dx = vectorB.x - vectorA.x
        const dy = vectorB.y - vectorA.y
        const dz = vectorB.z - vectorA.z
        const iterations = Math.max(dx, dy, dz)
        for (var i = 0; i < iterations; i++) {}

        // dx = x2 - x1
        // dy = y2 - y1
        // for x from x1 to x2 {
        //     y = y1 + dy * (x - x1) / dx
        //     plot(x, y)
        // }
        return [new Vector3(0, 0, 0)]
    }
    // Will generate an array of Vector3's that will be in a radis out a point
    static FlatCircle(vector: Vector3, radius: number): Array<Vector3> {
        return [new Vector3(0, 0, 0)]
    }
}
