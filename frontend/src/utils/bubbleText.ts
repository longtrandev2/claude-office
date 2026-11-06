/**
 * Shared bubble text utilities for speech/thought bubbles.
 *
 * Truncates text that exceeds the max character limit, appending "..."
 * to indicate truncation. Used by both AgentSprite and BossSprite bubbles.
 */

/** Maximum characters shown in a bubble before truncation. */
const BUBBLE_MAX_CHARS = 60;

/**
 * Truncate bubble text to a maximum character length.
 * Text at or below the limit is returned unchanged.
 *
 * @param text - The bubble text to potentially truncate.
 * @param maxLen - Maximum character count (default 60).
 * @returns Truncated text with "..." suffix if over limit, otherwise original.
 */
export function truncateBubbleText(
  rawText: string,
  maxLen: number = BUBBLE_MAX_CHARS,
): string {
  const text = stripMarkdown(rawText);
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + "...";
}

/**
 * Remove Markdown markup from assistant text so bubbles show plain words:
 * bold/italic markers, inline code ticks, headings, list bullets, links.
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // [label](url) -> label
    .replace(/(\*\*|__|`)/g, "") // bold markers, inline code ticks
    .replace(/^\s{0,3}#{1,6}\s+/gm, "") // headings
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, "") // list bullets
    .replace(/\s+/g, " ")
    .trim();
}
