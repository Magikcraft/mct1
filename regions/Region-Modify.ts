import { Region } from '@magikcraft/mct1/regions'
import { Direction } from '@magikcraft/mct1/vector3'

// interface PercentFill {
//     blockID: number,
//     percentage: number
// }

export class Region_Modify {

    /**
     * GetSide
     * @param region - The given region
     * @param dir - The given direction
     *
     * Return region side in direction from center
     */
    static GetSide(region: Region, dir: Direction): Region {
        switch (dir) {
            case Direction.UP:
                break;
            case Direction.DOWN:
                break;
            case Direction.NORTH:
                break;
            case Direction.EAST:
                break;
            case Direction.SOUTH:
                break;
            case Direction.WEST:
                break;
            default:
                // return region;
                break;
        }
        return region;
    }
    // Return region edge in 2 directions from center
    // Return region moved in axis & amount
    // Return region outset'ed
    // Return region inset'ed
    // Return region expanded in axis & amount
    // Return region contracted in axis & amount

    // Return overlapping region from 2 regions

}