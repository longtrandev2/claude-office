/**
 * What a hero is doing right now, derived from the backend's tool bubble.
 *
 * The backend tags each tool-use thought bubble with an icon per tool
 * (backend/app/core/state_machine.py `_TOOL_ICONS`). We map that tag to a
 * tool category and draw our own 7×7 pixel icon for it, instead of emoji.
 */

export type ToolCategory = "read" | "search" | "write" | "bash" | "web" | "task";

/** Backend tool-bubble icon → category. Unknown icons mean "no tool shown". */
const ICON_CATEGORY: Record<string, ToolCategory> = {
  "📖": "read",
  "🔍": "search",
  "🔎": "search",
  "✍️": "write",
  "📝": "write",
  "💻": "bash",
  "🌐": "web",
  "📥": "web",
  "🎯": "task",
};

export function toolCategoryFromBubbleIcon(icon: string | null | undefined): ToolCategory | null {
  return icon ? (ICON_CATEGORY[icon] ?? null) : null;
}

/** Colours from the hall palette (parchment, gold, arcane teal, crimson). */
export const TOOL_COLORS: Record<ToolCategory, number> = {
  read: 0xe8d5a6,
  search: 0xd9c9a3,
  write: 0xf2b442,
  bash: 0x8ee6d0,
  web: 0x5fc1b5,
  task: 0xc94c4c,
};

/** Hand-drawn 7×7 icons: '#' = icon colour, '.' = empty. */
export const TOOL_ICON_BITMAPS: Record<ToolCategory, readonly string[]> = {
  // open book
  read: ["##...##", "#.#.#.#", "#.#.#.#", "#.#.#.#", "#.#.#.#", "##.#.##", "...#..."],
  // magnifier
  search: [".###...", "#...#..", "#...#..", "#...#..", ".###...", "....##.", ".....##"],
  // quill
  write: ["......#", ".....##", "....###", "...###.", "..##...", ".#.....", "#......"],
  // rune
  bash: ["...#...", "..###..", ".##.##.", ".#...#.", ".##.##.", "..###..", "...#..."],
  // scrying orb
  web: ["..###..", ".#.#.#.", "#..#..#", "#######", "#..#..#", ".#.#.#.", "..###.."],
  // quest scroll
  task: ["#####..", "#...##.", "#....#.", "#.##.#.", "#....#.", "######.", "......."],
};
