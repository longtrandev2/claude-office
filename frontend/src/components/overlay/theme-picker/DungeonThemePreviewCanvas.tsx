"use client";

/**
 * Live pixel preview of the Dungeon Guild theme, drawn from the real CC0
 * 0x72 tileset (same sheet the game uses) on a small canvas:
 * a guild hall wall with banners and a running fountain, and the Guild
 * Master with three adventurers breathing in their idle loop.
 *
 * Coordinates come from `tile_list_v1.7` (see scripts/build-dungeon-atlas.mjs).
 * Respects prefers-reduced-motion (draws a single still frame).
 */
import { useEffect, useRef } from "react";
import { DUNGEON_TILESET_IMAGE } from "@/themes/dungeon/dungeon-theme-manifest";

const TILE = 16;
const COLS = 12;
const ROWS = 8;
const IDLE_FRAME_MS = 140;
const FOUNTAIN_FRAME_MS = 180;

/** [x, y, w, h] source rects on the 512×512 tileset. */
type Rect = readonly [number, number, number, number];

const SPRITES = {
  wallTop: [32, 0, 16, 16],
  wallMid: [32, 16, 16, 16],
  bannerRed: [16, 32, 16, 16],
  bannerBlue: [32, 32, 16, 16],
  fountainTop: [64, 0, 16, 16],
  floors: [
    [16, 64, 16, 16],
    [32, 64, 16, 16],
    [48, 64, 16, 16],
    [16, 80, 16, 16],
    [32, 80, 16, 16],
    [48, 80, 16, 16],
    [16, 96, 16, 16],
    [32, 96, 16, 16],
  ],
  crate: [288, 408, 16, 24],
  chestClosed: [304, 416, 16, 16],
  flask: [288, 336, 16, 16],
  skull: [288, 432, 16, 16],
} as const satisfies Record<string, Rect | readonly Rect[]>;

/** Animated sprites: first frame rect + frame count (frames sit side by side). */
interface Anim {
  x: number;
  y: number;
  w: number;
  h: number;
  frames: number;
}
const FOUNTAIN_MID: Anim = { x: 64, y: 48, w: 16, h: 16, frames: 3 };
const FOUNTAIN_BASIN: Anim = { x: 64, y: 64, w: 16, h: 16, frames: 3 };

/** Heroes placed in the hall (feet position in tile units). Offsets desync the loops. */
const HEROES: { anim: Anim; col: number; row: number; offset: number }[] = [
  // Guild Master (knight) at the war table spot, centre.
  { anim: { x: 128, y: 100, w: 16, h: 28, frames: 4 }, col: 5.5, row: 4.6, offset: 0 },
  // Cartographer mage
  { anim: { x: 128, y: 132, w: 16, h: 28, frames: 4 }, col: 2.5, row: 6.2, offset: 1 },
  // Blacksmith (dwarf)
  { anim: { x: 128, y: 292, w: 16, h: 28, frames: 4 }, col: 8.4, row: 6.3, offset: 2 },
  // Scout (elf)
  { anim: { x: 128, y: 4, w: 16, h: 28, frames: 4 }, col: 9.8, row: 4.4, offset: 3 },
];

/** The wall cap tile is mostly transparent on top; crop that band away. */
const SCENE_OFFSET_Y = -12;

/** Deterministic floor variation so the preview looks the same every visit. */
function floorIndex(col: number, row: number): number {
  const n = (col * 73 + row * 151 + col * row * 7) % 29;
  return n < 25 ? 0 : 1 + (n % (SPRITES.floors.length - 1));
}

function drawScene(ctx: CanvasRenderingContext2D, sheet: HTMLImageElement, tick: number): void {
  const draw = (r: Rect, dx: number, dy: number) =>
    ctx.drawImage(sheet, r[0], r[1], r[2], r[3], Math.round(dx), Math.round(dy), r[2], r[3]);
  const drawAnim = (a: Anim, frame: number, dx: number, dy: number) =>
    draw([a.x + (frame % a.frames) * a.w, a.y, a.w, a.h], dx, dy);

  ctx.setTransform(1, 0, 0, 1, 0, SCENE_OFFSET_Y);
  ctx.clearRect(0, -SCENE_OFFSET_Y, COLS * TILE, ROWS * TILE);

  // Back wall: cap row + face row.
  for (let c = 0; c < COLS; c++) {
    draw(SPRITES.wallTop, c * TILE, 0);
    draw(SPRITES.wallMid, c * TILE, TILE);
  }
  draw(SPRITES.bannerRed, 2 * TILE, TILE);
  draw(SPRITES.bannerBlue, 9 * TILE, TILE);

  // Floor.
  for (let r = 2; r <= ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      draw(SPRITES.floors[floorIndex(c, r)], c * TILE, r * TILE);
    }
  }

  // Fountain on the back wall (top cap, running water, basin on the floor).
  const fountainFrame = Math.floor(tick / FOUNTAIN_FRAME_MS);
  draw(SPRITES.fountainTop, 5.5 * TILE, 0);
  drawAnim(FOUNTAIN_MID, fountainFrame, 5.5 * TILE, TILE);
  drawAnim(FOUNTAIN_BASIN, fountainFrame, 5.5 * TILE, 2 * TILE);

  // Props.
  draw(SPRITES.crate, 0.5 * TILE, 2.6 * TILE);
  draw(SPRITES.chestClosed, 6.8 * TILE, 4.1 * TILE);
  draw(SPRITES.flask, 3.6 * TILE, 5.7 * TILE);
  draw(SPRITES.skull, 11 * TILE, 7 * TILE);

  // Heroes, sorted by feet row so nearer ones overlap farther ones.
  const idleFrame = Math.floor(tick / IDLE_FRAME_MS);
  [...HEROES]
    .sort((a, b) => a.row - b.row)
    .forEach((h) => drawAnim(h.anim, idleFrame + h.offset, h.col * TILE, h.row * TILE - h.anim.h));
}

export default function DungeonThemePreviewCanvas({
  className,
  label,
}: {
  className?: string;
  /** Accessible description, localized by the caller. */
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.imageSmoothingEnabled = false;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sheet = new Image();
    let raf = 0;
    let stopped = false;

    const loop = (now: number) => {
      if (stopped) return;
      drawScene(ctx, sheet, now);
      raf = requestAnimationFrame(loop);
    };

    sheet.onload = () => {
      if (stopped) return;
      if (reduceMotion) drawScene(ctx, sheet, 0);
      else raf = requestAnimationFrame(loop);
    };
    sheet.src = DUNGEON_TILESET_IMAGE;

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={COLS * TILE}
      height={ROWS * TILE}
      className={className}
      style={{ imageRendering: "pixelated" }}
      role="img"
      aria-label={label}
    />
  );
}
