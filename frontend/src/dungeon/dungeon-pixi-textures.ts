/**
 * Pixi texture helpers for the dungeon atlas: nearest-sampled textures for
 * atlas frames ("wall_mid") and standalone props ("prop:barrel"), cached so
 * every component shares the same GPU sources.
 */
import { Rectangle, Texture, type TextureSource } from "pixi.js";
import type { DungeonAtlas } from "./dungeon-atlas";

let sheetSource: TextureSource | null = null;
const cache = new Map<string, Texture>();

function getSheetSource(atlas: DungeonAtlas): TextureSource {
  if (!sheetSource) {
    sheetSource = Texture.from(atlas.image).source;
    sheetSource.scaleMode = "nearest";
  }
  return sheetSource;
}

/** Texture for an atlas frame name or a "prop:<name>" image. Throws if unknown. */
export function getDungeonTexture(atlas: DungeonAtlas, name: string): Texture {
  const cached = cache.get(name);
  if (cached) return cached;

  let tex: Texture;
  if (name.startsWith("prop:")) {
    const img = atlas.props[name.slice(5)];
    if (!img) throw new Error(`Unknown dungeon prop "${name}"`);
    tex = Texture.from(img);
    tex.source.scaleMode = "nearest";
  } else {
    const f = atlas.frames[name];
    if (!f) throw new Error(`Unknown atlas frame "${name}"`);
    tex = new Texture({ source: getSheetSource(atlas), frame: new Rectangle(f.x, f.y, f.w, f.h) });
  }
  cache.set(name, tex);
  return tex;
}
