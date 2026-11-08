/**
 * Shared painting helpers for baked dungeon rooms (Guild Hall and the task
 * zones around it). Every room is drawn on an offscreen canvas at one integer
 * pixel scale (DUNGEON_SCALE) with smoothing off, so all rooms share the same
 * pixel size and palette.
 *
 * A room is described by its size and back-wall height; coordinates passed to
 * these helpers are room-local (0,0 = the room's top-left corner).
 */
import type { DungeonAtlas } from "./dungeon-atlas";
import { DUNGEON_SCALE, HALL_TILE } from "./dungeon-hall-layout";

export type Ctx = CanvasRenderingContext2D;

/** Size of a baked room, in canvas pixels. */
export interface RoomShape {
  width: number;
  height: number;
  /** Height of the back wall (floor starts below it). */
  wallHeight: number;
}

/** A light pool in room-local coordinates (no source, no light). */
export interface RoomLight {
  x: number;
  y: number;
  radius: number;
}

/** A decoration placed at room-local position (top-left), drawn at DUNGEON_SCALE. */
export interface RoomDecor {
  sprite: string;
  x: number;
  y: number;
}

const FLOOR_VARIANTS = ["floor_2", "floor_3", "floor_4", "floor_5", "floor_6", "floor_7", "floor_8"];
const WALL_DAMAGE = ["wall_hole_1", "wall_hole_2"];
/** Stepped darkness per brick row going up the wall (reads as a deep ceiling). */
const WALL_ROW_SHADE = [0, 0.12, 0.26, 0.42, 0.58, 0.72];
const WALL_FOOT_SHADOW = "rgba(0, 0, 0, 0.38)";

