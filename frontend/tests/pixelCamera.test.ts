import { describe, expect, it } from "vitest";
import {
  cameraTransform,
  clampView,
  fitPixelZoom,
  frameRect,
  panBy,
  screenToWorld,
  worldScale,
  worldToScreen,
  zoomAt,
  MAX_PIXEL_ZOOM,
  maxPixelZoom,
  MIN_PIXEL_ZOOM,
  type CameraViewport,
} from "@/systems/pixelCamera";
import { HALL_RECT, WORLD_BOUNDS, WORLD_ZONES } from "@/dungeon/dungeon-world-layout";
import { HALL_HEIGHT, HALL_WIDTH } from "@/dungeon/dungeon-hall-layout";

// The user's wide screen in scene-only mode (feedback 2026-11-06).
const WIDE: CameraViewport = { width: 1917, height: 876, dpr: 1 };

describe("pixelCamera", () => {
  it("scales world px so one art pixel = pixelZoom device pixels", () => {
    expect(worldScale(3, 1)).toBe(1); // 3 world px per art px at 3 device px
    expect(worldScale(2, 1)).toBeCloseTo(2 / 3);
    expect(worldScale(4, 2)).toBeCloseTo(4 / 6);
  });

  it("fits the hall with an integer zoom", () => {
    expect(fitPixelZoom(HALL_RECT, WIDE)).toBe(2); // 683 px tall hall fits 876
    expect(fitPixelZoom(HALL_RECT, { width: 1280, height: 1024, dpr: 1 })).toBe(3);
    expect(fitPixelZoom(HALL_RECT, { width: 200, height: 200, dpr: 1 })).toBe(MIN_PIXEL_ZOOM);
    expect(fitPixelZoom(HALL_RECT, { width: 9000, height: 9000, dpr: 1 })).toBe(MAX_PIXEL_ZOOM);
    // Hi-DPI: the cap scales with dpr, so zoom-in still works above the fit level.
    expect(maxPixelZoom(2)).toBe(2 * MAX_PIXEL_ZOOM);
    expect(fitPixelZoom(HALL_RECT, { width: 1440, height: 900, dpr: 2 })).toBeLessThan(maxPixelZoom(2));
  });

  it("default view on a wide screen shows the hall and both wings", () => {
    const view = frameRect(HALL_RECT, WIDE, WORLD_BOUNDS);
    const left = screenToWorld({ x: 0, y: 0 }, view, WIDE);
    const right = screenToWorld({ x: WIDE.width, y: 0 }, view, WIDE);
    expect(left.x).toBeLessThanOrEqual(WORLD_BOUNDS.minX);
    expect(right.x).toBeGreaterThanOrEqual(WORLD_BOUNDS.maxX);
    // Hall fully visible vertically, top edge at the top of the world.
    const top = screenToWorld({ x: 0, y: 0 }, view, WIDE);
    const bottom = screenToWorld({ x: 0, y: WIDE.height }, view, WIDE);
    expect(top.y).toBeLessThanOrEqual(0);
    expect(bottom.y).toBeGreaterThanOrEqual(HALL_HEIGHT);
  });

  it("world ↔ screen round-trips", () => {
    const view = { pixelZoom: 3, centerX: 640, centerY: 512 };
    const vp = { width: 1000, height: 800, dpr: 1 };
    const p = { x: 123, y: 456 };
    const back = screenToWorld(worldToScreen(p, view, vp), view, vp);
    expect(back.x).toBeCloseTo(p.x, 0);
    expect(back.y).toBeCloseTo(p.y, 0);
  });

  it("snaps the world offset to whole device pixels", () => {
    const vp = { width: 1001, height: 777, dpr: 1.25 };
    const t = cameraTransform({ pixelZoom: 2, centerX: 333.3, centerY: 222.2 }, vp);
    expect(Number.isInteger(Math.round(t.x * 1.25 * 1e6) / 1e6)).toBe(true);
    expect(Number.isInteger(Math.round(t.y * 1.25 * 1e6) / 1e6)).toBe(true);
  });

  it("clamps the view inside the world", () => {
    const vp = { width: 800, height: 600, dpr: 1 };
    const view = clampView({ pixelZoom: 3, centerX: -99999, centerY: 99999 }, vp, WORLD_BOUNDS);
    const topLeft = screenToWorld({ x: 0, y: 0 }, view, vp);
    const bottomRight = screenToWorld({ x: vp.width, y: vp.height }, view, vp);
    expect(topLeft.x).toBeCloseTo(WORLD_BOUNDS.minX, 0);
    expect(bottomRight.y).toBeCloseTo(WORLD_BOUNDS.maxY, 0);
  });

  it("zooming keeps the point under the cursor fixed", () => {
    const vp = { width: 1200, height: 800, dpr: 1 };
    const view = { pixelZoom: 3, centerX: 640, centerY: 512 };
    const anchor = { x: 700, y: 420 };
    const before = screenToWorld(anchor, view, vp);
    const zoomed = zoomAt(view, vp, WORLD_BOUNDS, 4, anchor);
    const after = screenToWorld(anchor, zoomed, vp);
    expect(zoomed.pixelZoom).toBe(4);
    expect(after.x).toBeCloseTo(before.x, 0);
    expect(after.y).toBeCloseTo(before.y, 0);
    // Out-of-range zoom is a no-op.
    expect(zoomAt(view, vp, WORLD_BOUNDS, MAX_PIXEL_ZOOM + 5, anchor).pixelZoom).toBe(MAX_PIXEL_ZOOM);
  });

  it("dragging right moves the view left", () => {
    const vp = { width: 800, height: 600, dpr: 1 };
    const view = { pixelZoom: 3, centerX: 640, centerY: 512 };
    expect(panBy(view, vp, WORLD_BOUNDS, 100, 0).centerX).toBeCloseTo(540);
  });
});

describe("dungeon world layout", () => {
  it("keeps the Guild Hall at the world origin (engine coordinates unchanged)", () => {
    const hall = WORLD_ZONES.find((z) => z.id === "guild-hall")!;
    expect(hall.rect).toEqual({ x: 0, y: 0, width: HALL_WIDTH, height: HALL_HEIGHT });
  });

  it("no zones overlap and the world wraps every zone", () => {
    for (const { rect } of WORLD_ZONES) {
      expect(rect.x).toBeGreaterThanOrEqual(WORLD_BOUNDS.minX);
      expect(rect.x + rect.width).toBeLessThanOrEqual(WORLD_BOUNDS.maxX);
      expect(rect.y + rect.height).toBeLessThanOrEqual(WORLD_BOUNDS.maxY);
    }
    for (let i = 0; i < WORLD_ZONES.length; i++) {
      for (let j = i + 1; j < WORLD_ZONES.length; j++) {
        const a = WORLD_ZONES[i].rect;
        const b = WORLD_ZONES[j].rect;
        const overlap =
          a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
        expect(overlap, `${WORLD_ZONES[i].id} vs ${WORLD_ZONES[j].id}`).toBe(false);
      }
    }
  });
});
