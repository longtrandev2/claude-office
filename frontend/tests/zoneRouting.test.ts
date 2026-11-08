import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/stores/gameStore";
import { calculatePath } from "@/systems/pathfinding";
import { getNavigationGrid } from "@/systems/navigationGrid";
import { getDeskPosition } from "@/systems/queuePositions";
import {
  holdDepartureUntilHome,
  heroZone,
  resetZoneExcursions,
  tickZoneExcursions,
} from "@/systems/zoneExcursions";
import {
  desiredZone,
  homeZoneForAgentType,
  TAVERN_AFTER_WAITING_MS,
  TARGET_STABLE_MS,
  TOOL_PULL_HOLD_MS,
  ZONE_ROUTES,
  type WorkZoneId,
} from "@/dungeon/zone-routing";
import { ZONE_STATIONS } from "@/dungeon/world-ambience-layout";
import { WORLD_ZONES } from "@/dungeon/dungeon-world-layout";
import type { Agent } from "@/types";

const rule = (over: Partial<Parameters<typeof desiredZone>[0]>) =>
  desiredZone({ agentType: null, lastToolZone: null, lastToolAt: 0, waitingSince: null, now: 100_000, ...over });

describe("zone rule (hybrid)", () => {
  it("agent type sets the home room; unknown types stay in the hall", () => {
    expect(homeZoneForAgentType("planner")).toBe("war-room");
    expect(homeZoneForAgentType("ck:researcher")).toBe("library");
    expect(homeZoneForAgentType("Explore")).toBe("library");
    expect(homeZoneForAgentType("tester")).toBe("dungeon");
    expect(homeZoneForAgentType("general-purpose")).toBe("guild-hall");
    expect(homeZoneForAgentType(null)).toBe("guild-hall");
  });

  it("a recent tool pulls the hero to its room, then it goes home", () => {
    expect(rule({ agentType: "planner", lastToolZone: "forge", lastToolAt: 99_000 })).toBe("forge");
    expect(rule({ agentType: "planner", lastToolZone: "forge", lastToolAt: 100_000 - TOOL_PULL_HOLD_MS })).toBe(
      "war-room",
    );
  });

  it("waiting long sends the hero to the tavern", () => {
    expect(rule({ agentType: "planner", waitingSince: 100_000 - TAVERN_AFTER_WAITING_MS })).toBe("tavern");
    expect(rule({ agentType: "planner", waitingSince: 99_000 })).toBe("war-room");
  });
});

