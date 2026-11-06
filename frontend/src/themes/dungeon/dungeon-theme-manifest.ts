/**
 * Dungeon Guild theme: the main agent is the Guild Master, subagents are
 * adventurer classes, office props become dungeon props.
 *
 * Phase 02 skeleton: no texture overrides yet, so every slot falls back to
 * the office sprites. Phase 04 (environment) and 05 (characters) fill this in
 * from the CC0 atlas at /themes/dungeon/dungeon-tileset.{png,json}.
 */
import type { ThemeManifest } from "../theme-types";

export const DUNGEON_TILESET_IMAGE = "/themes/dungeon/dungeon-tileset.png";

export const dungeonThemeManifest: ThemeManifest = {
  id: "dungeon",
  nameKey: "theme.dungeon.name",
  descriptionKey: "theme.dungeon.description",
  texturePaths: {},
};
