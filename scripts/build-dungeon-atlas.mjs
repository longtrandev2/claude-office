#!/usr/bin/env node
/**
 * Build the PixiJS spritesheet atlas for the "dungeon" theme from the
 * 0x72 DungeonTileset II pack (CC0).
 *
 * Input : extracted pack dir containing `0x72_DungeonTilesetII_v*.png`
 *         and `tile_list_v*` (one sprite per line: `name x y w h`).
 * Output: frontend/public/themes/dungeon/dungeon-tileset.png  (copied sheet)
 *         frontend/public/themes/dungeon/dungeon-tileset.json (Pixi v8 spritesheet)
 *
 * Animations: frames named `<base>[_anim]_f<N>` are grouped into
 * `animations[<base>]` ordered by N (e.g. `knight_m_idle_anim_f0..3` → `knight_m_idle`).
 *
 * Usage: node scripts/build-dungeon-atlas.mjs [packDir]
 *        packDir defaults to assets-src/dungeon/0x72_DungeonTilesetII_v1.7
 *
 * Pure Node (no deps) so it runs on Windows without ImageMagick.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packDir = resolve(process.argv[2] ?? join(repoRoot, "assets-src/dungeon/0x72_DungeonTilesetII_v1.7"));
const outDir = join(repoRoot, "frontend/public/themes/dungeon");
const OUT_IMAGE = "dungeon-tileset.png";
const OUT_JSON = "dungeon-tileset.json";

// Matches animation frames: "knight_m_idle_anim_f2" → base "knight_m_idle", index 2.
const ANIM_FRAME_RE = /^(.+?)(?:_anim)?_f(\d+)$/;

/** Find the single file in dir whose name matches the regex, or fail loudly. */
function findOne(dir, regex, label) {
  const hits = readdirSync(dir).filter((f) => regex.test(f));
  if (hits.length !== 1) {
    throw new Error(`Expected exactly one ${label} in ${dir}, found: ${hits.join(", ") || "none"}`);
  }
  return join(dir, hits[0]);
}

/** Read width/height from a PNG IHDR chunk (bytes 16..23, big-endian). */
function readPngSize(file) {
  const buf = readFileSync(file);
  const PNG_SIG = "89504e470d0a1a0a";
  if (buf.subarray(0, 8).toString("hex") !== PNG_SIG) throw new Error(`Not a PNG: ${file}`);
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

/** Parse `name x y w h` lines; validates numbers and sheet bounds. */
function parseTileList(file, sheet) {
  const frames = {};
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    const parts = line.trim().split(/\s+/);
    if (parts.length === 1 && parts[0] === "") return; // blank line
    if (parts.length !== 5) throw new Error(`tile list line ${i + 1}: expected 5 fields, got "${line}"`);
    const [name, ...nums] = parts;
    const [x, y, w, h] = nums.map(Number);
    if ([x, y, w, h].some((n) => !Number.isInteger(n) || n < 0)) {
      throw new Error(`tile list line ${i + 1}: invalid numbers in "${line}"`);
    }
    if (x + w > sheet.w || y + h > sheet.h) {
      throw new Error(`tile list line ${i + 1}: "${name}" exceeds sheet bounds ${sheet.w}x${sheet.h}`);
    }
    if (frames[name]) throw new Error(`tile list line ${i + 1}: duplicate sprite "${name}"`);
    frames[name] = {
      frame: { x, y, w, h },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w, h },
      sourceSize: { w, h },
    };
  });
  return frames;
}

/** Group numbered frames into ordered animation lists (only groups with ≥2 frames). */
function buildAnimations(frameNames) {
  const groups = {};
  for (const name of frameNames) {
    const m = ANIM_FRAME_RE.exec(name);
    if (!m) continue;
    (groups[m[1]] ??= []).push({ name, index: Number(m[2]) });
  }
  const animations = {};
  for (const [base, list] of Object.entries(groups)) {
    if (list.length < 2) continue;
    animations[base] = list.sort((a, b) => a.index - b.index).map((f) => f.name);
  }
  return animations;
}

function main() {
  if (!existsSync(packDir)) {
    throw new Error(`Pack dir not found: ${packDir}\nExtract the 0x72 zip into assets-src/dungeon/ first.`);
  }
  const sheetFile = findOne(packDir, /^0x72_DungeonTilesetII_v[\d.]+\.png$/, "tileset sheet");
  const listFile = findOne(packDir, /^tile_list_v[\d.]+$/, "tile list");

  const sheet = readPngSize(sheetFile);
  const frames = parseTileList(listFile, sheet);
  const animations = buildAnimations(Object.keys(frames));

  const atlas = {
    frames,
    animations,
    meta: {
      app: "claude-office scripts/build-dungeon-atlas.mjs",
      image: OUT_IMAGE,
      format: "RGBA8888",
      size: sheet,
      scale: "1",
      source: "0x72 DungeonTileset II (CC0) — https://0x72.itch.io/dungeontileset-ii",
    },
  };

  mkdirSync(outDir, { recursive: true });
  copyFileSync(sheetFile, join(outDir, OUT_IMAGE));
  writeFileSync(join(outDir, OUT_JSON), `${JSON.stringify(atlas, null, 2)}\n`);

  console.log(
    `Atlas built: ${Object.keys(frames).length} frames, ${Object.keys(animations).length} animations → ${outDir}`,
  );
}

try {
  main();
} catch (err) {
  console.error(`build-dungeon-atlas failed: ${err.message}`);
  process.exit(1);
}
