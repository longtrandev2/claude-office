/**
 * Furnishing of the task-zone rooms (phase 9 M2), in ROOM-LOCAL canvas pixels
 * (0,0 = the room's top-left; wing rooms 768x512, lower rooms 768/2048x768,
 * back wall 144 px). Every piece says what the room is for:
 *
 * - Library (research/read/search): book shelves, reading rug, scrying globes
 * - Forge (write/edit code): lava furnace, weapons on the wall, quench barrels
 * - War Room (plan/brainstorm): guild banners, red rug, plans and coin
 * - Review Chamber (code review): the glowing truth chest, blue banners
 * - Tavern (idle/done): wine cabinets, barrels, drinks on the tables
 * - Dungeon (debug/test): stairwell from the hall, cells, levers and bombs
 *
 * Lights only sit on real sources (candle, torch, furnace, chest glow).
 * Stations are where heroes will work once routing lands (M3); they use the
 * same table as the hall so a station reads the same everywhere.
 */
import type { HallAnimatedDecor, HallDecor, HallLight } from "./dungeon-hall-layout";
import type { RoomDoorway, RoomRug } from "./dungeon-room-painter";
import type { ZoneId } from "./dungeon-world-layout";

/** A hero work spot: hero origin (like a hall desk) + the item on its table. */
export interface ZoneStation {
  x: number;
  y: number;
  item: string;
}

export interface ZoneRoomDecor {
  rugs: RoomRug[];
  /** "prop:three-tier-shelf" positions whose compartments get painted books. */
  bookShelves: { x: number; y: number }[];
  /** Static decoration (wall + floor), baked into the room texture. */
  decor: HallDecor[];
  /** Animated decoration; frame 0 is baked too, the ambience layer cycles it. */
  animated: HallAnimatedDecor[];
  lights: HallLight[];
  stations: ZoneStation[];
  /** Side-wall openings heroes walk through (see zone-routing.ts). */
  doorways: RoomDoorway[];
  /** Stairs down through the back wall at this x (dungeon only). */
  stairwellX?: number;
}

const WALL_CANDLE = ["prop:wall-candle-f0", "prop:wall-candle-f1", "prop:wall-candle-f2"];
const WALL_TORCH = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `prop:wall-torch-f${i}`);

const CANDLE_LIGHT = 0xffb35c;
const TORCH_LIGHT = 0xffa040;
const FURNACE_LIGHT = 0xff6a3d;
const CHEST_GLOW = 0x5fc1b5;

/** Wall candle at (x, y) + its light pool at the flame. */
function candle(x: number, y: number, i: number) {
  return {
    animated: { frames: WALL_CANDLE, x, y, frameMs: 120 + i * 17 },
    light: { x: x + 9, y: y + 6, radius: 84, color: CANDLE_LIGHT },
  };
}

/** Wall torch at (x, y) + its light pool at the flame. */
function torch(x: number, y: number, i: number, radius = 120) {
  return {
    animated: { frames: WALL_TORCH, x, y, frameMs: 90 + i * 11 },
    light: { x: x + 24, y: y + 15, radius, color: TORCH_LIGHT },
  };
}

/** Four stations in two rows, left and right of a central rug (wing rooms). */
function wingStations(items: string[]): ZoneStation[] {
  const spots = [
    { x: 213, y: 252 },
    { x: 555, y: 252 },
    { x: 213, y: 402 },
    { x: 555, y: 402 },
  ];
  return spots.map((s, i) => ({ ...s, item: items[i % items.length] }));
}

const libraryCandles = [candle(246, 54, 0), candle(501, 54, 1)];
const forgeTorch = torch(516, 45, 0, 96);
const warRoomTorch = torch(360, 40, 0);
const reviewCandles = [candle(246, 54, 2), candle(501, 54, 3)];
const tavernTorches = [torch(288, 45, 1, 130), torch(456, 45, 2, 130)];
const dungeonTorches = [torch(288, 45, 3, 110), torch(888, 45, 4, 110), torch(1680, 45, 5, 110)];

