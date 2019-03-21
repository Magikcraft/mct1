import { Region } from 'mct1/regions';
import { Vector3 } from 'mct1/vector3';
const Location = Java.type('org.bukkit.Location');

import { Logger } from 'mct1/log'
const log = Logger(`${[__dirname, __filename].join('/')}`)

export const getLocations = (world) => {
    return {
        world: world,
        waypoints: {
            run1: {
                region: [
                    new Location(world, -145, 68, 134),
                    new Location(world, -129, 88, 207),
                ],
                saveLocation: new Location(world, -143, 68, 144, -25, -8),
            },
            run2: {
                region: [
                    new Location(world, -143, 87, 208),
                    new Location(world, -75, 73, 191),
                ],
                saveLocation: new Location(world, -137, 73, 191, -28, -22),
            },
            run3: {
                region: [
                    new Location(world, -89, 78, 191),
                    new Location(world, -75, 97, 258),
                ],
                saveLocation: new Location(world, -89, 78, 195, -26, -19),
            },
            run4: {
                region: [
                    new Location(world, -74, 83, 244),
                    new Location(world, -142, 103, 254),
                ],
                saveLocation: new Location(world, -79, 83, 244, 90, -16),
            },
            run5: {
                region: [
                    new Location(world, -128, 88, 240),
                    new Location(world, -144, 102, 307),
                ],
                saveLocation: new Location(world, -134, 88, 243, -1, -16),
            }
        },
        locations: {
            spawn: new Location(world, -177, 46, 148, -177, -1),
            // spawn: new Location(world, -141, 93, 321, 135, 26), // temp
            endChest: new Location(world, -144, 92, 318),

            run1: run1(world).map(rows => rows.map(row => new Location(world, row.x, row.y, row.z))),
            run2: run2(world).map(rows => rows.map(row => new Location(world, row.x, row.y, row.z))),
            run3: run3(world).map(rows => rows.map(row => new Location(world, row.x, row.y, row.z))),
            run4: run4(world).map(rows => rows.map(row => new Location(world, row.x, row.y, row.z))),
            run5: run5(world).map(rows => rows.map(row => new Location(world, row.x, row.y, row.z))),
        },
        regions: {
            endPortal: [
                new Location(world, -137, 93, 333),
                new Location(world, -100, 97, 340),
            ],
            endGate: [
                new Location(world, -133, 93, 332),
                new Location(world, -135, 95, 335),
            ],
        },
    }
}

function run1(world) {
    const y = 84;
    const rows: any[] = [];
    for (let z = 156; z <= 188; z++) {
        const row: any[] = [];
        for (let x = -129; x >= -139; x--) {
            row.push({ x, y, z });
        }
        rows.push(row);
    }
    return rows;
}

function run2(world) {
    const y = 89;
    const rows: any[] = [];

    for (let x = -126; x <= -95; x++) {
        const row: any[] = [];
        for (let z = 194; z <= 204; z++) {
            row.push({ x, y, z });
        }
        rows.push(row);
    }
    return rows;
}

function run3(world) {
    const y = 94;
    const rows: any[] = [];
    for (let z = 206; z <= 238; z++) {
        const row: any[] = [];
        for (let x = -79; x >= -89; x--) {
            row.push({ x, y, z });
        }
        rows.push(row);
    }
    return rows;
}

function run4(world) {
    const y = 99;
    const rows: any[] = [];

    for (let x = -90; x >= -123; x--) {
        const row: any[] = [];
        for (let z = 244; z <= 254; z++) {
            row.push({ x, y, z });
        }
        rows.push(row);
    }
    return rows;
}

function run5(world) {
    const y = 104;
    const rows: any[] = [];
    for (let z = 256; z <= 292; z++) {
        const row: any[] = [];
        for (let x = -129; x >= -139; x--) {
            row.push({ x, y, z });
        }
        rows.push(row);
    }
    return rows;
}