describe("zone paths", () => {
  const doors = Object.values(ZONE_ROUTES).map((r) => r.hallDoor);

  it("every hall door is a walkable tile", () => {
    const grid = getNavigationGrid();
    for (const d of doors) {
      const { gx, gy } = grid.worldToGrid(d.x, d.y);
      expect(grid.isWalkable(gx, gy), `${d.x},${d.y}`).toBe(true);
    }
  });

  it("every desk (4 rows) can reach every hall door", () => {
    for (let desk = 1; desk <= 16; desk++) {
      const from = getDeskPosition(desk);
      for (const d of doors) {
        const path = calculatePath(from, d);
        expect(path.length, `desk ${desk} → ${d.x},${d.y}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("corridors end inside their room", () => {
    for (const [zoneId, route] of Object.entries(ZONE_ROUTES) as [WorkZoneId, (typeof ZONE_ROUTES)[WorkZoneId]][]) {
      const entry = route.corridor[route.corridor.length - 1];
      const { rect } = WORLD_ZONES.find((z) => z.id === zoneId)!;
      expect(entry.x >= rect.x && entry.x < rect.x + rect.width, zoneId).toBe(true);
      expect(entry.y >= rect.y && entry.y < rect.y + rect.height, zoneId).toBe(true);
    }
  });
});

describe("zone excursions", () => {
  const T0 = 1_000_000;
  const desk = getDeskPosition(1);

  function seatAgent(id: string, overrides: Partial<Agent>): void {
    const store = useGameStore.getState();
    store.addAgent({ id, color: "#ff0000", number: 1, state: "working", desk: 1, ...overrides }, desk);
    store.updateAgentPhase(id, "idle");
  }

  /** Run the routing tick and let any walk finish instantly. */
  function step(now: number): void {
    tickZoneExcursions(now);
    const agents = useGameStore.getState().agents;
    for (const [id, a] of agents) {
      if (a.path) {
        useGameStore.getState().updateAgentPosition(id, a.path.waypoints[a.path.waypoints.length - 1]);
        useGameStore.getState().updateAgentPath(id, null);
      }
    }
  }

  beforeEach(() => {
    useGameStore.getState().reset();
    resetZoneExcursions();
  });

  it("a planner walks from its desk to a War Room station once its target is stable", () => {
    seatAgent("p", { agentType: "planner" });
    tickZoneExcursions(T0);
    expect(useGameStore.getState().agents.get("p")!.path).toBeNull(); // not stable yet
    tickZoneExcursions(T0 + TARGET_STABLE_MS);
    const walking = useGameStore.getState().agents.get("p")!;
    expect(walking.path).not.toBeNull();
    const end = walking.path!.waypoints[walking.path!.waypoints.length - 1];
    expect(ZONE_STATIONS.some((s) => s.zoneId === "war-room" && s.x === end.x && s.y === end.y)).toBe(true);
    expect(heroZone("p")).toBe("war-room");
  });

  it("a hall agent stays at its desk", () => {
    seatAgent("g", { agentType: "general-purpose" });
    step(T0);
    step(T0 + TARGET_STABLE_MS);
    expect(useGameStore.getState().agents.get("g")!.path).toBeNull();
    expect(heroZone("g")).toBe("guild-hall");
  });

  it("a departure waits until the hero is back at its desk", () => {
    seatAgent("t", { agentType: "tester" });
    step(T0);
    step(T0 + TARGET_STABLE_MS); // walks to the dungeon
    step(T0 + TARGET_STABLE_MS + 100); // arrives
    let departed = false;
    expect(holdDepartureUntilHome("t", () => (departed = true))).toBe(true);
    step(T0 + TARGET_STABLE_MS + 200); // starts back (walk completes instantly)
    step(T0 + TARGET_STABLE_MS + 300); // seated again → departure released
    expect(departed).toBe(true);
    const back = useGameStore.getState().agents.get("t")!.currentPosition;
    expect(back).toEqual(desk);
    expect(holdDepartureUntilHome("t", () => undefined)).toBe(false);
  });

  it("a departure during the walk out turns the hero around where it stands", () => {
    seatAgent("w", { agentType: "tester" });
    tickZoneExcursions(T0);
    tickZoneExcursions(T0 + TARGET_STABLE_MS); // sets off
    const store = useGameStore.getState();
    const out = store.agents.get("w")!.path!;
    const mid = out.waypoints[2];
    store.updateAgentPosition("w", mid);
    store.updateAgentPath("w", { ...out, currentIndex: 2, progress: 0 });
    let departed = false;
    holdDepartureUntilHome("w", () => (departed = true));
    tickZoneExcursions(T0 + TARGET_STABLE_MS + 100);
    const back = useGameStore.getState().agents.get("w")!.path!;
    expect(back.waypoints[0]).toEqual(mid);
    expect(back.waypoints[back.waypoints.length - 1]).toEqual(desk);
    step(T0 + TARGET_STABLE_MS + 200); // walk completes, then seated
    step(T0 + TARGET_STABLE_MS + 300);
    expect(departed).toBe(true);
  });

  it("a hero whose desk was cleared while away walks back instead of being stranded", () => {
    seatAgent("d", { agentType: "tester" });
    step(T0);
    step(T0 + TARGET_STABLE_MS);
    step(T0 + TARGET_STABLE_MS + 100); // at the dungeon station
    expect(heroZone("d")).toBe("dungeon");
    const a = useGameStore.getState().agents.get("d")!;
    useGameStore.setState({ agents: new Map([["d", { ...a, desk: null }]]) });
    step(T0 + TARGET_STABLE_MS + 200); // heads home
    step(T0 + TARGET_STABLE_MS + 300);
    expect(heroZone("d")).toBe("guild-hall");
    expect(useGameStore.getState().agents.get("d")!.currentPosition).toEqual(desk);
  });
});