export const ZONE_ROOM_DECOR: Partial<Record<ZoneId, ZoneRoomDecor>> = {
  library: {
    rugs: [{ x: 294, y: 168, width: 180, height: 312, color: "#7a6650", edgeColor: "#3f3024", trimColor: "#d8c08a" }],
    bookShelves: [
      { x: 51, y: 36 },
      { x: 306, y: 36 },
      { x: 561, y: 36 },
    ],
    decor: [
      { sprite: "prop:tall-pot", x: 60, y: 414 },
      { sprite: "prop:pot", x: 663, y: 432 },
    ],
    animated: libraryCandles.map((c) => c.animated),
    lights: libraryCandles.map((c) => c.light),
    // Notes from reading, globes for web scrying.
    stations: wingStations(["prop:ink-feather", "prop:globe", "prop:globe", "prop:ink-feather"]),
    doorways: [{ side: "right", y: 336 }],
  },

  forge: {
    rugs: [],
    bookShelves: [],
    decor: [
      { sprite: "prop:lava-furnace", x: 312, y: 0 },
      // Finished work hung on the wall.
      { sprite: "weapon_double_axe", x: 84, y: 42 },
      { sprite: "weapon_hammer", x: 150, y: 42 },
      { sprite: "weapon_waraxe", x: 198, y: 45 },
      { sprite: "weapon_spear", x: 252, y: 30 },
      // Quench barrel and stock beside the furnace.
      { sprite: "prop:barrel", x: 594, y: 81 },
      { sprite: "crate", x: 657, y: 78 },
    ],
    animated: [forgeTorch.animated],
    lights: [{ x: 384, y: 108, radius: 150, color: FURNACE_LIGHT }, forgeTorch.light],
    stations: wingStations(["weapon_hammer", "weapon_regular_sword", "weapon_axe", "weapon_knife"]),
    doorways: [{ side: "right", y: 240 }],
  },

  "war-room": {
    rugs: [{ x: 282, y: 168, width: 204, height: 312, color: "#6b2433", edgeColor: "#43141f", trimColor: "#b8892f" }],
    bookShelves: [],
    decor: [
      { sprite: "wall_banner_red", x: 120, y: 48 },
      { sprite: "wall_banner_blue", x: 216, y: 48 },
      { sprite: "wall_banner_blue", x: 504, y: 48 },
      { sprite: "wall_banner_red", x: 600, y: 48 },
    ],
    animated: [warRoomTorch.animated],
    lights: [warRoomTorch.light],
    // Plans being written, the map of the campaign, the budget.
    stations: wingStations(["prop:ink-feather", "prop:globe", "coin_anim_f0", "prop:ink-feather"]),
    doorways: [{ side: "left", y: 336 }],
  },

  "review-chamber": {
    rugs: [{ x: 294, y: 168, width: 180, height: 312, color: "#2f3550", edgeColor: "#1c2033", trimColor: "#5698cc" }],
    bookShelves: [],
    decor: [
      { sprite: "prop:truth-chest", x: 345, y: 87 },
      { sprite: "wall_banner_blue", x: 120, y: 48 },
      { sprite: "wall_banner_blue", x: 600, y: 48 },
    ],
    animated: reviewCandles.map((c) => c.animated),
    lights: [{ x: 385, y: 120, radius: 72, color: CHEST_GLOW }, ...reviewCandles.map((c) => c.light)],
    stations: wingStations(["prop:ink-feather", "flask_blue", "flask_blue", "prop:ink-feather"]),
    doorways: [{ side: "left", y: 240 }],
  },

  tavern: {
    rugs: [{ x: 132, y: 246, width: 504, height: 372, color: "#5a3a26", edgeColor: "#2e1d14", trimColor: "#b8892f" }],
    bookShelves: [],
    decor: [
      { sprite: "prop:wine-cabinet", x: 72, y: 87 },
      { sprite: "prop:wine-cabinet", x: 126, y: 87 },
      { sprite: "prop:barrel", x: 582, y: 81 },
      { sprite: "prop:barrel", x: 642, y: 81 },
      { sprite: "prop:pot", x: 60, y: 660 },
      { sprite: "prop:tall-pot", x: 657, y: 648 },
    ],
    animated: tavernTorches.map((t) => t.animated),
    lights: tavernTorches.map((t) => t.light),
    stations: [
      { x: 192, y: 300, item: "flask_red" },
      { x: 384, y: 300, item: "coin_anim_f0" },
      { x: 576, y: 300, item: "flask_yellow" },
      { x: 192, y: 500, item: "flask_green" },
      { x: 384, y: 500, item: "flask_red" },
      { x: 576, y: 500, item: "coin_anim_f0" },
    ],
    doorways: [{ side: "right", y: 192 }],
  },

  dungeon: {
    rugs: [],
    bookShelves: [],
    decor: [
      { sprite: "crate", x: 60, y: 78 },
      { sprite: "crate", x: 108, y: 90 },
      { sprite: "prop:jail-cell", x: 1200, y: 39 },
      { sprite: "prop:jail-cell", x: 1320, y: 39 },
      { sprite: "prop:jail-cell", x: 1440, y: 39 },
      { sprite: "prop:jail-cell", x: 1560, y: 39 },
      { sprite: "hole", x: 1608, y: 498 },
      { sprite: "skull", x: 1212, y: 300 },
      { sprite: "skull", x: 1830, y: 612 },
      { sprite: "skull", x: 150, y: 690 },
    ],
    animated: dungeonTorches.map((t) => t.animated),
    lights: dungeonTorches.map((t) => t.light),
    // Test benches: levers and buttons to run things, bombs for the shell.
    stations: [
      { x: 300, y: 330, item: "lever_left" },
      { x: 492, y: 330, item: "bomb_f0" },
      { x: 684, y: 330, item: "button_red_up" },
      { x: 300, y: 540, item: "lever_right" },
      { x: 492, y: 540, item: "bomb_f0" },
      { x: 684, y: 540, item: "button_red_up" },
    ],
    doorways: [{ side: "left", y: 192 }],
    // Stairs down from the Guild Hall's bottom-right corner (hall x 1136).
    stairwellX: 1112,
  },
};
