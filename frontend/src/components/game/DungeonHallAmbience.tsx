/**
 * DungeonHallAmbience
 *
 * The living layer over the baked Guild Hall: candle flames and fountain water
 * cycling their frames, and warm light pools that flicker around those real
 * sources. Light pools are drawn as stepped rings (pixel-art banding, not a
 * smooth gradient) with additive blending.
 *
 * Animation runs imperatively in the Pixi ticker (no React re-render per
 * frame). With prefers-reduced-motion the layer is drawn once, still.
 */
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTick } from "@pixi/react";
import { Graphics, Rectangle, Sprite, Texture } from "pixi.js";
import { loadDungeonAtlas, type DungeonAtlas } from "@/dungeon/dungeon-atlas";
import {
  DUNGEON_SCALE,
  HALL_ANIMATED_DECOR,
  HALL_LIGHTS,
  type HallLight,
} from "@/dungeon/dungeon-hall-layout";

/** Ring steps from outer to inner; each adds a little more light. */
const LIGHT_RINGS = [1, 0.74, 0.5, 0.28];
const LIGHT_RING_ALPHA = 0.055;

/** Build nearest-sampled Pixi textures for every frame name used here. */
function buildFrameTextures(atlas: DungeonAtlas): Map<string, Texture> {
  const sheet = Texture.from(atlas.image).source;
  sheet.scaleMode = "nearest";
  const textures = new Map<string, Texture>();
  for (const decor of HALL_ANIMATED_DECOR) {
    for (const name of decor.frames) {
      if (textures.has(name)) continue;
      if (name.startsWith("prop:")) {
        const tex = Texture.from(atlas.props[name.slice(5)]);
        tex.source.scaleMode = "nearest";
        textures.set(name, tex);
      } else {
        const f = atlas.frames[name];
        if (!f) throw new Error(`Unknown atlas frame "${name}"`);
        textures.set(name, new Texture({ source: sheet, frame: new Rectangle(f.x, f.y, f.w, f.h) }));
      }
    }
  }
  return textures;
}

function drawLightPool(g: Graphics, light: HallLight): void {
  g.clear();
  for (const step of LIGHT_RINGS) {
    // Snap radius to whole source pixels so ring edges stay on the pixel grid.
    const r = Math.round((light.radius * step) / DUNGEON_SCALE) * DUNGEON_SCALE;
    g.circle(0, 0, r);
    g.fill({ color: light.color, alpha: LIGHT_RING_ALPHA });
  }
}

/** Cheap organic flicker in [0.78, 1]: two out-of-phase sines plus a seed. */
function flicker(timeMs: number, seed: number): number {
  const t = timeMs / 1000;
  return 0.89 + 0.07 * Math.sin(t * 7.3 + seed) + 0.04 * Math.sin(t * 13.1 + seed * 2.7);
}

export function DungeonHallAmbience(): ReactNode {
  const [textures, setTextures] = useState<Map<string, Texture> | null>(null);
  const spriteRefs = useRef<(Sprite | null)[]>([]);
  const lightRefs = useRef<(Graphics | null)[]>([]);
  const elapsed = useRef(0);
  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    let cancelled = false;
    loadDungeonAtlas()
      .then((atlas) => {
        if (!cancelled) setTextures(buildFrameTextures(atlas));
      })
      .catch((err: unknown) => console.error("[DungeonHallAmbience] atlas load failed:", err));
    return () => {
      cancelled = true;
    };
  }, []);

  useTick((ticker) => {
    if (!textures || reduceMotion) return;
    elapsed.current += ticker.deltaMS;
    const now = elapsed.current;
    HALL_ANIMATED_DECOR.forEach((decor, i) => {
      const sprite = spriteRefs.current[i];
      if (!sprite) return;
      const frame = decor.frames[Math.floor(now / decor.frameMs) % decor.frames.length];
      const tex = textures.get(frame);
      if (tex && sprite.texture !== tex) sprite.texture = tex;
    });
    lightRefs.current.forEach((g, i) => {
      if (g) g.alpha = flicker(now, i * 1.7);
    });
  });

  const lightDrawers = useMemo(
    () => HALL_LIGHTS.map((light) => (g: Graphics) => drawLightPool(g, light)),
    [],
  );
  const setSpriteRef = useCallback(
    (i: number) => (el: Sprite | null) => {
      spriteRefs.current[i] = el;
    },
    [],
  );

  if (!textures) return null;

  return (
    <>
      {HALL_ANIMATED_DECOR.map((decor, i) => (
        <pixiSprite
          key={`decor-${i}`}
          ref={setSpriteRef(i)}
          texture={textures.get(decor.frames[0]) ?? Texture.EMPTY}
          x={decor.x}
          y={decor.y}
          scale={DUNGEON_SCALE}
        />
      ))}
      {HALL_LIGHTS.map((light, i) => (
        <pixiGraphics
          key={`light-${i}`}
          ref={(el: Graphics | null) => {
            lightRefs.current[i] = el;
          }}
          draw={lightDrawers[i]}
          x={light.x}
          y={light.y}
          blendMode="add"
        />
      ))}
    </>
  );
}
