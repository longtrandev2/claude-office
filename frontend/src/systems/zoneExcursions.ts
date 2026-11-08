/**
 * Zone excursions (phase 9 M3): heroes leave their hall desk to work at a
 * station in the room that fits what they are doing, then walk back.
 *
 * Runs beside the XState agent machines without changing them: it only acts
 * while an agent is in the "idle" phase (seated, working), and moves it by
 * setting the store path the animation system already follows (arrivals in
 * the idle phase trigger no machine events). The desk stays reserved.
 *
 * Departure safety: when the backend removes a hero that is away, the REMOVE
 * is held until the hero is back at its desk (see holdDepartureUntilHome),
 * because the machine's departure walk uses the hall-only A* grid.
 */
import { useGameStore } from "@/stores/gameStore";
import { calculatePath } from "./pathfinding";
import type { Position } from "@/types";
import { toolCategoryFromBubbleIcon } from "@/dungeon/tool-activity";
import { ZONE_STATIONS } from "@/dungeon/world-ambience-layout";
import type { ZoneId } from "@/dungeon/dungeon-world-layout";
import {
  buildZonePath,
  desiredZone,
  MIN_STAY_MS,
  TARGET_STABLE_MS,
  ZONE_ROUTES,
  zoneForToolCategory,
  type WorkZoneId,
} from "@/dungeon/zone-routing";

type ExcursionStatus = "going" | "away" | "returning";

interface Excursion {
  zone: WorkZoneId;
  stationIndex: number;
  /** Outbound waypoints desk → station; reversed for the way back. */
  path: Position[];
  status: ExcursionStatus;
  arrivedAt: number;
  /** Set when a departure is waiting for this hero to be home. */
  onHome: (() => void) | null;
}

interface RuleTracker {
  lastToolZone: ZoneId | null;
  lastToolAt: number;
  waitingSince: number | null;
  candidate: ZoneId;
  candidateSince: number;
}

const excursions = new Map<string, Excursion>();
const trackers = new Map<string, RuleTracker>();

/** Current room of a hero ("guild-hall" when at its desk). */
export function heroZone(agentId: string): ZoneId {
  return excursions.get(agentId)?.zone ?? "guild-hall";
}

function setWalk(agentId: string, waypoints: Position[]): void {
  const store = useGameStore.getState();
  store.updateAgentTarget(agentId, waypoints[waypoints.length - 1]);
  store.updateAgentPath(agentId, { waypoints, currentIndex: 0, progress: 0 });
}

function freeStation(zone: WorkZoneId): number | null {
  const taken = new Set([...excursions.values()].map((e) => e.stationIndex));
  const index = ZONE_STATIONS.findIndex((s, i) => s.zoneId === zone && !taken.has(i));
  return index >= 0 ? index : null;
}

/** Wait this long before retrying a trip that could not start (full room, blocked door). */
const ROUTE_RETRY_MS = 2000;
const retryAt = new Map<string, number>();

/** Set off for a free station in `zone`; false if the room is full or the door unreachable. */
function startGoing(agentId: string, from: Position, zone: WorkZoneId, now: number): boolean {
  const stationIndex = freeStation(zone);
  if (stationIndex === null) return false; // room full: keep working at the desk
  const station = ZONE_STATIONS[stationIndex];
  const hallPath = calculatePath(from, ZONE_ROUTES[zone].hallDoor, agentId);
  const path = buildZonePath(hallPath, zone, { x: station.x, y: station.y });
  if (!path) return false; // hall door blocked right now
  excursions.set(agentId, { zone, stationIndex, path, status: "going", arrivedAt: now, onHome: null });
  setWalk(agentId, path);
  return true;
}

function startReturning(agentId: string, ex: Excursion): void {
  ex.status = "returning";
  setWalk(agentId, [...ex.path].reverse());
}

function finishHome(agentId: string, ex: Excursion): void {
  excursions.delete(agentId);
  ex.onHome?.();
}

/** Track tool pulls / waiting time and return the debounced target room. */
function stableTarget(agentId: string, agent: AgentLike, now: number): ZoneId {
  const tr: RuleTracker = trackers.get(agentId) ?? {
    lastToolZone: null,
    lastToolAt: 0,
    waitingSince: null,
    candidate: "guild-hall",
    candidateSince: now,
  };
  const toolZone = zoneForToolCategory(toolCategoryFromBubbleIcon(agent.bubbleIcon));
  if (toolZone) {
    tr.lastToolZone = toolZone;
    tr.lastToolAt = now;
  }
  tr.waitingSince = agent.backendState === "waiting" ? (tr.waitingSince ?? now) : null;
  const desired = desiredZone({
    agentType: agent.agentType,
    lastToolZone: tr.lastToolZone,
    lastToolAt: tr.lastToolAt,
    waitingSince: tr.waitingSince,
    now,
  });
  if (desired !== tr.candidate) {
    tr.candidate = desired;
    tr.candidateSince = now;
  }
  trackers.set(agentId, tr);
  return now - tr.candidateSince >= TARGET_STABLE_MS ? tr.candidate : heroZone(agentId);
}

interface AgentLike {
  agentType: string | null;
  backendState: string;
  bubbleIcon: string | null | undefined;
}

/** One routing step for every hero; call a few times per second. */
export function tickZoneExcursions(now: number = Date.now()): void {
  const { agents } = useGameStore.getState();

  for (const id of new Set([...excursions.keys(), ...trackers.keys()])) {
    if (!agents.has(id)) {
      excursions.delete(id);
      trackers.delete(id);
      retryAt.delete(id);
    }
  }

  for (const [id, agent] of agents) {
    const ex = excursions.get(id);
    if (agent.phase !== "idle") {
      // The machine owns this hero now (arriving, departing, reset).
      excursions.delete(id);
      continue;
    }
    const target = stableTarget(
      id,
      { agentType: agent.agentType, backendState: agent.backendState, bubbleIcon: agent.bubble.content?.icon },
      now,
    );

    // A departure arrived while still walking out: turn around where it stands.
    if (ex?.status === "going" && ex.onHome && agent.path) {
      ex.status = "returning";
      setWalk(id, [agent.currentPosition, ...ex.path.slice(0, agent.path.currentIndex + 1).reverse()]);
      continue;
    }
    if (agent.path) continue; // still walking

    if (!ex) {
      // No desk (backend cleared it): nowhere to come back to, stay put.
      if (target !== "guild-hall" && agent.desk !== null && now >= (retryAt.get(id) ?? 0)) {
        if (!startGoing(id, agent.currentPosition, target, now)) retryAt.set(id, now + ROUTE_RETRY_MS);
      }
      continue;
    }
    if (ex.status === "going") {
      ex.status = "away";
      ex.arrivedAt = now;
    }
    if (ex.status === "returning") {
      finishHome(id, ex);
      continue;
    }
    // Away: go home for a departure, when the desk was taken away, or when
    // the work moved elsewhere.
    if (ex.onHome || agent.desk === null || (target !== ex.zone && now - ex.arrivedAt >= MIN_STAY_MS)) {
      startReturning(id, ex);
    }
  }
}

/**
 * If the hero is away from its desk, walk it home and call `depart` once it
 * is seated again. Returns false when the hero is already home.
 */
export function holdDepartureUntilHome(agentId: string, depart: () => void): boolean {
  const ex = excursions.get(agentId);
  if (!ex) return false;
  ex.onHome = depart;
  return true;
}

/** Forget all excursions (session switch / HMR soft reset). */
export function resetZoneExcursions(): void {
  excursions.clear();
  trackers.clear();
  retryAt.clear();
}
