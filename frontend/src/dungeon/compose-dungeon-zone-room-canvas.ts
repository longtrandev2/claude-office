/**
 * Bakes one task-zone room (wing rooms, tavern, dungeon) into an offscreen
 * canvas: back wall, stone floor, rugs, side walls, furniture (book shelves
 * get painted books), the first frame of animated pieces, and ambient darkness
 * with lit zones around the room's real light sources.
 *
 * Furnishing data: zone-room-decor-layouts.ts (room-local coordinates).
 */
import type { DungeonAtlas } from "./dungeon-atlas";
import { FLOOR_VARIANT_CHANCE, HALL_LIT_ZONE_FACTOR, WALL_DAMAGE_CHANCE } from "./dungeon-hall-layout";
import {
  createRoomCanvas,
  mulberry32,
  paintAmbientDarkness,
  paintBackWall,
  paintDecor,
  paintFloor,
  paintRug,
  paintShelfBooks,
  paintSideWalls,
  type RoomShape,
} from "./dungeon-room-painter";
import type { WorldZone } from "./dungeon-world-layout";
import { ZONE_ROOM_DECOR } from "./zone-room-decor-layouts";

const SHELF = "prop:three-tier-shelf";

/** The monster dungeon is older stone: more cracks and holes. */
const DUNGEON_WEAR_FACTOR = 3;

export function composeDungeonZoneRoomCanvas(atlas: DungeonAtlas, zone: WorldZone): HTMLCanvasElement {
  const shape: RoomShape = { width: zone.rect.width, height: zone.rect.height, wallHeight: zone.wallHeight };
  const wear = zone.id === "dungeon" ? DUNGEON_WEAR_FACTOR : 1;
  const { canvas, ctx } = createRoomCanvas(shape);
  const rand = mulberry32(zone.seed);
  paintBackWall(ctx, atlas, rand, shape, WALL_DAMAGE_CHANCE * wear);
  paintFloor(ctx, atlas, rand, shape, FLOOR_VARIANT_CHANCE * wear);
  const room = ZONE_ROOM_DECOR[zone.id];
  room?.rugs.forEach((rug) => paintRug(ctx, rug));
  paintSideWalls(ctx, atlas, shape);
  if (room) {
    paintDecor(ctx, atlas, [
      ...room.bookShelves.map((s) => ({ sprite: SHELF, ...s })),
      ...room.decor,
      ...room.animated.map((a) => ({ sprite: a.frames[0], x: a.x, y: a.y })),
    ]);
    room.bookShelves.forEach((s) => paintShelfBooks(ctx, s.x, s.y, rand));
  }
  paintAmbientDarkness(ctx, shape, zone.darkness, room?.lights ?? [], HALL_LIT_ZONE_FACTOR);
  return canvas;
}
