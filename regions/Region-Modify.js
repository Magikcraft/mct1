"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vector3_1 = require("mct1/vector3");
// interface PercentFill {
//     blockID: number,
//     percentage: number
// }
var Region_Modify = /** @class */ (function () {
    function Region_Modify() {
    }
    /**
     * GetSide
     * @param region - The given region
     * @param dir - The given direction
     *
     * Return region side in direction from center
     */
    Region_Modify.GetSide = function (region, dir) {
        switch (dir) {
            case vector3_1.Direction.UP:
                break;
            case vector3_1.Direction.DOWN:
                break;
            case vector3_1.Direction.NORTH:
                break;
            case vector3_1.Direction.EAST:
                break;
            case vector3_1.Direction.SOUTH:
                break;
            case vector3_1.Direction.WEST:
                break;
            default:
                // return region;
                break;
        }
        return region;
    };
    return Region_Modify;
}());
exports.Region_Modify = Region_Modify;
