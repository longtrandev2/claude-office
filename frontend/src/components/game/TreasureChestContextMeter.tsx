/**
 * TreasureChestContextMeter
 *
 * The guild chest beside the war table shows how full the main agent's
 * context window is (replaces the office trash can):
 *   < 35%  closed chest
 *   < 70%  lid ajar, gold showing
 *   ≥ 70%  wide open, full of gold
 *   ≥ 90%  coins spill onto the floor (spinning)
 * During compaction the Guild Master stomps on it (squish + shake) and the
 * fill animates back down, so the chest snaps shut.
 */
import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTick } from "@pixi/react";
import { Sprite, TextStyle, type Texture } from "pixi.js";
import { loadDungeonAtlas } from "@/dungeon/dungeon-atlas";
import { getDungeonTexture } from "@/dungeon/dungeon-pixi-textures";
import { DUNGEON_SCALE } from "@/dungeon/dungeon-hall-layout";

export interface TreasureChestContextMeterProps {
  x: number;
  y: number;
  contextUtilization: number; // 0.0 to 1.0
  isCompacting?: boolean;
  isStomping?: boolean;
}

const CHEST_FRAMES = {
  closed: "chest_empty_open_anim_f0",
  ajar: "chest_full_open_anim_f1",
  open: "chest_full_open_anim_f2",
} as const;
const COIN_FRAMES = ["coin_anim_f0", "coin_anim_f1", "coin_anim_f2", "coin_anim_f3"];
/** Spilled coins around the chest foot (offsets in px). */
const SPILL = [
  { x: -30, y: 20 },
  { x: 28, y: 22 },
  { x: -12, y: 30 },
];
const COIN_FRAME_MS = 110;

/** Percentage colour: calm → warning → critical. */
function fillColor(u: number): number {
  if (u >= 0.9) return 0xff6b4a;
  if (u >= 0.7) return 0xf2b442;
  return 0xd9c9a3;
}

function chestFrame(u: number): string {
  if (u >= 0.7) return CHEST_FRAMES.open;
  if (u >= 0.35) return CHEST_FRAMES.ajar;
  return CHEST_FRAMES.closed;
}

function TreasureChestContextMeterComponent({
  x,
  y,
  contextUtilization,
  isCompacting = false,
  isStomping = false,
}: TreasureChestContextMeterProps): ReactNode {
  const [textures, setTextures] = useState<Map<string, Texture> | null>(null);
  const coinRefs = useRef<(Sprite | null)[]>([]);
  const elapsed = useRef(0);

  useEffect(() => {
    let cancelled = false;
    loadDungeonAtlas()
      .then((atlas) => {
        if (cancelled) return;
        const names = [...Object.values(CHEST_FRAMES), ...COIN_FRAMES];
        setTextures(new Map(names.map((n) => [n, getDungeonTexture(atlas, n)])));
      })
      .catch((err: unknown) => console.error("[TreasureChest] atlas load failed:", err));
    return () => {
      cancelled = true;
    };
  }, []);

  const spilling = contextUtilization >= 0.9 && !isCompacting;

  useTick((ticker) => {
    if (!textures || !spilling) return;
    elapsed.current += ticker.deltaMS;
    coinRefs.current.forEach((sprite, i) => {
      if (!sprite) return;
      const frame = COIN_FRAMES[(Math.floor(elapsed.current / COIN_FRAME_MS) + i) % COIN_FRAMES.length];
      const tex = textures.get(frame);
      if (tex && sprite.texture !== tex) sprite.texture = tex;
    });
  });

  // Squish + deterministic shake while the Guild Master stomps on the chest.
  const squish = isStomping ? { x: 1.15, y: 0.85 } : { x: 1, y: 1 };
  const seed = contextUtilization * 12345;
  const shakeX = isStomping ? (seed % 400) / 100 - 2 : 0;
  const shakeRot = isStomping ? ((seed * 7) % 100) / 1000 - 0.05 : 0;

  const percentStyle = useMemo(
    () =>
      new TextStyle({
        fontFamily: "monospace",
        fontSize: 22,
        fontWeight: "bold",
        fill: fillColor(contextUtilization),
        align: "center",
        stroke: { width: 4, color: 0x000000 },
      }),
    [contextUtilization],
  );
  const labelStyle = useMemo(
    () =>
      new TextStyle({
        fontFamily: "monospace",
        fontSize: 16,
        fill: isCompacting ? 0xff6b4a : 0x9a8f7a,
        align: "center",
        stroke: { width: 3, color: 0x000000 },
      }),
    [isCompacting],
  );

  if (!textures) return null;
  const percentage = Math.round(contextUtilization * 100);

  return (
    <pixiContainer x={x + shakeX} y={y} rotation={shakeRot} scale={squish}>
      <pixiSprite
        texture={textures.get(chestFrame(contextUtilization))!}
        anchor={0.5}
        scale={DUNGEON_SCALE}
      />
      {spilling &&
        SPILL.map((c, i) => (
          <pixiSprite
            key={i}
            ref={(el: Sprite | null) => {
              coinRefs.current[i] = el;
            }}
            texture={textures.get(COIN_FRAMES[0])!}
            anchor={0.5}
            x={c.x}
            y={c.y}
            scale={DUNGEON_SCALE}
          />
        ))}
      <pixiText text={`${percentage}%`} anchor={0.5} y={38} scale={0.5} style={percentStyle} />
      <pixiText
        text={isCompacting ? "compacting..." : "context"}
        anchor={0.5}
        y={47}
        scale={0.5}
        style={labelStyle}
      />
    </pixiContainer>
  );
}

export const TreasureChestContextMeter = memo(TreasureChestContextMeterComponent);