/** Small deterministic PRNG so a room looks identical on every load. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Create an offscreen canvas for a room, smoothing off. */
export function createRoomCanvas(room: RoomShape): { canvas: HTMLCanvasElement; ctx: Ctx } {
  const canvas = document.createElement("canvas");
  canvas.width = room.width;
  canvas.height = room.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

/** Draw an atlas frame or a "prop:" image at (x, y), scaled by DUNGEON_SCALE. */
export function drawSprite(ctx: Ctx, atlas: DungeonAtlas, name: string, x: number, y: number): void {
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

/** Brick rows stacked upward from the wall foot; the top row may be cut off. */
export function paintBackWall(
  ctx: Ctx,
  atlas: DungeonAtlas,
  rand: () => number,
  room: RoomShape,
  damageChance: number,
): void {
  for (let row = 0, y = room.wallHeight - HALL_TILE; y > -HALL_TILE; row++, y -= HALL_TILE) {
    for (let x = 0; x < room.width; x += HALL_TILE) {
      const damaged = row > 0 && rand() < damageChance;
      drawSprite(ctx, atlas, damaged ? WALL_DAMAGE[Math.floor(rand() * WALL_DAMAGE.length)] : "wall_mid", x, y);
    }
    const shade = WALL_ROW_SHADE[Math.min(row, WALL_ROW_SHADE.length - 1)];
    if (shade > 0) {
      ctx.fillStyle = `rgba(6, 4, 12, ${shade})`;
      ctx.fillRect(0, y, room.width, HALL_TILE);
    }
  }
}

/** Stone floor below the wall, with a few cracked variants. */
export function paintFloor(
  ctx: Ctx,
  atlas: DungeonAtlas,
  rand: () => number,
  room: RoomShape,
  variantChance: number,
): void {
  for (let y = room.wallHeight; y < room.height; y += HALL_TILE) {
    for (let x = 0; x < room.width; x += HALL_TILE) {
      const name = rand() < variantChance
        ? FLOOR_VARIANTS[Math.floor(rand() * FLOOR_VARIANTS.length)]
        : "floor_1";
      drawSprite(ctx, atlas, name, x, y);
    }
  }
  // Contact shadow where the floor meets the wall.
  ctx.fillStyle = WALL_FOOT_SHADOW;
  ctx.fillRect(0, room.wallHeight, room.width, 2 * DUNGEON_SCALE);
}

/** One-tile wall edges down both sides of the floor. */
export function paintSideWalls(ctx: Ctx, atlas: DungeonAtlas, room: RoomShape): void {
  for (let y = room.wallHeight; y < room.height; y += HALL_TILE) {
    drawSprite(ctx, atlas, "wall_edge_left", 0, y);
    drawSprite(ctx, atlas, "wall_edge_right", room.width - HALL_TILE, y);
  }
}

/** A rug or runner painted in whole source pixels (cloth, not a sprite). */
export interface RoomRug {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  edgeColor: string;
  trimColor: string;
}

/** Rug with a dark edge, a trim line one source pixel inside, and woven bands. */
export function paintRug(ctx: Ctx, rug: RoomRug): void {
  const px = DUNGEON_SCALE;
  ctx.fillStyle = rug.edgeColor;
  ctx.fillRect(rug.x, rug.y, rug.width, rug.height);
  ctx.fillStyle = rug.color;
  ctx.fillRect(rug.x + px, rug.y, rug.width - 2 * px, rug.height);
  ctx.fillStyle = rug.trimColor;
  ctx.fillRect(rug.x + 2 * px, rug.y, px, rug.height);
  ctx.fillRect(rug.x + rug.width - 3 * px, rug.y, px, rug.height);
  // Faint woven bands every two tiles so the rug reads as cloth, not paint.
  ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
  for (let y = rug.y + HALL_TILE; y < rug.y + rug.height; y += 2 * HALL_TILE) {
    ctx.fillRect(rug.x + 3 * px, y, rug.width - 6 * px, px);
  }
}

/** Book spine colours, sampled from the 0x72 wall banners (same palette). */
const BOOK_COLORS = ["#9f294e", "#5956bd", "#3d734f", "#ee8e2e", "#da4e38", "#5698cc"];
/** Dark compartments of the three-tier-shelf prop (source px): rows + x range. */
const SHELF_COMPARTMENTS = [
  { top: 8, bottom: 14 },
  { top: 21, bottom: 26 },
];
const SHELF_INNER = { left: 4, right: 47 };

/**
 * Fill the empty compartments of a "prop:three-tier-shelf" at (x, y) with book
 * spines: 2 source px wide, varied height, standing on the shelf board, with
 * the odd gap or leaning book so rows don't look stamped.
 */
export function paintShelfBooks(ctx: Ctx, x: number, y: number, rand: () => number): void {
  const px = DUNGEON_SCALE;
  for (const c of SHELF_COMPARTMENTS) {
    const maxH = c.bottom - c.top;
    for (let bx = SHELF_INNER.left; bx + 2 <= SHELF_INNER.right; ) {
      if (rand() < 0.12) {
        bx += 2; // gap
        continue;
      }
      const h = maxH - Math.floor(rand() * 3);
      ctx.fillStyle = BOOK_COLORS[Math.floor(rand() * BOOK_COLORS.length)];
      ctx.fillRect(x + bx * px, y + (c.bottom - h) * px, 2 * px, h * px);
      // Spine band one source pixel below the top.
      ctx.fillStyle = "rgba(255, 220, 150, 0.35)";
      ctx.fillRect(x + bx * px, y + (c.bottom - h + 1) * px, 2 * px, px);
      bx += 2 + (rand() < 0.2 ? 1 : 0);
    }
  }
}

/** A two-tile opening in a side wall; y = top of the gap (on a wall tile row). */
export interface RoomDoorway {
  side: "left" | "right";
  y: number;
}

/** Replace side-wall edge tiles with floor so the wall reads as open. */
export function paintDoorways(ctx: Ctx, atlas: DungeonAtlas, room: RoomShape, doorways: RoomDoorway[]): void {
  for (const d of doorways) {
    const x = d.side === "left" ? 0 : room.width - HALL_TILE;
    for (let row = 0; row < 2; row++) drawSprite(ctx, atlas, "floor_1", x, d.y + row * HALL_TILE);
  }
}

/** Stairs cut down through the back wall (from the room above) onto the floor. */
export function paintStairwell(ctx: Ctx, atlas: DungeonAtlas, room: RoomShape, x: number): void {
  for (let y = 0; y < room.wallHeight + HALL_TILE; y += HALL_TILE) drawSprite(ctx, atlas, "floor_stairs", x, y);
  // Side shadows so the shaft reads as cut into the wall.
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(x - DUNGEON_SCALE, 0, DUNGEON_SCALE, room.wallHeight);
  ctx.fillRect(x + HALL_TILE, 0, DUNGEON_SCALE, room.wallHeight);
}

/** Draw decoration top-to-bottom so lower (nearer) items overlap higher ones. */
export function paintDecor(ctx: Ctx, atlas: DungeonAtlas, decor: RoomDecor[]): void {
  [...decor].sort((a, b) => a.y - b.y).forEach((d) => drawSprite(ctx, atlas, d.sprite, d.x, d.y));
}

/** Stepped edge vignette bands (px from edge → extra darkness). */
const EDGE_VIGNETTE = [
  { inset: 0, alpha: 0.18 },
  { inset: 2 * HALL_TILE, alpha: 0.1 },
];
/** Lit-zone cut-out steps: radius fraction → how much darkness is removed. */
const LIT_ZONE_STEPS = [
  { r: 1, cut: 0.3 },
  { r: 0.7, cut: 0.35 },
  { r: 0.45, cut: 0.45 },
];

/**
 * Ambient darkness baked into a room (not over the heroes, so they stay
 * readable). Lit zones around each real light source are cut out in hard
 * steps, and the room edges get a stepped vignette.
 *
 * @param litZoneFactor how far beyond a light's radius its lit zone reaches
 */
export function paintAmbientDarkness(
  ctx: Ctx,
  room: RoomShape,
  darkness: string,
  lights: RoomLight[],
  litZoneFactor: number,
): void {
  const shade = document.createElement("canvas");
  shade.width = room.width;
  shade.height = room.height;
  const s = shade.getContext("2d");
  if (!s) return;
  s.fillStyle = darkness;
  s.fillRect(0, 0, room.width, room.height);
  for (const band of EDGE_VIGNETTE) {
    const w = HALL_TILE + band.inset;
    s.fillStyle = `rgba(4, 2, 10, ${band.alpha})`;
    s.fillRect(0, 0, w, room.height);
    s.fillRect(room.width - w, 0, w, room.height);
    s.fillRect(0, room.height - w, room.width, w);
  }
  s.globalCompositeOperation = "destination-out";
  for (const light of lights) {
    for (const step of LIT_ZONE_STEPS) {
      const r = Math.round((light.radius * litZoneFactor * step.r) / DUNGEON_SCALE) * DUNGEON_SCALE;
      s.fillStyle = `rgba(0, 0, 0, ${step.cut})`;
      s.beginPath();
      s.arc(light.x, light.y, r, 0, Math.PI * 2);
      s.fill();
    }
  }
  ctx.drawImage(shade, 0, 0);
}
