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
  DUNGEON_SCALE,
  FLOOR_VARIANT_CHANCE,
  HALL_CARPET,
  HALL_FLOOR_DECOR,
  HALL_HEIGHT,
  HALL_TILE,
  HALL_WALL_DECOR,
  HALL_WALL_HEIGHT,
  HALL_WIDTH,
  WALL_DAMAGE_CHANCE,
  type HallDecor,
} from "./dungeon-hall-layout";

const FLOOR_VARIANTS = ["floor_2", "floor_3", "floor_4", "floor_5", "floor_6", "floor_7", "floor_8"];
const WALL_DAMAGE = ["wall_hole_1", "wall_hole_2"];
/** Stepped darkness per brick row going up the wall (reads as a deep ceiling). */
const WALL_ROW_SHADE = [0, 0.12, 0.26, 0.42, 0.58, 0.72];
const WALL_FOOT_SHADOW = "rgba(0, 0, 0, 0.38)";

/** Small deterministic PRNG so the hall looks identical on every load. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Ctx = CanvasRenderingContext2D;

/** Draw an atlas frame or a "prop:" image at (x, y), scaled by DUNGEON_SCALE. */
function drawSprite(ctx: Ctx, atlas: DungeonAtlas, name: string, x: number, y: number): void {
  if (name.startsWith("prop:")) {
    const img = atlas.props[name.slice(5)];
    if (!img) throw new Error(`Unknown dungeon prop "${name}"`);
    ctx.drawImage(img, Math.round(x), Math.round(y), img.width * DUNGEON_SCALE, img.height * DUNGEON_SCALE);
    return;
  }
  const f = atlas.frames[name];
  if (!f) throw new Error(`Unknown atlas frame "${name}"`);
  ctx.drawImage(atlas.image, f.x, f.y, f.w, f.h, Math.round(x), Math.round(y), f.w * DUNGEON_SCALE, f.h * DUNGEON_SCALE);
}

function paintBackWall(ctx: Ctx, atlas: DungeonAtlas, rand: () => number): void {
  // Brick rows stacked upward from the wall foot; the top row may be cut off.
  for (let row = 0, y = HALL_WALL_HEIGHT - HALL_TILE; y > -HALL_TILE; row++, y -= HALL_TILE) {
    for (let x = 0; x < HALL_WIDTH; x += HALL_TILE) {
      const damaged = row > 0 && rand() < WALL_DAMAGE_CHANCE;
      drawSprite(ctx, atlas, damaged ? WALL_DAMAGE[Math.floor(rand() * WALL_DAMAGE.length)] : "wall_mid", x, y);
    }
    const shade = WALL_ROW_SHADE[Math.min(row, WALL_ROW_SHADE.length - 1)];
    if (shade > 0) {
      ctx.fillStyle = `rgba(6, 4, 12, ${shade})`;
      ctx.fillRect(0, y, HALL_WIDTH, HALL_TILE);
    }
  }
}

function paintFloor(ctx: Ctx, atlas: DungeonAtlas, rand: () => number): void {
  for (let y = HALL_WALL_HEIGHT; y < HALL_HEIGHT; y += HALL_TILE) {
    for (let x = 0; x < HALL_WIDTH; x += HALL_TILE) {
      const name = rand() < FLOOR_VARIANT_CHANCE
        ? FLOOR_VARIANTS[Math.floor(rand() * FLOOR_VARIANTS.length)]
        : "floor_1";
      drawSprite(ctx, atlas, name, x, y);
    }
  }
  // Contact shadow where the floor meets the wall.
  ctx.fillStyle = WALL_FOOT_SHADOW;
  ctx.fillRect(0, HALL_WALL_HEIGHT, HALL_WIDTH, 2 * DUNGEON_SCALE);
}

/** Crimson runner with a gold trim, in whole source pixels (multiples of scale). */
function paintCarpet(ctx: Ctx): void {
  const c = HALL_CARPET;
  const px = DUNGEON_SCALE;
  const left = Math.round(c.centerX - c.width / 2);
  const height = c.bottom - c.top;
  ctx.fillStyle = c.edgeColor;
  ctx.fillRect(left, c.top, c.width, height);
  ctx.fillStyle = c.color;
  ctx.fillRect(left + px, c.top, c.width - 2 * px, height);
  // Gold trim one source pixel inside each edge.
  ctx.fillStyle = c.trimColor;
  ctx.fillRect(left + 2 * px, c.top, px, height);
  ctx.fillRect(left + c.width - 3 * px, c.top, px, height);
  // Faint woven bands every two tiles so the runner reads as cloth, not paint.
  ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
  for (let y = c.top + HALL_TILE; y < c.bottom; y += 2 * HALL_TILE) {
    ctx.fillRect(left + 3 * px, y, c.width - 6 * px, px);
  }
}

function paintSideWalls(ctx: Ctx, atlas: DungeonAtlas): void {
  for (let y = HALL_WALL_HEIGHT; y < HALL_HEIGHT; y += HALL_TILE) {
    drawSprite(ctx, atlas, "wall_edge_left", 0, y);
    drawSprite(ctx, atlas, "wall_edge_right", HALL_WIDTH - HALL_TILE, y);
  }
}

function paintDecor(ctx: Ctx, atlas: DungeonAtlas, decor: HallDecor[]): void {
  // Draw top-to-bottom so lower (nearer) items overlap higher ones.
  [...decor].sort((a, b) => a.y - b.y).forEach((d) => drawSprite(ctx, atlas, d.sprite, d.x, d.y));
}

/** Compose the full static hall. Throws if a referenced sprite is missing. */
export function composeDungeonHallCanvas(atlas: DungeonAtlas): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = HALL_WIDTH;
  canvas.height = HALL_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");
  ctx.imageSmoothingEnabled = false;

  const rand = mulberry32(0x6a11d);
  paintBackWall(ctx, atlas, rand);
  paintFloor(ctx, atlas, rand);
  paintCarpet(ctx);
  paintSideWalls(ctx, atlas);
  paintDecor(ctx, atlas, HALL_WALL_DECOR);
  paintDecor(ctx, atlas, HALL_FLOOR_DECOR);
  return canvas;
}
