declare const echo: (player: any, msg: string) => void;
declare const java: any;
declare const __plugin: any;
declare const __dirname: string;
declare const __filename: string;
declare const org: any;
declare const refresh: () => void;
declare const __require: (filename: string) => any;
declare const require: (filename: string, options?: { cache?: boolean }) => any;
declare const console: { log: (msg: string) => void };
declare const isJavaObject: (obj: any) => boolean;
declare const config: any;
declare const scload: (file: any) => any;
declare const EventEmitter: any;
declare const self: any;
declare const Java: Java;
declare const setTimeout: (callbackFn, delay: any) => number;
declare const setInterval: (callbackFn, delay: any) => number;
declare const clearTimeout: (handle: any) => void;
declare const clearInterval: (handle: any) => void;
declare const engineUUID: String;

declare interface Java {
    type: (type: string) => any
    from: (JavaScriptItem: any) => any
}
interface Array<T> {
    includes(searchElement: T, fromIndex?: number): boolean;
}

declare interface events {
    playerJoin: (event) => void;
    playerCommandPreprocess: (evt) => void;
    serverCommand: (event) => void;
    playerQuit: (event) => void;
    playerInteract: (event) => void;
    entityDamageByEntity: (event) => void;
    entityDamage: (event) => void;
    projectileHit: (event) => void;
    entitySpawn: (event) => void;
    playerRespawn: (event) => void;
}

type NashornScriptEngine = any;
type BukkitPlayer = any;

/* declare const command: (name, func, options, intercepts) => () => void; */

interface String {
    includes(substring: string): boolean;
}

type callbackFn = (event: any) => void;

declare const global: {
    args: any;
    self: BukkitPlayer;
    require: (filename: string) => any;
    __engine_name__: string;
    __engine_id__: number;
    __plugin: any;
    __require: any;
    echo: (player: BukkitPlayer, message: string) => void;
    refresh: () => void;
    java: any;
    EventEmitter: any;
    setTimeout: (callbackFn, delay: number) => number;
    setInterval: (callbackFn, delay: number) => number;
    clearTimeout: (handle: number) => void;
    clearInterval: (handle: number) => void;
    engineUUID: String;
    magikcraft: any;
    magik: any;
};

/*
	Boss Bar API
*/

type TextComponent = any;
interface BossBarAPI {
    addBar(
        player: BukkitPlayer,
        text: TextComponent,
        color: BarsColor,
        stinterfaceyle: BarsStyle,
        progress: number
    ): BossBar;
    getBossBars(): BossBar[];
    addBarForPlayer(player: BukkitPlayer, bossBar: BossBar): void;
    removeBarForPlayer(player: BukkitPlayer, bossBar: BossBar): void;

    Color: BarsColor;
    Style: BarsStyle;
}

type BukkitBlock = any
type BukkitWorld = any
type BukkitVector = any
type BukkitChunk = any

/* interface BukkitWorld {

} */
interface BukkitLocation {
    world: BukkitWorld
    x: number,
    y: number
    z: number
    yaw: number
    pitch: number
    block: BukkitBlock
    getBlock: () => BukkitBlock
    add: (x: number, y: number, z: number) => BukkitLocation
    clone: () => BukkitLocation
    distance: (location: BukkitLocation) => BukkitLocation
    distanceSquared: (location: BukkitLocation) => BukkitLocation
    equals: (location: BukkitLocation) => boolean
    getBlockX: () => number
    getBlockY: () => number
    getBlockZ: () => number
    getChunk: () => BukkitChunk
    getDirection: () => BukkitVector
    getPitch: () => number
    getWorld: () => BukkitWorld
    length: () => number
    lengthSquared: () => number
    locToBlock: () => number
    multiple: () => BukkitLocation
    setDirection: () => BukkitLocation
}
interface BossBar {
    addPlayer(player: BukkitPlayer): void;
    removePlayer(player: BukkitPlayer): void;
    getColor(): BarsColor;
    setColor(color: BarsColor): void;
    getStyle(): BarsStyle;
    setStyle(style: BarsStyle): void;
    setProperty(property: any, flag: boolean): void;
    getMessage(): string;
    setMessage(msg: string): void;
    setVisible(flag: boolean): void;
    isVisible(): boolean;
    getProgress(): number;
    setProgress(progress: number): void;
}
interface BarsColor {
    readonly PINK: any;
    readonly RED: any;
    readonly GREEN: any;
    readonly BLUE: any;
    readonly YELLOW: any;
    readonly PURPLE: any;
    readonly WHITE: any;
}

interface BarsStyle {
    readonly PROGRESS: any;
    readonly NOTCHED_6: any;
    readonly NOTCHED_10: any;
    readonly NOTCHED_12: any;
    readonly NOTCHED_20: any;
}

declare enum ChatColor {
    'AQUA',
    'BLACK',
    'BLUE',
    'BOLD',
    'DARK_AQUA',
    'DARK_BLUE',
    'DARK_GRAY',
    'DARK_GREEN',
    'DARK_PURPLE',
    'DARK_RED',
    'GOLD',
    'GRAY',
    'GREEN',
    'ITALIC',
    'LIGHT_PURPLE',
    'MAGIC',
    'RED',
    'RESET',
    'STRIKETHROUGH',
    'UNDERLINE',
    'WHITE',
    'YELLOW'
}

declare enum color {
    'BLUE',
    'GREEN',
    'PINK',
    'PURPLE',
    'RED',
    'WHITE',
    'YELLOW'
}

declare enum style {
    'NOTCHED_10',
    'NOTCHED_12',
    'NOTCHED_20'
}
interface IBar {
    show(): IBar;
    text(msg: string): IBar;
    textComponent(textComponent: TextComponent): IBar;
    color(color: color): IBar;
    style(style: style): IBar;
    progress(percentage: number): IBar;
    addPlayer(player: BukkitPlayer): IBar;
    removePlayer(player: BukkitPlayer): IBar;
    remove(): void;
    removeAllBars(player: BukkitPlayer): any;
}

interface _IBar extends IBar {
    _bar: BossBar;
    _msg: string | null;
    _color: BarsColor;
    _progress: number;
    _style: BarsStyle;
    _init: boolean;
    _textComponent: TextComponent | null;
    _hasTextComponent: boolean;
    removeAllBars: any;
}

interface IComponentBuilder {
    (text: string): IComponentBuilder;
    append(msg: string): IComponentBuilder;
    bold(bold: boolean): IComponentBuilder;
    color(color: ChatColor): IComponentBuilder;
    create(): TextComponent;
    italic(italic: boolean): IComponentBuilder;
    strikethrough(strikethrough: boolean): IComponentBuilder;
    underlined(underlined: boolean): IComponentBuilder;
}

/*
  GETTEXT
*/

interface ILocaleStrings {
    [key: string]: (string | null)[]
}

type msgarg = number | string;