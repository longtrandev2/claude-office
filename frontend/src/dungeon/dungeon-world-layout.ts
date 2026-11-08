/**
 * AgentDungeon world map: the Guild Hall in the middle, task-zone wings on
 * both sides and a lower level (tavern + monster dungeon) below.
 *
 * World coordinates use the same canvas pixels as the hall, and the hall stays
 * at the world origin (0,0)–(HALL_WIDTH,HALL_HEIGHT). That keeps every engine
 * coordinate (nav grid, desks, queues, portal) valid without offsets; the
 * wings sit at negative x and beyond HALL_WIDTH, the lower level below
 * HALL_HEIGHT.
 *
 * Zones are drafts (phase 9): names, art and stations come in M2, routing
 * between zones in M3. Here they only define the world shape.
 */
import { HALL_HEIGHT, HALL_TILE, HALL_WALL_HEIGHT, HALL_WIDTH } from "./dungeon-hall-layout";
import type { TranslationKey } from "@/i18n";

export type ZoneId =
  | "guild-hall"
  | "library"
  | "forge"
  | "war-room"
  | "review-chamber"
  | "tavern"
  | "dungeon";

export interface WorldRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WorldZone {
  id: ZoneId;
  /** Room rectangle in world pixels (multiples of HALL_TILE). */
  rect: WorldRect;
  /** Back wall height inside the room. */
  wallHeight: number;
  /** i18n key of the zone's name plate. */
  nameKey: TranslationKey;
  /** Baked ambient darkness (deeper rooms are darker). */
  darkness: string;
  /** Seed for the room's floor/wall variation. */
  seed: number;
}

/** Width of each side wing (16 tiles). */
export const WING_WIDTH = 16 * HALL_TILE;
/** Height of one wing room: each wing stacks two rooms beside the hall. */
export const WING_ROOM_HEIGHT = HALL_HEIGHT / 2;
/** Height of the lower level (tavern + dungeon). */
export const LOWER_LEVEL_HEIGHT = 16 * HALL_TILE;
/** Back wall height of wing and lower-level rooms (3 brick rows). */
export const ZONE_WALL_HEIGHT = 3 * HALL_TILE;

const SURFACE_DARKNESS = "rgba(10, 7, 18, 0.5)";
const DEEP_DARKNESS = "rgba(6, 4, 12, 0.64)";

const LEFT_X = -WING_WIDTH;
const RIGHT_X = HALL_WIDTH;

export const WORLD_ZONES: WorldZone[] = [
  {
    id: "guild-hall",
    rect: { x: 0, y: 0, width: HALL_WIDTH, height: HALL_HEIGHT },
    wallHeight: HALL_WALL_HEIGHT,
    nameKey: "zone.guildHall",
    darkness: SURFACE_DARKNESS,
    seed: 0x6a11d,
  },
  {
    id: "library",
    rect: { x: LEFT_X, y: 0, width: WING_WIDTH, height: WING_ROOM_HEIGHT },
    wallHeight: ZONE_WALL_HEIGHT,
    nameKey: "zone.library",
    darkness: SURFACE_DARKNESS,
    seed: 0x11b2a,
  },
  {
    id: "forge",
    rect: { x: LEFT_X, y: WING_ROOM_HEIGHT, width: WING_WIDTH, height: WING_ROOM_HEIGHT },
    wallHeight: ZONE_WALL_HEIGHT,
    nameKey: "zone.forge",
    darkness: SURFACE_DARKNESS,
    seed: 0xf0a6e,
  },
  {
    id: "war-room",
    rect: { x: RIGHT_X, y: 0, width: WING_WIDTH, height: WING_ROOM_HEIGHT },
    wallHeight: ZONE_WALL_HEIGHT,
    nameKey: "zone.warRoom",
    darkness: SURFACE_DARKNESS,
    seed: 0x3a7c1,
  },
  {
    id: "review-chamber",
    rect: { x: RIGHT_X, y: WING_ROOM_HEIGHT, width: WING_WIDTH, height: WING_ROOM_HEIGHT },
    wallHeight: ZONE_WALL_HEIGHT,
    nameKey: "zone.reviewChamber",
    darkness: SURFACE_DARKNESS,
    seed: 0x5e71e,
  },
  {
    id: "tavern",
    rect: { x: LEFT_X, y: HALL_HEIGHT, width: WING_WIDTH, height: LOWER_LEVEL_HEIGHT },
    wallHeight: ZONE_WALL_HEIGHT,
    nameKey: "zone.tavern",
    darkness: SURFACE_DARKNESS,
    seed: 0x7a7e5,
  },
  {
    id: "dungeon",
    rect: { x: 0, y: HALL_HEIGHT, width: HALL_WIDTH + WING_WIDTH, height: LOWER_LEVEL_HEIGHT },
    wallHeight: ZONE_WALL_HEIGHT,
    nameKey: "zone.dungeon",
    darkness: DEEP_DARKNESS,
    seed: 0xd0e6e,
  },
];

/** Zones baked by the world background (the hall has its own composer). */
export const OUTER_ZONES = WORLD_ZONES.filter((z) => z.id !== "guild-hall");

/** Bounding box of the whole world in world pixels. */
export const WORLD_BOUNDS = {
  minX: Math.min(...WORLD_ZONES.map((z) => z.rect.x)),
  minY: Math.min(...WORLD_ZONES.map((z) => z.rect.y)),
  maxX: Math.max(...WORLD_ZONES.map((z) => z.rect.x + z.rect.width)),
  maxY: Math.max(...WORLD_ZONES.map((z) => z.rect.y + z.rect.height)),
};

/** The hall rectangle, used to frame the default camera view. */
export const HALL_RECT: WorldRect = { x: 0, y: 0, width: HALL_WIDTH, height: HALL_HEIGHT };
