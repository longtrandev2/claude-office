/**
 * DungeonHallBackground
 *
 * Static Guild Hall backdrop (walls, floor, carpet, decoration) baked into one
 * nearest-sampled texture. Replaces the original office floor/walls.
 * Shows a flat stone-dark fill until the atlas has loaded, or if it fails.
 */
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Graphics, Texture } from "pixi.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";
import { loadDungeonAtlas } from "@/dungeon/dungeon-atlas";
import { composeDungeonHallCanvas } from "@/dungeon/compose-dungeon-hall-canvas";

const FALLBACK_FILL = 0x1b1720;

export function DungeonHallBackground(): ReactNode {
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    let cancelled = false;
    let created: Texture | null = null;

    loadDungeonAtlas()
      .then((atlas) => {
        if (cancelled) return;
        created = Texture.from(composeDungeonHallCanvas(atlas));
        created.source.scaleMode = "nearest";
        setTexture(created);
      })
      .catch((err: unknown) => {
        // Keep the fallback fill; the rest of the scene still works.
        console.error("[DungeonHallBackground] failed to build hall:", err);
      });

    return () => {
      cancelled = true;
      created?.destroy(true);
    };
  }, []);

  const drawFallback = useCallback((g: Graphics) => {
    g.clear();
    g.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    g.fill(FALLBACK_FILL);
  }, []);

  return texture ? (
    <pixiSprite texture={texture} x={0} y={0} />
  ) : (
    <pixiGraphics draw={drawFallback} />
  );
}
