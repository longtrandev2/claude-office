import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  HERO_CLASSES,
  heroBaseForAgent,
  heroClassForAgentType,
  normalizeAgentType,
} from "@/dungeon/hero-class-registry";

const atlas = JSON.parse(
  readFileSync(join(__dirname, "../public/themes/dungeon/dungeon-tileset.json"), "utf8"),
) as { animations: Record<string, string[]> };

describe("hero class registry", () => {
  it("maps ClaudeKit agent types to classes", () => {
    expect(heroClassForAgentType("planner").id).toBe("cartographer");
    expect(heroClassForAgentType("tester").id).toBe("shield-knight");
    expect(heroClassForAgentType("fullstack-developer").id).toBe("blacksmith");
    expect(heroClassForAgentType("code-reviewer").id).toBe("inquisitor");
  });

  it("normalizes case and plugin namespaces", () => {
    expect(normalizeAgentType("  Planner ")).toBe("planner");
    expect(normalizeAgentType("ck:debugger")).toBe("debugger");
    expect(heroClassForAgentType("ck:Debugger").id).toBe("monster-hunter");
  });

  it("falls back to novice for unknown or missing types", () => {
    expect(heroClassForAgentType(null).id).toBe("novice");
    expect(heroClassForAgentType("vercel:deployment-expert").id).toBe("novice");
    expect(heroClassForAgentType("../../etc").id).toBe("novice");
  });

  it("gives the same agent the same look every time", () => {
    const cls = heroClassForAgentType("planner");
    expect(heroBaseForAgent("subagent_abc", cls)).toBe(heroBaseForAgent("subagent_abc", cls));
    expect(cls.bases).toContain(heroBaseForAgent("subagent_xyz", cls));
  });

  it("every class sprite has idle and run animations in the atlas", () => {
    const missing = Object.values(HERO_CLASSES)
      .flatMap((c) => c.bases)
      .flatMap((b) => [`${b}_idle`, `${b}_run`])
      .filter((anim) => !(anim in atlas.animations));
    expect(missing).toEqual([]);
  });
});
