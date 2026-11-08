/**
 * Pixel camera math (pure functions, no DOM / Pixi).
 *
 * Zoom is an integer number of DEVICE pixels per source-art pixel
 * ("pixel zoom"). The world is drawn at DUNGEON_SCALE world px per art pixel,
 * so the world container scale in CSS px is pixelZoom / (DUNGEON_SCALE * dpr).
 * Keeping pixel zoom integer means every art pixel covers the same number of
 * device pixels: no blurry or uneven pixels, at any devicePixelRatio.
 *
 * The camera stores the world point shown at the viewport centre.
 */
import { DUNGEON_SCALE } from "@/dungeon/dungeon-hall-layout";
import type { WorldRect } from "@/dungeon/dungeon-world-layout";

export const MIN_PIXEL_ZOOM = 1;
/** Max zoom on a 1x screen; hi-DPI screens get proportionally more device px. */
export const MAX_PIXEL_ZOOM = 6;

/** Max pixel zoom for a device pixel ratio (same max CSS scale at any dpr). */
export function maxPixelZoom(dpr: number): number {
  return MAX_PIXEL_ZOOM * Math.max(1, Math.ceil(dpr));
}

/** Viewport (canvas element) size in CSS pixels + device pixel ratio. */
export interface CameraViewport {
  width: number;
  height: number;
  dpr: number;
}

export interface CameraView {
  /** Device pixels per art pixel (integer). */
  pixelZoom: number;
  /** World point at the viewport centre. */
  centerX: number;
  centerY: number;
}

export interface WorldBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** Transform to apply to the world container (CSS px). */
export interface CameraTransform {
  x: number;
  y: number;
  scale: number;
}

export function clampPixelZoom(z: number, dpr = 1): number {
  return Math.min(maxPixelZoom(dpr), Math.max(MIN_PIXEL_ZOOM, Math.round(z)));
}

/** CSS px per world px for a pixel zoom. */
export function worldScale(pixelZoom: number, dpr: number): number {
  return pixelZoom / (DUNGEON_SCALE * (dpr > 0 ? dpr : 1));
}

/** Largest integer pixel zoom that shows the whole rect (at least the minimum). */
export function fitPixelZoom(rect: WorldRect, viewport: CameraViewport): number {
  const dpr = viewport.dpr > 0 ? viewport.dpr : 1;
  const byWidth = (viewport.width * dpr * DUNGEON_SCALE) / rect.width;
  const byHeight = (viewport.height * dpr * DUNGEON_SCALE) / rect.height;
  return clampPixelZoom(Math.floor(Math.min(byWidth, byHeight)), dpr);
}

/**
 * Keep the view inside the world. On an axis where the view is wider than the
 * world, the world is centred instead.
 */
export function clampView(view: CameraView, viewport: CameraViewport, bounds: WorldBounds): CameraView {
  const scale = worldScale(view.pixelZoom, viewport.dpr);
  const halfW = viewport.width / scale / 2;
  const halfH = viewport.height / scale / 2;
  const clampAxis = (c: number, min: number, max: number, half: number) =>
    max - min <= half * 2 ? (min + max) / 2 : Math.min(max - half, Math.max(min + half, c));
  return {
    pixelZoom: view.pixelZoom,
    centerX: clampAxis(view.centerX, bounds.minX, bounds.maxX, halfW),
    centerY: clampAxis(view.centerY, bounds.minY, bounds.maxY, halfH),
  };
}

/** View that frames a rect (default view = the Guild Hall). */
export function frameRect(rect: WorldRect, viewport: CameraViewport, bounds: WorldBounds): CameraView {
  return clampView(
    {
      pixelZoom: fitPixelZoom(rect, viewport),
      centerX: rect.x + rect.width / 2,
      centerY: rect.y + rect.height / 2,
    },
    viewport,
    bounds,
  );
}

/** World-container transform, offset snapped to whole device pixels. */
export function cameraTransform(view: CameraView, viewport: CameraViewport): CameraTransform {
  const dpr = viewport.dpr > 0 ? viewport.dpr : 1;
  const scale = worldScale(view.pixelZoom, dpr);
  const snap = (v: number) => Math.round(v * dpr) / dpr;
  return {
    x: snap(viewport.width / 2 - view.centerX * scale),
    y: snap(viewport.height / 2 - view.centerY * scale),
    scale,
  };
}

/** World point → CSS px relative to the canvas element's top-left. */
export function worldToScreen(
  point: { x: number; y: number },
  view: CameraView,
  viewport: CameraViewport,
): { x: number; y: number } {
  const t = cameraTransform(view, viewport);
  return { x: t.x + point.x * t.scale, y: t.y + point.y * t.scale };
}

/** CSS px relative to the canvas element → world point. */
export function screenToWorld(
  point: { x: number; y: number },
  view: CameraView,
  viewport: CameraViewport,
): { x: number; y: number } {
  const t = cameraTransform(view, viewport);
  return { x: (point.x - t.x) / t.scale, y: (point.y - t.y) / t.scale };
}

/** Change zoom while keeping the world point under `anchor` (CSS px) fixed. */
export function zoomAt(
  view: CameraView,
  viewport: CameraViewport,
  bounds: WorldBounds,
  pixelZoom: number,
  anchor: { x: number; y: number },
): CameraView {
  const nextZoom = clampPixelZoom(pixelZoom, viewport.dpr);
  if (nextZoom === view.pixelZoom) return view;
  const world = screenToWorld(anchor, view, viewport);
  const scale = worldScale(nextZoom, viewport.dpr);
  return clampView(
    {
      pixelZoom: nextZoom,
      centerX: world.x - (anchor.x - viewport.width / 2) / scale,
      centerY: world.y - (anchor.y - viewport.height / 2) / scale,
    },
    viewport,
    bounds,
  );
}

/** Move the view by a screen-space drag (CSS px). */
export function panBy(
  view: CameraView,
  viewport: CameraViewport,
  bounds: WorldBounds,
  dx: number,
  dy: number,
): CameraView {
  const scale = worldScale(view.pixelZoom, viewport.dpr);
  return clampView(
    { pixelZoom: view.pixelZoom, centerX: view.centerX - dx / scale, centerY: view.centerY - dy / scale },
    viewport,
    bounds,
  );
}
