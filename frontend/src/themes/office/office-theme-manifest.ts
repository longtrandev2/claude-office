/**
 * The original claude-office look. Its texture paths are the baseline every
 * other theme falls back to for slots it does not override.
 */
import type { OfficeTextures } from "@/hooks/useOfficeTextures";
import type { ThemeManifest } from "../theme-types";

export const OFFICE_TEXTURE_PATHS: Record<keyof OfficeTextures, string> = {
  floorTile: "/sprites/floor-tile.png",
  bossRug: "/sprites/boss-rug.png",
  waterCooler: "/sprites/watercooler.png",
  coffeeMachine: "/sprites/coffee-machine.png",
  plant: "/sprites/plant.png",
  chair: "/sprites/chair.png",
  desk: "/sprites/desk.png",
  keyboard: "/sprites/keyboard_back.png",
  monitor: "/sprites/monitor_back.png",
  phone: "/sprites/phone.png",
  printer: "/sprites/old-printer.png",
  elevatorFrame: "/sprites/elevator_frame.png",
  elevatorDoor: "/sprites/elevator_door.png",
  wallOutlet: "/sprites/wall-outlet.png",
  employeeOfMonth: "/sprites/employee-of-month.png",
  headset: "/sprites/headset_small.png",
  sunglasses: "/sprites/sunglasses.png",
  coffeeMug: "/sprites/coffee-mug.png",
  stapler: "/sprites/stapler.png",
  deskLamp: "/sprites/desk-lamp.png",
  penHolder: "/sprites/pen-holder.png",
  magic8Ball: "/sprites/magic-8-ball.png",
  rubiksCube: "/sprites/rubiks-cube.png",
  rubberDuck: "/sprites/rubber-duck.png",
  thermos: "/sprites/thermos.png",
};

export const officeThemeManifest: ThemeManifest = {
  id: "office",
  nameKey: "theme.office.name",
  descriptionKey: "theme.office.description",
  texturePaths: OFFICE_TEXTURE_PATHS,
};
