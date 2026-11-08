/**
 * DungeonWorldZones
 *
 * Baked rooms around the Guild Hall (wings, tavern, monster dungeon), one
 * nearest-sampled texture per zone placed at its world rectangle. The hall
 * itself is drawn by DungeonHallBackground at the world origin.
 * Shows flat stone-dark fills until the atlas has loaded, or if it fails.
 */
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Graphics, Texture } from "pixi.js";
import { loadDungeonAtlas } from "@/dungeon/dungeon-atlas";
import { composeDungeonZoneRoomCanvas } from "@/dungeon/compose-dungeon-zone-room-canvas";
import { OUTER_ZONES, type ZoneId } from "@/dungeon/dungeon-world-layout";

const FALLBACK_FILL = 0x1b1720;

export function DungeonWorldZones(): ReactNode {
  const [textures, setTextures] = useState<Partial<Record<ZoneId, Texture>> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const created: Texture[] = [];

    loadDungeonAtlas()
      .then((atlas) => {
        if (cancelled) return;
        const byZone: Partial<Record<ZoneId, Texture>> = {};
        for (const zone of OUTER_ZONES) {
          try {
            const tex = Texture.from(composeDungeonZoneRoomCanvas(atlas, zone));
            tex.source.scaleMode = "nearest";
            created.push(tex);
            byZone[zone.id] = tex;
          } catch (err: unknown) {
            // This room keeps the fallback fill; the others still bake.
            console.error(`[DungeonWorldZones] failed to bake "${zone.id}":`, err);
          }
        }
        setTextures(byZone);
      })
      .catch((err: unknown) => {
        // Keep the fallback fills; the hall and heroes still work.
        console.error("[DungeonWorldZones] failed to build zone rooms:", err);
      });

    return () => {
      cancelled = true;
      created.forEach((t) => t.destroy(true));
    };
  }, []);

  const drawFallback = useCallback((g: Graphics) => {
    g.clear();
    for (const { rect } of OUTER_ZONES) {
      g.rect(rect.x, rect.y, rect.width, rect.height);
    }
    g.fill(FALLBACK_FILL);
  }, []);

  if (!textures) return <pixiGraphics draw={drawFallback} />;

  return (
    <>
      {OUTER_ZONES.some((z) => !textures[z.id]) && <pixiGraphics draw={drawFallback} />}
      {OUTER_ZONES.map((zone) => {
        const tex = textures[zone.id];
        return tex ? <pixiSprite key={zone.id} texture={tex} x={zone.rect.x} y={zone.rect.y} /> : null;
      })}
    </>
  );
}
