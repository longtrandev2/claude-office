"use client";

/**
 * DungeonDescent — phase 9 "Dungeon = Codebase", cross-section below the hall.
 *
 * Scrolling down from the Guild Hall descends into the repo: one stone strip
 * per explored top-level folder (B1, B2, …), one chamber per explored
 * second-level folder. Only what agents touched this session is shown (fog of
 * war). Built in HTML so every label stays crisp at any screen size; floor
 * texture comes from the same CC0 atlas as the hall.
 */
import { useEffect, useState, type ReactNode } from "react";
import { useExploredMapStore } from "@/stores/exploredMapStore";
import { useTranslation } from "@/hooks/useTranslation";
import { loadDungeonAtlas } from "@/dungeon/dungeon-atlas";
import {
  TOOL_COLORS,
  TOOL_ICON_BITMAPS,
  type ToolCategory,
} from "@/dungeon/tool-activity";
import type { ExploredLevel, ExploredRoom } from "@/types/generated";

const FLOOR_TILE = "floor_1";
const TILE_PX = 48; // 16px source × 3, same scale as the hall
const ACTIVE_MS = 60_000;
const COUNT_ORDER: ToolCategory[] = ["read", "search", "write"];

/** Build a CSS-repeatable stone floor tile from the atlas (once). */
function useFloorTileUrl(): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadDungeonAtlas()
      .then((atlas) => {
        const f = atlas.frames[FLOOR_TILE];
        const c = document.createElement("canvas");
        c.width = TILE_PX;
        c.height = TILE_PX;
        const ctx = c.getContext("2d");
        if (!ctx || !f || cancelled) return;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(atlas.image, f.x, f.y, f.w, f.h, 0, 0, TILE_PX, TILE_PX);
        setUrl(c.toDataURL());
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  return url;
}

/** 7×7 hand-drawn tool icon as crisp SVG rects. */
function PixelIcon({ category }: { category: ToolCategory }): ReactNode {
  const color = `#${TOOL_COLORS[category].toString(16).padStart(6, "0")}`;
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 7 7"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {TOOL_ICON_BITMAPS[category].flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === "#" ? (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={color}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

function basename(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}

function Chamber({
  room,
  floorUrl,
  now,
}: {
  room: ExploredRoom;
  floorUrl: string | null;
  now: number;
}): ReactNode {
  const active = room.lastSeen
    ? now - new Date(room.lastSeen).getTime() < ACTIVE_MS
    : false;
  const counts = room.counts ?? {};
  return (
    <li
      className={`relative flex w-56 flex-col justify-between p-3 outline outline-2 ${
        active ? "outline-[#f2b442]" : "outline-[#2a2230]"
      }`}
      style={{
        backgroundColor: "#2b2430",
        backgroundImage: floorUrl ? `url(${floorUrl})` : undefined,
        backgroundSize: `${TILE_PX}px ${TILE_PX}px`,
        imageRendering: "pixelated",
        minHeight: 132,
      }}
    >
      <div className="bg-[#14101a]/85 px-2 py-1">
        <p
          className="truncate text-sm font-bold text-[#f1e3c2]"
          title={room.name}
        >
          {room.name}
        </p>
        <div className="mt-1 flex gap-3">
          {COUNT_ORDER.filter((c) => counts[c]).map((c) => (
            <span
              key={c}
              className="flex items-center gap-1 text-xs text-[#d9c9a3]"
            >
              <PixelIcon category={c} />
              {counts[c]}
            </span>
          ))}
        </div>
      </div>
      {(room.files ?? []).length > 0 && (
        <ul className="mt-2 space-y-0.5 bg-[#14101a]/85 px-2 py-1 text-xs text-[#d9c9a3]">
          {(room.files ?? []).slice(0, 3).map((f) => (
            <li key={f} className="truncate" title={f}>
              {basename(f)}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function LevelStrip({
  level,
  depth,
  floorUrl,
  now,
}: {
  level: ExploredLevel;
  depth: number;
  floorUrl: string | null;
  now: number;
}): ReactNode {
  const { t } = useTranslation();
  // Each level down is one tone step darker.
  const shade = Math.max(0, 0x1b - depth * 3);
  const bg = `rgb(${shade + 4}, ${shade}, ${shade + 8})`;
  return (
    <section
      className="flex gap-4 px-4 py-5"
      style={{ backgroundColor: bg }}
      aria-label={`B${depth} ${level.name}`}
    >
      <header className="flex w-40 shrink-0 flex-col justify-center bg-[#e8d5a6] px-3 py-2 text-[#3b2a1a] outline outline-2 outline-[#b89a5e]">
        <span className="text-2xl font-bold leading-none">B{depth}</span>
        <span className="mt-1 truncate text-sm font-bold" title={level.name}>
          {level.name}
        </span>
      </header>
      <ul className="flex flex-1 flex-wrap gap-4">
        {(level.rooms ?? []).map((room) => (
          <Chamber key={room.name} room={room} floorUrl={floorUrl} now={now} />
        ))}
        {(level.hiddenRooms ?? 0) > 0 && (
          <li className="flex w-40 items-center justify-center bg-[#0d0a12] px-3 text-center text-sm text-[#9a8f7a] outline outline-2 outline-[#2a2230]">
            {t("descent.hiddenRooms", { count: level.hiddenRooms ?? 0 })}
          </li>
        )}
      </ul>
    </section>
  );
}

export function DungeonDescent(): ReactNode {
  const { t } = useTranslation();
  const levels = useExploredMapStore((s) => s.levels);
  const floorUrl = useFloorTileUrl();
  const [now, setNow] = useState(() => Date.now());

  // Re-evaluate "active room" highlights every few seconds.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 5000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="bg-[#0d0a12] pb-6">
      <h2 className="px-4 pb-2 pt-5 text-lg font-bold text-[#f1e3c2]">
        {t("descent.title")}
      </h2>
      {levels.length === 0 ? (
        <p className="px-4 pb-4 text-sm text-[#9a8f7a]">{t("descent.empty")}</p>
      ) : (
        levels.map((level, i) => (
          <LevelStrip
            key={level.name}
            level={level}
            depth={i + 1}
            floorUrl={floorUrl}
            now={now}
          />
        ))
      )}
    </div>
  );
}
