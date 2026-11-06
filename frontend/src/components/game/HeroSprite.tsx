/**
 * HeroSprite
 *
 * Animated pixel hero from the 0x72 atlas, drawn with its feet on the parent
 * container's origin offset (the engine places agents by a point near their
 * feet). Plays the 4-frame idle loop when standing and the run loop while the
 * position is changing, and faces the direction of travel.
 *
 * Frames are swapped imperatively in the Pixi ticker; React only re-renders
 * when props change. Under prefers-reduced-motion the hero holds frame 0.
 */
import { type ReactNode, memo, useEffect, useMemo, useRef, useState } from "react";
import { useTick } from "@pixi/react";
import { Graphics, Sprite, Texture } from "pixi.js";
import type { Position } from "@/types";
import { loadDungeonAtlas } from "@/dungeon/dungeon-atlas";
import { getDungeonTexture } from "@/dungeon/dungeon-pixi-textures";
import { DUNGEON_SCALE } from "@/dungeon/dungeon-hall-layout";
import { hashString } from "@/dungeon/hero-class-registry";

export interface HeroSpriteProps {
  /** Atlas sprite base, e.g. "wizzard_f" (uses `<base>_idle` / `<base>_run`). */
  base: string;
  /** World position of the owner; used only to detect movement and direction. */
  position: Position;
  /** Feet offset from the owner's origin (engine origin sits above the feet). */
  feetY: number;
  /** Stable id, used to desynchronise animation phase between heroes. */
  seed: string;
}

interface HeroFrames {
  idle: Texture[];
  run: Texture[];
}

const IDLE_FRAME_MS = 150;
const RUN_FRAME_MS = 90;
/** Keep the run loop for this long after the last movement (smooths stops). */
const MOVING_HOLD_MS = 120;
const SHADOW = { rx: 15, ry: 5, alpha: 0.35 };

function HeroSpriteComponent({ base, position, feetY, seed }: HeroSpriteProps): ReactNode {
  const [frames, setFrames] = useState<HeroFrames | null>(null);
  const spriteRef = useRef<Sprite | null>(null);
  const lastPos = useRef<Position>(position);
  const facingLeft = useRef(false);
  const sinceMove = useRef(Number.POSITIVE_INFINITY);
  const elapsed = useRef(hashString(seed) % 1000);
  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    let cancelled = false;
    loadDungeonAtlas()
      .then((atlas) => {
        if (cancelled) return;
        const pick = (anim: string) =>
          (atlas.animations[`${base}_${anim}`] ?? []).map((f) => getDungeonTexture(atlas, f));
        const idle = pick("idle");
        if (idle.length === 0) throw new Error(`No idle animation for hero "${base}"`);
        const run = pick("run");
        setFrames({ idle, run: run.length > 0 ? run : idle });
      })
      .catch((err: unknown) => console.error("[HeroSprite]", err));
    return () => {
      cancelled = true;
    };
  }, [base]);

  // Latest owner position, read by the ticker (refs are not touched in render).
  const posRef = useRef<Position>(position);
  useEffect(() => {
    posRef.current = position;
  }, [position]);

  useTick((ticker) => {
    const sprite = spriteRef.current;
    if (!sprite || !frames) return;
    elapsed.current += ticker.deltaMS;
    sinceMove.current += ticker.deltaMS;
    // Movement detection: compare the latest position with the previous one.
    const dx = posRef.current.x - lastPos.current.x;
    const dy = posRef.current.y - lastPos.current.y;
    if (dx !== 0 || dy !== 0) {
      if (Math.abs(dx) > 0.01) facingLeft.current = dx < 0;
      sinceMove.current = 0;
      lastPos.current = posRef.current;
    }
    const moving = sinceMove.current < MOVING_HOLD_MS;
    const loop = moving ? frames.run : frames.idle;
    const frameMs = moving ? RUN_FRAME_MS : IDLE_FRAME_MS;
    const tex = reduceMotion ? loop[0] : loop[Math.floor(elapsed.current / frameMs) % loop.length];
    if (sprite.texture !== tex) sprite.texture = tex;
    const sx = facingLeft.current ? -DUNGEON_SCALE : DUNGEON_SCALE;
    if (sprite.scale.x !== sx) sprite.scale.x = sx;
  });

  const drawShadow = useMemo(
    () => (g: Graphics) => {
      g.clear();
      g.ellipse(0, feetY, SHADOW.rx, SHADOW.ry);
      g.fill({ color: 0x000000, alpha: SHADOW.alpha });
    },
    [feetY],
  );

  if (!frames) return null;
  return (
    <>
      <pixiGraphics draw={drawShadow} />
      <pixiSprite
        ref={spriteRef}
        texture={frames.idle[0]}
        anchor={{ x: 0.5, y: 1 }}
        y={feetY}
        scale={DUNGEON_SCALE}
      />
    </>
  );
}

export const HeroSprite = memo(HeroSpriteComponent);
