/**
 * Registry of available themes and helpers to resolve them safely.
 * Theme ids coming from storage/backend are untrusted strings — always go
 * through `isThemeId` before use; never build asset paths from them.
 */
import type { OfficeTextures } from "@/hooks/useOfficeTextures";
import { dungeonThemeManifest } from "./dungeon/dungeon-theme-manifest";
import {
  OFFICE_TEXTURE_PATHS,
  officeThemeManifest,
} from "./office/office-theme-manifest";
import { THEME_IDS, type ThemeId, type ThemeManifest } from "./theme-types";

/** Default for a first launch in this fork (user decision 2026-11-06). */
export const DEFAULT_THEME_ID: ThemeId = "dungeon";

const MANIFESTS: Record<ThemeId, ThemeManifest> = {
  office: officeThemeManifest,
  dungeon: dungeonThemeManifest,
};

export function isThemeId(value: unknown): value is ThemeId {
  return (
    typeof value === "string" && (THEME_IDS as readonly string[]).includes(value)
  );
}

export function getThemeManifest(id: ThemeId): ThemeManifest {
  return MANIFESTS[id];
}

export function listThemes(): ThemeManifest[] {
  return THEME_IDS.map((id) => MANIFESTS[id]);
}

/** Full texture path map for a theme: its overrides on top of office paths. */
export function resolveTexturePaths(
  id: ThemeId,
): Record<keyof OfficeTextures, string> {
  return { ...OFFICE_TEXTURE_PATHS, ...MANIFESTS[id].texturePaths };
}
