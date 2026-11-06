import { describe, expect, it } from "vitest";
import en from "@/i18n/en";
import es from "@/i18n/es";
import ptBR from "@/i18n/pt-BR";
import {
  DEFAULT_THEME_ID,
  getThemeManifest,
  isThemeId,
  listThemes,
  resolveTexturePaths,
} from "@/themes/theme-registry";
import { OFFICE_TEXTURE_PATHS } from "@/themes/office/office-theme-manifest";
import { THEME_IDS } from "@/themes/theme-types";

describe("theme registry", () => {
  it("accepts only known theme ids", () => {
    expect(isThemeId("office")).toBe(true);
    expect(isThemeId("dungeon")).toBe(true);
    expect(isThemeId("")).toBe(false);
    expect(isThemeId("../sprites")).toBe(false);
    expect(isThemeId(undefined)).toBe(false);
    expect(isThemeId(42)).toBe(false);
  });

  it("defaults to a registered theme", () => {
    expect(isThemeId(DEFAULT_THEME_ID)).toBe(true);
  });

  it("lists every theme id exactly once, with matching manifest ids", () => {
    const ids = listThemes().map((m) => m.id);
    expect(ids).toEqual([...THEME_IDS]);
    THEME_IDS.forEach((id) => expect(getThemeManifest(id).id).toBe(id));
  });

  it("office theme resolves to the original sprite paths", () => {
    expect(resolveTexturePaths("office")).toEqual(OFFICE_TEXTURE_PATHS);
  });

  it("every theme resolves a path for every texture slot", () => {
    for (const id of THEME_IDS) {
      const paths = resolveTexturePaths(id);
      expect(Object.keys(paths).sort()).toEqual(Object.keys(OFFICE_TEXTURE_PATHS).sort());
      Object.values(paths).forEach((p) => expect(p.startsWith("/")).toBe(true));
    }
  });

  it("theme name and description keys exist in every locale", () => {
    for (const manifest of listThemes()) {
      for (const dict of [en, es, ptBR] as Record<string, string>[]) {
        expect(dict[manifest.nameKey]).toBeTruthy();
        expect(dict[manifest.descriptionKey]).toBeTruthy();
      }
    }
  });
});
