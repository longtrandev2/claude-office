/**
 * SafetySign → Tavern tally board
 *
 * A wooden plank on the hall wall counting tool uses ("spells cast") since the
 * last context compaction ("the last rest"). Same data as the original office
 * safety sign; dungeon look, localized, no emoji.
 */

"use client";

import { useCallback, type ReactNode } from "react";
import type { Graphics } from "pixi.js";
import { useGameStore, selectToolUsesSinceCompaction } from "@/stores/gameStore";
import { useTranslation } from "@/hooks/useTranslation";

const W = 140;
const H = 100;
const WOOD = 0x5a3a22;
const WOOD_DARK = 0x3d2616;
const WOOD_LIGHT = 0x7a5233;
const NAIL = 0xb8b0a0;
const PLANK_H = 25;

export function SafetySign(): ReactNode {
  const { t } = useTranslation();
  const toolUsesSinceCompaction = useGameStore(selectToolUsesSinceCompaction);

  const drawBoard = useCallback((g: Graphics) => {
    g.clear();
    // Four horizontal planks with dark seams and a lit top edge.
    for (let i = 0; i < H / PLANK_H; i++) {
      const y = i * PLANK_H;
      g.rect(0, y, W, PLANK_H);
      g.fill(WOOD);
      g.rect(0, y, W, 3);
      g.fill(WOOD_LIGHT);
      g.rect(0, y + PLANK_H - 3, W, 3);
      g.fill(WOOD_DARK);
    }
    // Frame and corner nails.
    g.rect(0, 0, W, H);
    g.stroke({ width: 3, color: WOOD_DARK });
    for (const [x, y] of [[6, 6], [W - 9, 6], [6, H - 9], [W - 9, H - 9]]) {
      g.rect(x, y, 3, 3);
      g.fill(NAIL);
    }
  }, []);

  const text = (value: string, y: number, size: number, fill: string) => (
    <pixiContainer x={W / 2} y={y} scale={0.5}>
      <pixiText
        text={value}
        anchor={0.5}
        style={{
          fontFamily: '"Courier New", monospace',
          fontSize: size,
          fontWeight: "bold",
          fill,
          stroke: { width: 4, color: "#1f130a" },
        }}
        resolution={2}
      />
    </pixiContainer>
  );

  return (
    <pixiContainer>
      <pixiGraphics draw={drawBoard} />
      {text(t("hall.tally.title"), 18, 20, "#f1e3c2")}
      {text(String(toolUsesSinceCompaction), 50, 56, "#f2b442")}
      {text(t("hall.tally.subtitle"), 82, 17, "#d9c9a3")}
    </pixiContainer>
  );
}
