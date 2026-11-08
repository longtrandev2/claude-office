/**
 * Camera store for the AgentDungeon world view.
 *
 * Holds the viewport (canvas element size), the current camera view (integer
 * pixel zoom + centre) and the canvas element so DOM overlays and click
 * handlers can convert world positions to screen positions.
 *
 * Until the user zooms or pans, the view keeps framing the Guild Hall (or the
 * room jumped to with the arrow keys) on every resize; after a free zoom/pan it
 * only re-clamps.
 */
import { create } from "zustand";
import {
  clampView,
  frameRect,
  panBy,
  screenToWorld,
  worldToScreen,
  zoomAt,
  type CameraView,
  type CameraViewport,
} from "@/systems/pixelCamera";
import { WORLD_BOUNDS, type ZoneId } from "@/dungeon/dungeon-world-layout";
import { neighborZone, zoneAt, zoneById, type ZoneDirection } from "@/dungeon/world-zone-navigation";

/** A pointer release within this long after a drag is not a click. */
const DRAG_TAP_GUARD_MS = 150;
/** Lowest zoom used when jumping to a room (per 1x device pixel ratio). */
const ROOM_MIN_PIXEL_ZOOM = 2;

interface CameraStore {
  viewport: CameraViewport | null;
  view: CameraView | null;
  userMoved: boolean;
  /** Room the camera is framing (null after a free zoom/pan). */
  focusZoneId: ZoneId | null;
  lastDragAt: number;
  /** A drag-pan is in progress (cleared just after the pointer is released). */
  dragging: boolean;
  element: HTMLElement | null;

  setElement: (el: HTMLElement | null) => void;
  setViewport: (viewport: CameraViewport) => void;
  /** Zoom by whole steps around an anchor (CSS px in the canvas; default centre). */
  zoomStep: (delta: number, anchor?: { x: number; y: number }) => void;
  /** Pan by a screen-space drag (CSS px). */
  pan: (dx: number, dy: number) => void;
  /** Back to the default view (frame the Guild Hall). */
  reset: () => void;
  /** Frame one room. */
  goToZone: (id: ZoneId) => void;
  /** Jump to the neighbouring room in a direction (arrow keys). */
  stepZone: (direction: ZoneDirection) => void;
  setDragging: (dragging: boolean) => void;
}

export const useCameraStore = create<CameraStore>((set, get) => ({
  viewport: null,
  view: null,
  userMoved: false,
  focusZoneId: "guild-hall",
  lastDragAt: 0,
  dragging: false,
  element: null,

  setElement: (element) => set({ element }),

  setViewport: (viewport) => {
    const { view, userMoved, focusZoneId } = get();
    const next =
      view && userMoved && !focusZoneId
        ? clampView(view, viewport, WORLD_BOUNDS)
        : frameRect(zoneById(focusZoneId ?? "guild-hall").rect, viewport, WORLD_BOUNDS);
    set({ viewport, view: next });
  },

  zoomStep: (delta, anchor) => {
    const { view, viewport } = get();
    if (!view || !viewport) return;
    const at = anchor ?? { x: viewport.width / 2, y: viewport.height / 2 };
    const next = zoomAt(view, viewport, WORLD_BOUNDS, view.pixelZoom + delta, at);
    if (next !== view) set({ view: next, userMoved: true, focusZoneId: null });
  },

  pan: (dx, dy) => {
    const { view, viewport } = get();
    if (!view || !viewport) return;
    set({ view: panBy(view, viewport, WORLD_BOUNDS, dx, dy), userMoved: true, focusZoneId: null });
  },

  reset: () => {
    const { viewport } = get();
    if (!viewport) return;
    set({ view: frameRect(zoneById("guild-hall").rect, viewport, WORLD_BOUNDS), userMoved: false, focusZoneId: "guild-hall" });
  },

  goToZone: (id) => {
    const { viewport } = get();
    if (!viewport) return;
    const rect = zoneById(id).rect;
    const framed = frameRect(rect, viewport, WORLD_BOUNDS);
    // Wide rooms (the dungeon) would fit only at 1x and show the whole map;
    // keep at least ROOM_MIN_PIXEL_ZOOM and centre on the room instead.
    const minZoom = Math.max(1, Math.round(ROOM_MIN_PIXEL_ZOOM * viewport.dpr));
    const view =
      framed.pixelZoom >= minZoom
        ? framed
        : clampView(
            { pixelZoom: minZoom, centerX: rect.x + rect.width / 2, centerY: rect.y + rect.height / 2 },
            viewport,
            WORLD_BOUNDS,
          );
    set({ view, userMoved: true, focusZoneId: id });
  },

  stepZone: (direction) => {
    const { view, viewport, focusZoneId, goToZone } = get();
    if (!view || !viewport) return;
    // After a free pan, start from the room under the screen centre.
    const next = neighborZone(currentZoneId({ view, viewport, focusZoneId }) ?? "guild-hall", direction);
    if (next) goToZone(next.id);
  },

  setDragging: (dragging) => set({ dragging, lastDragAt: Date.now() }),
}));

/** Room the camera is on: the framed room, else the room under the screen centre. */
export function currentZoneId(state: {
  view: CameraView | null;
  viewport: CameraViewport | null;
  focusZoneId: ZoneId | null;
}): ZoneId | null {
  const { view, viewport, focusZoneId } = state;
  if (focusZoneId) return focusZoneId;
  if (!view || !viewport) return null;
  return zoneAt(screenToWorld({ x: viewport.width / 2, y: viewport.height / 2 }, view, viewport)).id;
}

/** True right after a drag-pan, so the pointer release is not read as a click. */
export function cameraJustDragged(): boolean {
  const { dragging, lastDragAt } = useCameraStore.getState();
  return dragging || Date.now() - lastDragAt < DRAG_TAP_GUARD_MS;
}

/** World point → viewport (client) coordinates, or null before the canvas mounts. */
export function worldToClient(point: { x: number; y: number }): { x: number; y: number } | null {
  const { view, viewport, element } = useCameraStore.getState();
  if (!view || !viewport || !element) return null;
  const rect = element.getBoundingClientRect();
  const s = worldToScreen(point, view, viewport);
  return { x: rect.left + s.x, y: rect.top + s.y };
}
