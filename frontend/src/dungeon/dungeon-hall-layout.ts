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

/** Wall-mounted decoration. Free wall zones: 300–570, 975–1115, 1200–1280. */
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
];

/** Chance a back-wall brick tile is swapped for a damaged variant. */
export const WALL_DAMAGE_CHANCE = 0.06;
/** Chance a floor tile uses a cracked variant instead of plain stone. */
export const FLOOR_VARIANT_CHANCE = 0.04;
