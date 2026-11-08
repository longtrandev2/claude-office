import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DUNGEON_PROP_NAMES } from "@/dungeon/dungeon-atlas";
import { HALL_TILE } from "@/dungeon/dungeon-hall-layout";
import { OUTER_ZONES } from "@/dungeon/dungeon-world-layout";
import { ZONE_ROOM_DECOR } from "@/dungeon/zone-room-decor-layouts";

const atlas = JSON.parse(
  readFileSync(join(__dirname, "../public/themes/dungeon/dungeon-tileset.json"), "utf8"),
) as { frames: Record<string, unknown> };

const exists = (name: string) =>
  name.startsWith("prop:")
    ? (DUNGEON_PROP_NAMES as readonly string[]).includes(name.slice(5))
    : name in atlas.frames;

// A missing name throws at bake time and blanks that room, so check them all.
describe("task-zone room furnishing", () => {
  it("references only sprites that exist in the atlas or prop set", () => {
    const missing: string[] = [];
    for (const [zone, room] of Object.entries(ZONE_ROOM_DECOR)) {
      const names = [
        ...room.decor.map((d) => d.sprite),
        ...room.animated.flatMap((a) => a.frames),
        ...room.stations.map((s) => s.item),
        ...(room.bookShelves.length ? ["prop:three-tier-shelf"] : []),
      ];
      missing.push(...names.filter((n) => !exists(n)).map((n) => `${zone}: ${n}`));
    }
    expect(missing).toEqual([]);
  });

  it("keeps decor, lights and stations inside the room, clear of the side walls", () => {
    for (const zone of OUTER_ZONES) {
      const room = ZONE_ROOM_DECOR[zone.id];
      if (!room) continue;
      const points = [...room.decor, ...room.animated, ...room.lights, ...room.stations, ...room.bookShelves];
      for (const p of points) {
        expect(p.x, `${zone.id} x`).toBeGreaterThanOrEqual(HALL_TILE);
        expect(p.x, `${zone.id} x`).toBeLessThan(zone.rect.width - HALL_TILE);
        expect(p.y, `${zone.id} y`).toBeGreaterThanOrEqual(0);
        expect(p.y, `${zone.id} y`).toBeLessThan(zone.rect.height);
      }
    }
  });

  it("gives every outer zone stations for heroes to work at (M3 targets)", () => {
    for (const zone of OUTER_ZONES) {
      expect(ZONE_ROOM_DECOR[zone.id]?.stations.length ?? 0, zone.id).toBeGreaterThanOrEqual(4);
    }
  });
});
