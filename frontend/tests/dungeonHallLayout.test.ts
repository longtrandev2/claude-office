import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DUNGEON_PROP_NAMES } from "@/dungeon/dungeon-atlas";
import {
  HALL_FLOOR_DECOR,
  HALL_HEIGHT,
  HALL_WALL_DECOR,
  HALL_WIDTH,
} from "@/dungeon/dungeon-hall-layout";

const atlas = JSON.parse(
  readFileSync(join(__dirname, "../public/themes/dungeon/dungeon-tileset.json"), "utf8"),
) as { frames: Record<string, unknown> };

// Sprites the composer uses directly (not via the decor lists).
const COMPOSER_SPRITES = [
  "wall_mid", "wall_hole_1", "wall_hole_2", "wall_edge_left", "wall_edge_right",
  "floor_1", "floor_2", "floor_3", "floor_4", "floor_5", "floor_6", "floor_7", "floor_8",
];

describe("dungeon hall layout", () => {
  it("references only sprites that exist in the atlas or prop set", () => {
    const missing = [...HALL_WALL_DECOR, ...HALL_FLOOR_DECOR]
      .map((d) => d.sprite)
      .concat(COMPOSER_SPRITES)
      .filter((name) =>
        name.startsWith("prop:")
          ? !(DUNGEON_PROP_NAMES as readonly string[]).includes(name.slice(5))
          : !(name in atlas.frames),
      );
    expect(missing).toEqual([]);
  });

  it("keeps decoration inside the hall", () => {
    for (const d of [...HALL_WALL_DECOR, ...HALL_FLOOR_DECOR]) {
      expect(d.x).toBeGreaterThanOrEqual(0);
      expect(d.x).toBeLessThan(HALL_WIDTH);
      expect(d.y).toBeGreaterThanOrEqual(0);
      expect(d.y).toBeLessThan(HALL_HEIGHT);
    }
  });
});
