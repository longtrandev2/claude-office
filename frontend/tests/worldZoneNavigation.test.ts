import { describe, expect, it } from "vitest";
import { neighborZone, zoneAt } from "@/dungeon/world-zone-navigation";

describe("world zone navigation (arrow keys jump rooms)", () => {
  it("walks the map from the Guild Hall", () => {
    expect(neighborZone("guild-hall", "left")?.id).toBe("library");
    expect(neighborZone("guild-hall", "right")?.id).toBe("war-room");
    expect(neighborZone("guild-hall", "down")?.id).toBe("dungeon");
    expect(neighborZone("guild-hall", "up")).toBeNull();
  });

  it("moves inside the wings and the lower level", () => {
    expect(neighborZone("library", "down")?.id).toBe("forge");
    expect(neighborZone("forge", "down")?.id).toBe("tavern");
    expect(neighborZone("forge", "right")?.id).toBe("guild-hall");
    expect(neighborZone("war-room", "down")?.id).toBe("review-chamber");
    expect(neighborZone("tavern", "right")?.id).toBe("dungeon");
    expect(neighborZone("dungeon", "up")?.id).toBe("guild-hall");
    expect(neighborZone("library", "left")).toBeNull();
    // Wide dungeon: rooms above it are reached by "up", nothing to its right.
    expect(neighborZone("review-chamber", "down")?.id).toBe("dungeon");
    expect(neighborZone("dungeon", "right")).toBeNull();
    expect(neighborZone("dungeon", "left")?.id).toBe("tavern");
  });

  it("finds the room under a point", () => {
    expect(zoneAt({ x: 640, y: 500 }).id).toBe("guild-hall");
    expect(zoneAt({ x: -100, y: 700 }).id).toBe("forge");
    expect(zoneAt({ x: 1500, y: 1500 }).id).toBe("dungeon");
    expect(zoneAt({ x: -5000, y: -5000 }).id).toBe("library"); // nearest
  });
});
