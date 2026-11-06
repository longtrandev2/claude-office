import { describe, expect, it } from "vitest";
import {
  TOOL_COLORS,
  TOOL_ICON_BITMAPS,
  toolCategoryFromBubbleIcon,
  type ToolCategory,
} from "@/dungeon/tool-activity";

describe("tool activity", () => {
  it("maps backend tool bubble icons to categories", () => {
    expect(toolCategoryFromBubbleIcon("📖")).toBe("read");
    expect(toolCategoryFromBubbleIcon("🔎")).toBe("search");
    expect(toolCategoryFromBubbleIcon("📝")).toBe("write");
    expect(toolCategoryFromBubbleIcon("💻")).toBe("bash");
    expect(toolCategoryFromBubbleIcon("🌐")).toBe("web");
  });

  it("shows nothing for non-tool bubbles", () => {
    expect(toolCategoryFromBubbleIcon(null)).toBeNull();
    expect(toolCategoryFromBubbleIcon("📞")).toBeNull();
    expect(toolCategoryFromBubbleIcon("⚙️")).toBeNull();
  });

  it("every category has a colour and a 7x7 bitmap", () => {
    for (const cat of Object.keys(TOOL_ICON_BITMAPS) as ToolCategory[]) {
      expect(TOOL_COLORS[cat]).toBeTypeOf("number");
      const rows = TOOL_ICON_BITMAPS[cat];
      expect(rows).toHaveLength(7);
      rows.forEach((r) => expect(r).toMatch(/^[#.]{7}$/));
    }
  });
});
