/**
 * DungeonZoneStations
 *
 * Work stations in the task-zone rooms: the same table as the hall's stations
 * with the zone's item on it (quill, hammer, lever...). Heroes are routed to
 * them in phase 9 M3; until then they mark where each kind of work happens.
 */
import { type ReactNode, useEffect, useState } from "react";
import type { Texture } from "pixi.js";
import { loadDungeonAtlas } from "@/dungeon/dungeon-atlas";
import { getDungeonTexture } from "@/dungeon/dungeon-pixi-textures";
import { DUNGEON_SCALE } from "@/dungeon/dungeon-hall-layout";
import { ZONE_STATIONS } from "@/dungeon/world-ambience-layout";
import { STATION_ITEM_OFFSET, STATION_TABLE, STATION_TABLE_Y } from "./DungeonStations";

export function DungeonZoneStations(): ReactNode {
  const [textures, setTextures] = useState<Map<string, Texture> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadDungeonAtlas()
      .then((atlas) => {
        if (cancelled) return;
        const names = new Set([STATION_TABLE, ...ZONE_STATIONS.map((s) => s.item)]);
        setTextures(new Map([...names].map((n) => [n, getDungeonTexture(atlas, n)])));
      })
      .catch((err: unknown) => console.error("[DungeonZoneStations] atlas load failed:", err));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!textures) return null;
  const table = textures.get(STATION_TABLE)!;
  return (
    <>
      {ZONE_STATIONS.map((s, i) => (
        <pixiContainer key={i} x={s.x} y={s.y}>
          <pixiSprite texture={table} anchor={{ x: 0.5, y: 0 }} y={STATION_TABLE_Y} scale={DUNGEON_SCALE} />
          <pixiSprite
            texture={textures.get(s.item)!}
            anchor={{ x: 0.5, y: 1 }}
            x={STATION_ITEM_OFFSET.x}
            y={STATION_TABLE_Y + STATION_ITEM_OFFSET.y}
            scale={DUNGEON_SCALE}
          />
        </pixiContainer>
      ))}
    </>
  );
}
