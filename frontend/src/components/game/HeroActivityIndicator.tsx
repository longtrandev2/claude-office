/**
 * HeroActivityIndicator
 *
 * Above a hero: a small pixel icon for the tool it is using right now
 * (book = Read, magnifier = Grep/Glob, quill = Edit/Write, rune = Bash,
 * orb = Web, scroll = Task). At its table while it is actively working:
 * a few sparks of the tool's colour rising — only while a tool is in use,
 * so every effect corresponds to real activity.
 *
 * Sparks animate imperatively in the Pixi ticker; hidden under reduced motion.
 */
import { memo, useCallback, useMemo, useRef, type ReactNode } from "react";
import { useTick } from "@pixi/react";
import type { Graphics } from "pixi.js";
import { DUNGEON_SCALE } from "@/dungeon/dungeon-hall-layout";
import { TOOL_COLORS, TOOL_ICON_BITMAPS, type ToolCategory } from "@/dungeon/tool-activity";

interface HeroActivityIndicatorProps {
  category: ToolCategory | null;
  /** True while the hero is actively using tools (sparks on). */
  working: boolean;
  /** Icon centre height above the hero origin. */
  iconY: number;
  /** Where sparks start (table top), relative to the hero origin. */
  sparkY: number;
}

const PX = DUNGEON_SCALE;
const SPARKS = 5;
const SPARK_LIFE_MS = 750;
const SPARK_RISE = 26;

function drawIcon(g: Graphics, category: ToolCategory): void {
  g.clear();
  const rows = TOOL_ICON_BITMAPS[category];
  const size = rows.length * PX;
  // Dark plate so the icon reads on stone, parchment and carpet alike.
  g.rect(-size / 2 - PX, -size / 2 - PX, size + 2 * PX, size + 2 * PX);
  g.fill({ color: 0x140d18, alpha: 0.85 });
  rows.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === "#") {
        g.rect(-size / 2 + x * PX, -size / 2 + y * PX, PX, PX);
        g.fill(TOOL_COLORS[category]);
      }
    });
  });
}

function HeroActivityIndicatorComponent({ category, working, iconY, sparkY }: HeroActivityIndicatorProps): ReactNode {
  const sparksRef = useRef<Graphics | null>(null);
  const elapsed = useRef(0);
  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useTick((ticker) => {
    const g = sparksRef.current;
    if (!g) return;
    g.clear();
    if (!working || !category || reduceMotion) return;
    elapsed.current += ticker.deltaMS;
    for (let i = 0; i < SPARKS; i++) {
      // Staggered life cycle per spark; x spread is fixed per spark index.
      const t = ((elapsed.current + (i * SPARK_LIFE_MS) / SPARKS) % SPARK_LIFE_MS) / SPARK_LIFE_MS;
      const x = Math.round(((i * 37) % 31) - 15);
      const y = Math.round(sparkY - t * SPARK_RISE);
      g.rect(Math.round(x / PX) * PX, Math.round(y / PX) * PX, PX, PX);
      g.fill({ color: TOOL_COLORS[category], alpha: 1 - t });
    }
  });

  const draw = useCallback((g: Graphics) => category && drawIcon(g, category), [category]);

  return (
    <>
      <pixiGraphics ref={sparksRef} draw={() => {}} blendMode="add" />
      {category && <pixiGraphics y={iconY} draw={draw} />}
    </>
  );
}

export const HeroActivityIndicator = memo(HeroActivityIndicatorComponent);
