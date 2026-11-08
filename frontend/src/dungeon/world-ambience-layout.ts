/**
 * Hall + task-zone furnishing in WORLD coordinates: animated decor, light
 * pools and work stations of every room, offset by each room's rectangle.
 * The hall's lists are already in world coordinates (hall = world origin).
 */
import { HALL_ANIMATED_DECOR, HALL_LIGHTS, type HallAnimatedDecor, type HallLight } from "./dungeon-hall-layout";
import { OUTER_ZONES, type ZoneId } from "./dungeon-world-layout";
import { ZONE_ROOM_DECOR, type ZoneStation } from "./zone-room-decor-layouts";

export interface WorldStation extends ZoneStation {
  zoneId: ZoneId;
}

const furnishedZones = OUTER_ZONES.flatMap((zone) => {
  const room = ZONE_ROOM_DECOR[zone.id];
  return room ? [{ zone, room, dx: zone.rect.x, dy: zone.rect.y }] : [];
});

export const WORLD_ANIMATED_DECOR: HallAnimatedDecor[] = [
  ...HALL_ANIMATED_DECOR,
  ...furnishedZones.flatMap(({ room, dx, dy }) => room.animated.map((a) => ({ ...a, x: a.x + dx, y: a.y + dy }))),
];

export const WORLD_LIGHTS: HallLight[] = [
  ...HALL_LIGHTS,
  ...furnishedZones.flatMap(({ room, dx, dy }) => room.lights.map((l) => ({ ...l, x: l.x + dx, y: l.y + dy }))),
];

/** Work stations in the task zones (the hall keeps its own desk grid). */
export const ZONE_STATIONS: WorldStation[] = furnishedZones.flatMap(({ zone, room, dx, dy }) =>
  room.stations.map((s) => ({ ...s, x: s.x + dx, y: s.y + dy, zoneId: zone.id })),
);
