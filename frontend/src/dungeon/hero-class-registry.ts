/**
 * Hero classes of the guild and how agents map onto them.
 *
 * - The main agent is always the Guild Master.
 * - Subagents get a class from their Claude Code / ClaudeKit `agent_type`
 *   (e.g. "planner" → Cartographer). Unknown or missing types become Novices.
 * - Within a class the look (e.g. male/female sprite) is picked from a hash of
 *   the agent id, so the same agent always looks the same.
 *
 * Sprite bases are 0x72 atlas names; each has `<base>_idle` and `<base>_run`
 * 4-frame animations (see public/themes/dungeon/dungeon-tileset.json).
 */

export type HeroClassId =
  | "guild-master"
  | "cartographer"
  | "scout"
  | "blacksmith"
  | "monster-hunter"
  | "shield-knight"
  | "inquisitor"
  | "scribe"
  | "courier"
  | "oracle"
  | "enchanter"
  | "novice";

export interface HeroClass {
  id: HeroClassId;
  /** Atlas sprite bases this class can wear (one picked per agent). */
  bases: readonly string[];
}

export const HERO_CLASSES: Record<HeroClassId, HeroClass> = {
  "guild-master": { id: "guild-master", bases: ["knight_m"] },
  cartographer: { id: "cartographer", bases: ["wizzard_m", "wizzard_f"] },
  scout: { id: "scout", bases: ["elf_m", "elf_f"] },
  blacksmith: { id: "blacksmith", bases: ["dwarf_m", "dwarf_f"] },
  "monster-hunter": { id: "monster-hunter", bases: ["lizard_m", "lizard_f"] },
  "shield-knight": { id: "shield-knight", bases: ["knight_f", "knight_m"] },
  inquisitor: { id: "inquisitor", bases: ["angel"] },
  scribe: { id: "scribe", bases: ["doc"] },
  courier: { id: "courier", bases: ["goblin"] },
  oracle: { id: "oracle", bases: ["orc_shaman"] },
  enchanter: { id: "enchanter", bases: ["pumpkin_dude"] },
  novice: {
    id: "novice",
    bases: ["elf_m", "elf_f", "knight_m", "knight_f", "dwarf_m", "dwarf_f", "wizzard_m", "wizzard_f"],
  },
};

/** ClaudeKit / Claude Code subagent types → hero class. Keys are normalized. */
const AGENT_TYPE_CLASS: Record<string, HeroClassId> = {
  planner: "cartographer",
  plan: "cartographer",
  "project-manager": "cartographer",
  researcher: "scout",
  explore: "scout",
  scout: "scout",
  "fullstack-developer": "blacksmith",
  "code-simplifier": "blacksmith",
  debugger: "monster-hunter",
  tester: "shield-knight",
  "code-reviewer": "inquisitor",
  "docs-manager": "scribe",
  "journal-writer": "scribe",
  "git-manager": "courier",
  brainstormer: "oracle",
  "ui-ux-designer": "enchanter",
};

/** Lowercase, trim, and drop a plugin namespace ("ck:planner" → "planner"). */
export function normalizeAgentType(agentType: string | null | undefined): string {
  if (!agentType) return "";
  const lower = agentType.trim().toLowerCase();
  const colon = lower.lastIndexOf(":");
  return colon >= 0 ? lower.slice(colon + 1) : lower;
}

export function heroClassForAgentType(agentType: string | null | undefined): HeroClass {
  const id = AGENT_TYPE_CLASS[normalizeAgentType(agentType)] ?? "novice";
  return HERO_CLASSES[id];
}

/** Stable 32-bit FNV-1a hash of a string. */
export function hashString(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Sprite base for one agent: stable per agent id within its class. */
export function heroBaseForAgent(agentId: string, heroClass: HeroClass): string {
  return heroClass.bases[hashString(agentId) % heroClass.bases.length];
}
