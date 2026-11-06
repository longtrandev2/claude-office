/**
 * Hook for loading all office sprite textures.
 *
 * Centralizes texture loading logic and provides a clean interface
 * for accessing loaded textures throughout the office game.
 */

import { useState, useEffect } from "react";
import { Assets, Texture } from "pixi.js";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { resolveTexturePaths } from "@/themes/theme-registry";

export interface OfficeTextures {
  // Floor
  floorTile: Texture | null;
  bossRug: Texture | null;

  // Furniture
  waterCooler: Texture | null;
  coffeeMachine: Texture | null;
  plant: Texture | null;
  chair: Texture | null;
  desk: Texture | null;
  keyboard: Texture | null;
  monitor: Texture | null;
  phone: Texture | null;
  printer: Texture | null;

  // Elevator
  elevatorFrame: Texture | null;
  elevatorDoor: Texture | null;

  // Wall items
  wallOutlet: Texture | null;
  employeeOfMonth: Texture | null;

  // Agent accessories
  headset: Texture | null;
  sunglasses: Texture | null;

  // Desk accessories
  coffeeMug: Texture | null;
  stapler: Texture | null;
  deskLamp: Texture | null;
  penHolder: Texture | null;
  magic8Ball: Texture | null;
  rubiksCube: Texture | null;
  rubberDuck: Texture | null;
  thermos: Texture | null;
}

interface UseOfficeTexturesResult {
  textures: OfficeTextures;
  loaded: boolean;
}

// Texture paths live in the theme manifests (src/themes); the office theme is the
// baseline and other themes override individual slots.

const EMPTY_TEXTURES: OfficeTextures = {
  floorTile: null,
  bossRug: null,
  waterCooler: null,
  coffeeMachine: null,
  plant: null,
  chair: null,
  desk: null,
  keyboard: null,
  monitor: null,
  phone: null,
  printer: null,
  elevatorFrame: null,
  elevatorDoor: null,
  wallOutlet: null,
  employeeOfMonth: null,
  headset: null,
  sunglasses: null,
  coffeeMug: null,
  stapler: null,
  deskLamp: null,
  penHolder: null,
  magic8Ball: null,
  rubiksCube: null,
  rubberDuck: null,
  thermos: null,
};

/**
 * Hook to load all office sprite textures for the active theme.
 * Returns textures object and loaded state.
 */
export function useOfficeTextures(): UseOfficeTexturesResult {
  const theme = usePreferencesStore((s) => s.theme);
  const [textures, setTextures] = useState<OfficeTextures>(EMPTY_TEXTURES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Ignore results of a load that a newer theme switch has superseded.
    let cancelled = false;
    const texturePaths = resolveTexturePaths(theme);

    const loadTextures = async () => {
      try {
        const keys = Object.keys(texturePaths) as (keyof OfficeTextures)[];
        const paths = keys.map((key) => texturePaths[key]);

        const loadedTextures = await Promise.all(
          paths.map((path) => Assets.load(path)),
        );

        const textureMap = keys.reduce(
          (acc, key, index) => {
            acc[key] = loadedTextures[index];
            return acc;
          },
          {} as Record<keyof OfficeTextures, Texture>,
        );

        if (cancelled) return;
        setTextures(textureMap as OfficeTextures);
        setLoaded(true);
      } catch {
        // Still mark as loaded to show fallback graphics
        if (!cancelled) setLoaded(true);
      }
    };

    loadTextures();
    return () => {
      cancelled = true;
    };
  }, [theme]);

  return { textures, loaded };
}
