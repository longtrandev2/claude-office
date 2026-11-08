/**
 * Wires the pixel camera to the game canvas box:
 * - ResizeObserver → resize the Pixi renderer to the box + update the viewport
 *   (Pixi's own resizeTo only listens to window resizes, not panel toggles)
 * - wheel → whole zoom steps around the cursor
 * - drag (left or middle button) → pan; double-click → reset view
 * - keys: + / - zoom, Home reset, arrows jump to the neighbouring room — only
 *   when focus is on the page
 *   body or the scene, never while typing or in dialogs
 * Pointer input only counts when it starts on the canvas (not on overlaid
 * buttons such as ZoomControls).
 */
import { useEffect, type RefObject } from "react";
import type { Application } from "pixi.js";
import { useCameraStore } from "@/stores/cameraStore";

/** Wheel delta needed for one zoom step (trackpads send many small deltas). */
const WHEEL_STEP_DELTA = 40;
/** Minimum time between wheel zoom steps. */
const WHEEL_STEP_MS = 90;
/** Pointer travel before a press becomes a drag (CSS px). */
const DRAG_THRESHOLD = 4;
/** Give up waiting for the renderer after this many polls (e.g. WebGL failed). */
const INIT_POLL_LIMIT = 50;

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

export function usePixelCameraInput(
  containerRef: RefObject<HTMLDivElement | null>,
  appRef: RefObject<Application | null>,
): void {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const camera = useCameraStore.getState();
    camera.setElement(el);

    const syncSize = () => {
      const width = Math.max(1, Math.floor(el.clientWidth));
      const height = Math.max(1, Math.floor(el.clientHeight));
      const app = appRef.current;
      // Use the renderer's resolution so camera math matches the backbuffer.
      const dpr = app?.renderer?.resolution ?? window.devicePixelRatio ?? 1;
      app?.renderer?.resize(width, height);
      useCameraStore.getState().setViewport({ width, height, dpr });
    };
    syncSize();
    const observer = new ResizeObserver(syncSize);
    observer.observe(el);
    // The renderer may not exist on the first sync; retry once it does.
    let polls = 0;
    const initPoll = window.setInterval(() => {
      polls++;
      if (appRef.current?.renderer) syncSize();
      if (appRef.current?.renderer || polls >= INIT_POLL_LIMIT) window.clearInterval(initPoll);
    }, 100);
    const onCanvas = (e: Event) => e.target instanceof HTMLCanvasElement;

    let wheelAcc = 0;
    let lastWheelStep = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelAcc += e.deltaY;
      const now = performance.now();
      if (Math.abs(wheelAcc) < WHEEL_STEP_DELTA || now - lastWheelStep < WHEEL_STEP_MS) return;
      const rect = el.getBoundingClientRect();
      useCameraStore.getState().zoomStep(wheelAcc < 0 ? 1 : -1, {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      wheelAcc = 0;
      lastWheelStep = now;
    };

    let press: { x: number; y: number; dragging: boolean } | null = null;
    const onPointerDown = (e: PointerEvent) => {
      if ((e.button !== 0 && e.button !== 1) || !onCanvas(e)) return;
      if (e.button === 1) e.preventDefault(); // no browser autoscroll on middle press
      press = { x: e.clientX, y: e.clientY, dragging: false };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!press) return;
      const dx = e.clientX - press.x;
      const dy = e.clientY - press.y;
      if (!press.dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      if (!press.dragging) useCameraStore.getState().setDragging(true);
      press.dragging = true;
      press.x = e.clientX;
      press.y = e.clientY;
      useCameraStore.getState().pan(dx, dy);
    };
    const onPointerUp = () => {
      // Keep "dragging" through this release so Pixi's tap on the same
      // pointerup is ignored; clear it right after.
      if (press?.dragging) window.setTimeout(() => useCameraStore.getState().setDragging(false), 0);
      press = null;
    };
    const onDoubleClick = (e: MouseEvent) => {
      if (onCanvas(e)) useCameraStore.getState().reset();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
      if (document.querySelector("[role='dialog'][aria-modal='true']")) return;
      // Leave keys to focused panels/buttons (sidebar scrolling, menus).
      const target = e.target as Node | null;
      if (target && target !== document.body && !el.contains(target)) return;
      const cam = useCameraStore.getState();
      const actions: Record<string, () => void> = {
        "+": () => cam.zoomStep(1),
        "=": () => cam.zoomStep(1),
        "-": () => cam.zoomStep(-1),
        Home: () => cam.reset(),
        ArrowLeft: () => cam.stepZone("left"),
        ArrowRight: () => cam.stepZone("right"),
        ArrowUp: () => cam.stepZone("up"),
        ArrowDown: () => cam.stepZone("down"),
      };
      const action = actions[e.key];
      if (!action) return;
      e.preventDefault();
      action();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("dblclick", onDoubleClick);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      observer.disconnect();
      window.clearInterval(initPoll);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("dblclick", onDoubleClick);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
      useCameraStore.getState().setElement(null);
    };
  }, [containerRef, appRef]);
}
