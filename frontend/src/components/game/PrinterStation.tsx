/**
 * PrinterStation → Scribe's desk
 *
 * The engine "prints a report" when the main agent finishes work that
 * produced a document. Here that becomes a scribe's desk (wooden table, ink
 * and quill) where a parchment scroll unrolls upward as the report is written,
 * its ink lines appearing as it opens. Same trigger and timing as the printer.
 */

import { type ReactNode, useCallback, useEffect, useState } from "react";
import type { Graphics, Texture } from "pixi.js";
import { loadDungeonAtlas } from "@/dungeon/dungeon-atlas";
import { getDungeonTexture } from "@/dungeon/dungeon-pixi-textures";
import { DUNGEON_SCALE } from "@/dungeon/dungeon-hall-layout";

interface PrinterStationProps {
  /** X position of the station */
  x: number;
  /** Y position of the station */
  y: number;
  /** Whether a report is being written */
  isPrinting: boolean;
  /** Unused since the dungeon reskin (kept for the engine's call site). */
  deskTexture: Texture | null;
  /** Unused since the dungeon reskin (kept for the engine's call site). */
  printerTexture: Texture | null;
}

const PX = DUNGEON_SCALE;
const SCROLL_W = 10 * PX;
const SCROLL_MAX_H = 16 * PX;
const PARCHMENT = 0xe8d5a6;
const PARCHMENT_EDGE = 0xb89a5e;
const ROLL = 0xc9ad74;
const INK = 0x3b2a1a;

/**
 * Hook to animate the print progress
 */
function usePrintAnimation(isPrinting: boolean): number {
  const [progress, setProgress] = useState(0);

  // Animate paper emerging when printing starts
  useEffect(() => {
    if (!isPrinting) {
      return;
    }

    const duration = 2000; // 2 seconds to print
    let startTime: number | null = null;
    let animationId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progressValue = Math.min(elapsed / duration, 1);
      // Ease out cubic for natural paper motion
      const eased = 1 - Math.pow(1 - progressValue, 3);
      setProgress(eased);

      if (progressValue < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPrinting]);

  // Reset progress when printing stops
  useEffect(() => {
    if (!isPrinting) {
      const id = requestAnimationFrame(() => setProgress(0));
      return () => cancelAnimationFrame(id);
    }
  }, [isPrinting]);

  return progress;
}

/** Parchment unrolled to `progress` (0..1), drawn upward from the desk top. */
function drawScroll(g: Graphics, progress: number): void {
  g.clear();
  if (progress <= 0) return;
  const h = Math.max(PX, Math.round((SCROLL_MAX_H * progress) / PX) * PX);
  const left = -SCROLL_W / 2;
  g.rect(left, -h, SCROLL_W, h);
  g.fill(PARCHMENT);
  g.rect(left, -h, PX, h);
  g.fill(PARCHMENT_EDGE);
  g.rect(left + SCROLL_W - PX, -h, PX, h);
  g.fill(PARCHMENT_EDGE);
  // Rolled ends.
  g.rect(left - PX, -h - PX, SCROLL_W + 2 * PX, 2 * PX);
  g.fill(ROLL);
  g.rect(left - PX, -PX, SCROLL_W + 2 * PX, 2 * PX);
  g.fill(ROLL);
  // Ink lines appear as the scroll opens (every other source pixel row).
  for (let y = -h + 3 * PX, i = 0; y < -2 * PX; y += 2 * PX, i++) {
    g.rect(left + 2 * PX, y, i % 3 === 2 ? 4 * PX : 6 * PX, PX);
    g.fill(INK);
  }
}

export function PrinterStation({ x, y, isPrinting }: PrinterStationProps): ReactNode {
  const progress = usePrintAnimation(isPrinting);
  const [textures, setTextures] = useState<{ desk: Texture; quill: Texture } | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadDungeonAtlas()
      .then((atlas) => {
        if (cancelled) return;
        setTextures({
          desk: getDungeonTexture(atlas, "prop:wooden-desk"),
          quill: getDungeonTexture(atlas, "prop:ink-feather"),
        });
      })
      .catch((err: unknown) => console.error("[ScribeDesk] atlas load failed:", err));
    return () => {
      cancelled = true;
    };
  }, []);

  const draw = useCallback((g: Graphics) => drawScroll(g, progress), [progress]);
  if (!textures) return null;

  // Nudged right so the table clears the side wall; nav obstacle unchanged.
  return (
    <pixiContainer x={x + 24} y={y}>
      <pixiSprite texture={textures.desk} anchor={{ x: 0.5, y: 0 }} y={-12} scale={PX} />
      <pixiSprite texture={textures.quill} anchor={{ x: 0.5, y: 1 }} x={30} y={0} scale={PX} />
      <pixiContainer x={-8} y={-6}>
        <pixiGraphics draw={draw} />
      </pixiContainer>
    </pixiContainer>
  );
}
