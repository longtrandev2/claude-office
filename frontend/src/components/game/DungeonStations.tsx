/**
 * DungeonStations
 *
 * Adventurer work stations (replacing the office desks, keyboards, monitors
 * and desk toys) plus the Guild Master's war table. Positions come from the
 * engine's desk grid (`useDeskPositions`), so pathing and seating are
 * unchanged. Each station gets one small dungeon item; the task marquee
 * still runs along the front of occupied stations.
 */
import { type ReactNode, useEffect, useState } from "react";
import type { Texture } from "pixi.js";
import { loadDungeonAtlas } from "@/dungeon/dungeon-atlas";
import { getDungeonTexture } from "@/dungeon/dungeon-pixi-textures";
import { DUNGEON_SCALE } from "@/dungeon/dungeon-hall-layout";
import { useDeskPositions } from "./DeskGrid";
import { DeskMarquee } from "./DeskMarquee";

const TABLE = "prop:wooden-desk";
/** One item per station, cycling — all from the same CC0 art family. */
const STATION_ITEMS = [
  "flask_big_red",
  "prop:globe",
  "flask_blue",
  "skull",
  "flask_big_green",
  "coin_anim_f0",
  "flask_yellow",
  "flask_big_blue",
];
const WAR_TABLE_ITEMS = ["prop:globe", "prop:wall-candle-f0"];

/** Table top sits where the office desk surface was (y = +30 from the seat). */
const TABLE_Y = 30;
const ITEM_OFFSET = { x: 26, y: 18 };

function useStationTextures(): Map<string, Texture> | null {
  const [textures, setTextures] = useState<Map<string, Texture> | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadDungeonAtlas()
      .then((atlas) => {
        if (cancelled) return;
        const names = [TABLE, ...STATION_ITEMS, ...WAR_TABLE_ITEMS];
        setTextures(new Map(names.map((n) => [n, getDungeonTexture(atlas, n)])));
      })
      .catch((err: unknown) => console.error("[DungeonStations] atlas load failed:", err));
    return () => {
      cancelled = true;
    };
  }, []);
  return textures;
}

interface DungeonStationsProps {
  deskCount: number;
  occupiedDesks: Set<number>;
  deskTasks: Map<number, string>;
}

export function DungeonStations({ deskCount, occupiedDesks, deskTasks }: DungeonStationsProps): ReactNode {
  const desks = useDeskPositions(deskCount, occupiedDesks);
  const textures = useStationTextures();
  if (!textures) return null;
  const table = textures.get(TABLE)!;

  return (
    <>
      {desks.map((desk, i) => {
        const item = textures.get(STATION_ITEMS[i % STATION_ITEMS.length])!;
        return (
          <pixiContainer key={i} x={desk.x} y={desk.y}>
            <pixiSprite texture={table} anchor={{ x: 0.5, y: 0 }} y={TABLE_Y} scale={DUNGEON_SCALE} />
            <pixiSprite
              texture={item}
              anchor={{ x: 0.5, y: 1 }}
              x={ITEM_OFFSET.x}
              y={TABLE_Y + ITEM_OFFSET.y}
              scale={DUNGEON_SCALE}
            />
            <DeskMarquee text={deskTasks.get(i + 1) ?? ""} />
          </pixiContainer>
        );
      })}
    </>
  );
}

/** The Guild Master's war table: a table with a globe and a lit candle. */
export function GuildWarTable(): ReactNode {
  const textures = useStationTextures();
  if (!textures) return null;
  return (
    <>
      <pixiSprite texture={textures.get(TABLE)!} anchor={{ x: 0.5, y: 0 }} y={TABLE_Y} scale={DUNGEON_SCALE} />
      <pixiSprite
        texture={textures.get("prop:globe")!}
        anchor={{ x: 0.5, y: 1 }}
        x={-30}
        y={TABLE_Y + 18}
        scale={DUNGEON_SCALE}
      />
      <pixiSprite
        texture={textures.get("prop:wall-candle-f0")!}
        anchor={{ x: 0.5, y: 1 }}
        x={32}
        y={TABLE_Y + 16}
        scale={DUNGEON_SCALE}
      />
    </>
  );
}
