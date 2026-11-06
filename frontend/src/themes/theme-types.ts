/**
 * Theme system types.
 *
 * A theme is a visual skin over the same simulation: it decides which
 * textures, layout overrides and strings the office renders with, while the
 * engine (state machines, pathfinding, WebSocket events) stays shared.
 *
 * Keep this manifest minimal — add a field only when a phase needs it.
 */
import type { OfficeTextures } from "@/hooks/useOfficeTextures";
import type { TranslationKey } from "@/i18n/en";

export const THEME_IDS = ["office", "dungeon"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export interface ThemeManifest {
  id: ThemeId;
  /** i18n key for the theme's display name. */
  nameKey: TranslationKey;
  /** i18n key for a one-sentence description shown in the theme picker. */
  descriptionKey: TranslationKey;
  /**
   * Sprite path per office texture slot. Slots a theme does not override
   * fall back to the office theme's paths (see `resolveTexturePaths`).
   */
  texturePaths: Partial<Record<keyof OfficeTextures, string>>;
}
