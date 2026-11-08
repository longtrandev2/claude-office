/**
 * Phase 9 M3 routing rules (pure): which room a hero should work in, and the
 * walk from its hall desk to a station in that room.
 *
 * Hybrid rule (user decision 2026-11-08): the agent type sets the home room;
 * the tool in use pulls the hero to that tool's room for a while; a hero left
 * waiting for long goes to the tavern. The Guild Master never leaves the hall.
 *
 * Paths: the hall part uses the engine's A* grid (desks are obstacles); from
 * a hall door on, fixed corridor waypoints lead through doorways / the stairs,
 * then the hero approaches its station from above so it never walks through
 * a table. All coordinates are world pixels (hall = world origin).
 */
import type { Position } from "@/types";
import type { ToolCategory } from "./tool-activity";
import type { ZoneId } from "./dungeon-world-layout";

/** Rooms a hero can be sent to (the hall is "stay at your desk"). */
export type WorkZoneId = Exclude<ZoneId, "guild-hall">;

/** Home room per Claude Code / ClaudeKit agent type (others stay in the hall). */
const HOME_ZONE_BY_AGENT_TYPE: Record<string, WorkZoneId> = {
  "fullstack-developer": "forge",
  "code-simplifier": "forge",
  planner: "war-room",
  brainstormer: "war-room",
  "project-manager": "war-room",
  researcher: "library",
  explore: "library",
  "docs-manager": "library",
  "docs-seeker": "library",
  "code-reviewer": "review-chamber",
  debugger: "dungeon",
  tester: "dungeon",
};

/** Room a tool category pulls a hero to ("task" = hand-offs, back to the hall). */
const ZONE_BY_TOOL: Record<ToolCategory, ZoneId> = {
  write: "forge",
  read: "library",
  search: "library",
  web: "library",
  bash: "dungeon",
  task: "guild-hall",
};

export function homeZoneForAgentType(agentType: string | null | undefined): ZoneId {
  if (!agentType) return "guild-hall";
  const key = agentType.toLowerCase().replace(/^.*:/, ""); // "ck:planner" → "planner"
  return HOME_ZONE_BY_AGENT_TYPE[key] ?? "guild-hall";
}

export function zoneForToolCategory(category: ToolCategory | null): ZoneId | null {
  return category ? ZONE_BY_TOOL[category] : null;
}

/** How long a tool keeps pulling after it was last seen. */
export const TOOL_PULL_HOLD_MS = 5000;
/** A new target must stay the same this long before the hero sets off. */
export const TARGET_STABLE_MS = 1500;
/** Minimum time at a station before leaving it again. */
export const MIN_STAY_MS = 4000;
/** Backend "waiting" this long sends the hero to the tavern. */
export const TAVERN_AFTER_WAITING_MS = 15000;

export interface ZoneRuleInput {
  agentType: string | null;
  /** Room of the tool seen most recently, and when (ms). */
  lastToolZone: ZoneId | null;
  lastToolAt: number;
  /** Since when the backend has reported "waiting" (null = not waiting). */
  waitingSince: number | null;
  now: number;
}

/** The hybrid rule: waiting → tavern, recent tool → its room, else home. */
export function desiredZone(input: ZoneRuleInput): ZoneId {
  const { agentType, lastToolZone, lastToolAt, waitingSince, now } = input;
  if (waitingSince !== null && now - waitingSince >= TAVERN_AFTER_WAITING_MS) return "tavern";
  if (lastToolZone && now - lastToolAt < TOOL_PULL_HOLD_MS) return lastToolZone;
  return homeZoneForAgentType(agentType);
}

/** Hall exit point (on the A* grid) + corridor waypoints to the room entry. */
export interface ZoneRoute {
  hallDoor: Position;
  corridor: Position[];
}

const STAIRS_TOP: Position = { x: 1136, y: 990 };
const STAIRS_DOWN: Position[] = [
  { x: 1136, y: 1195 },
  { x: 1136, y: 1264 },
];

export const ZONE_ROUTES: Record<WorkZoneId, ZoneRoute> = {
  library: { hallDoor: { x: 80, y: 400 }, corridor: [{ x: -64, y: 400 }] },
  forge: { hallDoor: { x: 80, y: 820 }, corridor: [{ x: -64, y: 820 }] },
  "war-room": { hallDoor: { x: 1200, y: 400 }, corridor: [{ x: 1344, y: 400 }] },
  "review-chamber": { hallDoor: { x: 1200, y: 820 }, corridor: [{ x: 1344, y: 820 }] },
  dungeon: { hallDoor: STAIRS_TOP, corridor: STAIRS_DOWN },
  tavern: {
    hallDoor: STAIRS_TOP,
    corridor: [...STAIRS_DOWN, { x: 64, y: 1264 }, { x: -64, y: 1264 }],
  },
};

/** Heroes come down onto their station from this far above it. */
const STATION_APPROACH_DY = 60;

/** Waypoints from the room entry (last corridor point) to a station. */
export function stationApproach(entry: Position, station: Position): Position[] {
  const ay = station.y - STATION_APPROACH_DY;
  return [
    { x: entry.x, y: ay },
    { x: station.x, y: ay },
    { x: station.x, y: station.y },
  ];
}

/**
 * Full walk desk → station. `hallPath` is the A* path desk → hall door
 * (first point = desk). Returns null when the hall part is not walkable.
 */
export function buildZonePath(hallPath: Position[], zone: WorkZoneId, station: Position): Position[] | null {
  if (hallPath.length < 2) return null;
  const route = ZONE_ROUTES[zone];
  const entry = route.corridor[route.corridor.length - 1];
  return [...hallPath, ...route.corridor, ...stationApproach(entry, station)];
}
