/**
 * Layout of the Guild Hall background (static parts), in canvas pixels.
 *
 * Everything is drawn at one integer scale (DUNGEON_SCALE) so environment and
 * heroes share the same pixel size. Functional spots (desks, Guild Master,
 * portal/elevator, printer) keep the engine's existing coordinates; this file
 * only places decoration around them.
 *
 * Sprite names refer to the 0x72 atlas; names starting with "prop:" are
 * standalone CC0 prop images (see dungeon-atlas.ts).
 */
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";

/** Pixel scale applied to every 16px source sprite. */
export const DUNGEON_SCALE = 3;
/** One source tile on screen (16 × scale). */
export const HALL_TILE = 16 * DUNGEON_SCALE;
/** Back wall height — matches the engine's wall/nav boundary. */
export const HALL_WALL_HEIGHT = 250;

export const HALL_WIDTH = CANVAS_WIDTH;
export const HALL_HEIGHT = CANVAS_HEIGHT;

/** Centre aisle carpet: from the wall down to the Guild Master's war table. */
export const HALL_CARPET = {
  centerX: 640,
  width: 4 * HALL_TILE, // 192px, fits between the desk columns at 512 / 768
  top: HALL_WALL_HEIGHT,
  bottom: CANVAS_HEIGHT,
  color: "#6b2433",
  edgeColor: "#43141f",
  trimColor: "#b8892f",
};

/** A decoration placed at canvas position (top-left), drawn at DUNGEON_SCALE. */
export interface HallDecor {
  sprite: string;
  x: number;
  y: number;
}

/** Wall-mounted decoration. Free wall zones: 180–570, 975–1115, 1200–1280. */
export const HALL_WALL_DECOR: HallDecor[] = [
  // Zone A (old city window): column · banner · fountain · banner · column
  { sprite: "column_wall", x: 300, y: HALL_WALL_HEIGHT - 3 * HALL_TILE },
  { sprite: "wall_banner_red", x: 362, y: 106 },
  { sprite: "wall_fountain_top_1", x: 425, y: 58 },
  { sprite: "wall_fountain_mid_red_anim_f0", x: 425, y: 106 },
  { sprite: "wall_fountain_basin_red_anim_f0", x: 425, y: 154 },
  { sprite: "wall_banner_red", x: 488, y: 106 },
  { sprite: "column_wall", x: 522, y: HALL_WALL_HEIGHT - 3 * HALL_TILE },
  // Zone B (old water cooler): banner flanked by candles
  { sprite: "prop:wall-candle-f0", x: 990, y: 120 },
  { sprite: "wall_banner_blue", x: 1022, y: 106 },
  { sprite: "prop:wall-candle-f0", x: 1086, y: 120 },
  // Where the office "employee of the month" frame hung: guild colours.
  { sprite: "wall_banner_yellow", x: 196, y: 106 },
  { sprite: "wall_banner_green", x: 250, y: 106 },
  // Candles beside the portal and the clock
  { sprite: "prop:wall-candle-f0", x: 150, y: 120 },
  { sprite: "prop:wall-candle-f0", x: 1240, y: 150 },
];

/** Floor clutter in corners and along walls, clear of desks and paths. */
export const HALL_FLOOR_DECOR: HallDecor[] = [
  { sprite: "crate", x: 1210, y: 262 },
  { sprite: "prop:barrel", x: 1150, y: 268 },
  { sprite: "crate", x: 1222, y: 318 },
  { sprite: "skull", x: 30, y: 640 },
  { sprite: "skull", x: 1228, y: 760 },
  { sprite: "prop:barrel", x: 1200, y: 930 },
  { sprite: "crate", x: 1150, y: 948 },
  { sprite: "flask_big_red", x: 1110, y: 975 },
  { sprite: "skull", x: 190, y: 985 },
  // Standing candles flanking the Guild Master's war table (light sources).
  { sprite: "prop:standing-candle-f0", x: 470, y: 838 },
  { sprite: "prop:standing-candle-f0", x: 777, y: 838 },
];

/** Chance a back-wall brick tile is swapped for a damaged variant. */
export const WALL_DAMAGE_CHANCE = 0.06;
/** Chance a floor tile uses a cracked variant instead of plain stone. */
export const FLOOR_VARIANT_CHANCE = 0.04;

/** Animated sprites drawn over the baked hall (frame lists cycle in place). */
export interface HallAnimatedDecor {
  /** Atlas frame names or "prop:" images, in playback order. */
  frames: string[];
  x: number;
  y: number;
  /** Milliseconds per frame. */
  frameMs: number;
}

const CANDLE_FRAMES = ["prop:wall-candle-f0", "prop:wall-candle-f1", "prop:wall-candle-f2"];
const STANDING_CANDLE_FRAMES = [0, 1, 2, 3].map((i) => `prop:standing-candle-f${i}`);
const standingCandles = () => HALL_FLOOR_DECOR.filter((d) => d.sprite === "prop:standing-candle-f0");
const fountainFrames = (part: "mid" | "basin") =>
  [0, 1, 2].map((i) => `wall_fountain_${part}_red_anim_f${i}`);

/** Must sit exactly on the static copies baked into the background. */
export const HALL_ANIMATED_DECOR: HallAnimatedDecor[] = [
  { frames: fountainFrames("mid"), x: 425, y: 106, frameMs: 160 },
  { frames: fountainFrames("basin"), x: 425, y: 154, frameMs: 160 },
  ...HALL_WALL_DECOR.filter((d) => d.sprite === "prop:wall-candle-f0").map((d, i) => ({
    frames: CANDLE_FRAMES,
    x: d.x,
    y: d.y,
    frameMs: 120 + i * 17, // slightly different rates so candles never sync
  })),
  ...standingCandles().map((d, i) => ({
    frames: STANDING_CANDLE_FRAMES,
    x: d.x,
    y: d.y,
    frameMs: 140 + i * 23,
  })),
];

/** A warm light pool around a real light source (no source, no light). */
export interface HallLight {
  x: number;
  y: number;
  radius: number;
  color: number;
}

const CANDLE_FLAME_OFFSET = { x: 3 * DUNGEON_SCALE, y: 2 * DUNGEON_SCALE };

export const HALL_LIGHTS: HallLight[] = [
  // Portal (old elevator spot): cold arcane glow spilling onto the floor.
  { x: 86, y: 214, radius: 88, color: 0x5fc1b5 },
  // Fountain: hot red-orange glow around the basin.
  { x: 449, y: 178, radius: 96, color: 0xff6a3d },
  ...HALL_WALL_DECOR.filter((d) => d.sprite === "prop:wall-candle-f0").map((d) => ({
    x: d.x + CANDLE_FLAME_OFFSET.x,
    y: d.y + CANDLE_FLAME_OFFSET.y,
    radius: 84,
    color: 0xffb35c,
  })),
  ...standingCandles().map((d) => ({
    x: d.x + 5 * DUNGEON_SCALE,
    y: d.y + 3 * DUNGEON_SCALE,
    radius: 120,
    color: 0xffb35c,
  })),
];

/** Ambient darkness over the hall (lit pools are cut out around HALL_LIGHTS). */
export const HALL_AMBIENT_DARKNESS = "rgba(10, 7, 18, 0.46)";
/** How far beyond a light's radius its baked lit zone reaches. */
export const HALL_LIT_ZONE_FACTOR = 1.5;
