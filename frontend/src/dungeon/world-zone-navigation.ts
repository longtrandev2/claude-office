/**
 * Room-to-room camera navigation: which zone a point is in, and which zone is
 * the neighbour in a direction (arrow keys / edge signposts jump rooms).
 *
 * Neighbours are found by room edges, not centres, so wide rooms behave:
 * a room is "to the right" only if it lies right of this room and the two
 * share some vertical extent. Pure functions over WORLD_ZONES.
 */
import {
  WORLD_ZONES,
  type WorldRect,
  type WorldZone,
  type ZoneId,
} from "./dungeon-world-layout";

export type ZoneDirection = "left" | "right" | "up" | "down";

function zoneCenter(zone: WorldZone): { x: number; y: number } {
  return {
    x: zone.rect.x + zone.rect.width / 2,
    y: zone.rect.y + zone.rect.height / 2,
  };
}

export function zoneById(id: ZoneId): WorldZone {
  const zone = WORLD_ZONES.find((z) => z.id === id);
  if (!zone) throw new Error(`Unknown zone "${id}"`);
  return zone;
}

/** Zone containing the point, else the zone whose centre is nearest. */
export function zoneAt(point: { x: number; y: number }): WorldZone {
  const inside = WORLD_ZONES.find(
    ({ rect }) =>
      point.x >= rect.x &&
      point.x < rect.x + rect.width &&
      point.y >= rect.y &&
      point.y < rect.y + rect.height,
  );
  if (inside) return inside;
  let best = WORLD_ZONES[0];
  let bestDist = Infinity;
  for (const zone of WORLD_ZONES) {
    const c = zoneCenter(zone);
    const d = Math.hypot(c.x - point.x, c.y - point.y);
    if (d < bestDist) {
      best = zone;
      bestDist = d;
    }
  }
  return best;
}

/** Length of the overlap of two 1D ranges (0 when they only touch or miss). */
function overlap(a0: number, a1: number, b0: number, b1: number): number {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
}

/**
 * Gap from `from` to `to` along the direction (>= 0 when `to` lies that way)
 * and how much they share across it; null when `to` is not in that direction.
 */
function directionalFit(
  from: WorldRect,
  to: WorldRect,
  direction: ZoneDirection,
) {
  const horizontal = direction === "left" || direction === "right";
  const shared = horizontal
    ? overlap(from.y, from.y + from.height, to.y, to.y + to.height)
    : overlap(from.x, from.x + from.width, to.x, to.x + to.width);
  if (shared <= 0) return null;
  const gap = {
    right: to.x - (from.x + from.width),
    left: from.x - (to.x + to.width),
    down: to.y - (from.y + from.height),
    up: from.y - (to.y + to.height),
  }[direction];
  return gap >= 0 ? { gap } : null;
}

/**
 * Nearest room in a direction, or null at the world edge. Among rooms at the
 * same distance, the one most in line with this room's centre wins; ties go to
 * the upper / left room so results are stable.
 */
export function neighborZone(
  fromId: ZoneId,
  direction: ZoneDirection,
): WorldZone | null {
  const from = zoneById(fromId);
  const fc = zoneCenter(from);
  const horizontal = direction === "left" || direction === "right";
  let best: WorldZone | null = null;
  let bestKey: [number, number, number] | null = null;
  for (const zone of WORLD_ZONES) {
    if (zone.id === fromId) continue;
    const fit = directionalFit(from.rect, zone.rect, direction);
    if (!fit) continue;
    const c = zoneCenter(zone);
    const offAxis = horizontal ? Math.abs(c.y - fc.y) : Math.abs(c.x - fc.x);
    const key: [number, number, number] = [
      fit.gap,
      offAxis,
      horizontal ? c.y : c.x,
    ];
    if (
      !bestKey ||
      key[0] < bestKey[0] ||
      (key[0] === bestKey[0] &&
        (key[1] < bestKey[1] || (key[1] === bestKey[1] && key[2] < bestKey[2])))
    ) {
      best = zone;
      bestKey = key;
    }
  }
  return best;
}
