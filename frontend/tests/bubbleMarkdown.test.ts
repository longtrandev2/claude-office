import { describe, expect, it } from "vitest";
import { stripMarkdown, truncateBubbleText } from "@/utils/bubbleText";

describe("bubble markdown stripping", () => {
  it("removes bold, code ticks, headings, bullets and link syntax", () => {
    expect(stripMarkdown("**Phase 6** done: `HeroSprite`")).toBe("Phase 6 done: HeroSprite");
    expect(stripMarkdown("## Title\n- item one\n- item two")).toBe("Title item one item two");
    expect(stripMarkdown("see [the plan](plans/x.md)")).toBe("see the plan");
  });

  it("truncates after stripping", () => {
    const out = truncateBubbleText("**" + "a".repeat(80) + "**", 20);
    expect(out).toHaveLength(20);
    expect(out).not.toContain("*");
  });
});
