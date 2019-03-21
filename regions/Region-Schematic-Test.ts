import { Vector3 } from "@magikcraft/mct1/vector3";
import { Region, Region_Schematic } from "@magikcraft/mct1/regions";


const testRegion = new Region(
    new Vector3(209, 83, 315, 'mct1-jail'),
    new Vector3(205, 86, 330, 'mct1-jail')
);

export default function testRegionSchematic() {
    const schematic = Region_Schematic.saveRegion(testRegion);
    Region_Schematic.writeSchematic(schematic, testRegion.getWorld(), new Vector3(100, 100, 100));
}