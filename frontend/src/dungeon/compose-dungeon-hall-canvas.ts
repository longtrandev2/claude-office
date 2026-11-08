/**
 * Paints the static Guild Hall (walls, floor, carpet, decoration) onto one
 * offscreen canvas, at an integer pixel scale with smoothing off.
 *
 * Baking the static scene into a single texture keeps it pixel-exact and
 * costs one draw call per frame, however much decoration is added.
 * Animated pieces (torch flicker, fountain water, lights) are separate layers.
 */
import type { DungeonAtlas } from "./dungeon-atlas";
import {
  FLOOR_VARIANT_CHANCE,
  HALL_AMBIENT_DARKNESS,
  HALL_CARPET,
  HALL_FLOOR_DECOR,
  HALL_HEIGHT,
  HALL_LIGHTS,
  HALL_LIT_ZONE_FACTOR,
  HALL_WALL_DECOR,
  HALL_WALL_HEIGHT,
  HALL_WIDTH,
  WALL_DAMAGE_CHANCE,
} from "./dungeon-hall-layout";
import {
  createRoomCanvas,
  mulberry32,
  paintAmbientDarkness,
  paintBackWall,
  paintDecor,
  paintFloor,
  paintRug,
  paintSideWalls,
  type Ctx,
  type RoomShape,
} from "./dungeon-room-painter";

const HALL_SHAPE: RoomShape = { width: HALL_WIDTH, height: HALL_HEIGHT, wallHeight: HALL_WALL_HEIGHT };

/** Crimson runner down the centre aisle, with a gold trim. */
function paintCarpet(ctx: Ctx): void {
  const c = HALL_CARPET;
  paintRug(ctx, {
    x: Math.round(c.centerX - c.width / 2),
    y: c.top,
    width: c.width,
    height: c.bottom - c.top,
    color: c.color,
    edgeColor: c.edgeColor,
    trimColor: c.trimColor,
  });
}

/** Compose the full static hall. Throws if a referenced sprite is missing. */
export function composeDungeonHallCanvas(atlas: DungeonAtlas): HTMLCanvasElement {
  const { canvas, ctx } = createRoomCanvas(HALL_SHAPE);
  const rand = mulberry32(0x6a11d);
  paintBackWall(ctx, atlas, rand, HALL_SHAPE, WALL_DAMAGE_CHANCE);
  paintFloor(ctx, atlas, rand, HALL_SHAPE, FLOOR_VARIANT_CHANCE);
  paintCarpet(ctx);
  paintSideWalls(ctx, atlas, HALL_SHAPE);
  paintDecor(ctx, atlas, HALL_WALL_DECOR);
  paintDecor(ctx, atlas, HALL_FLOOR_DECOR);
  paintAmbientDarkness(ctx, HALL_SHAPE, HALL_AMBIENT_DARKNESS, HALL_LIGHTS, HALL_LIT_ZONE_FACTOR);
  return canvas;
}
