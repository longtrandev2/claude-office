/**
 * AgentSprite Component
 *
 * Renders a single agent as an animated guild hero (class from its
 * Claude Code / ClaudeKit agent type) with optional name label and bubble.
 */

"use client";

import { memo, useMemo, useCallback, type ReactNode } from "react";
import { TextStyle, Texture } from "pixi.js";
import type { Position, BubbleContent } from "@/types";
import type { AgentPhase } from "@/stores/gameStore";
import { useAttentionStore } from "@/stores/attentionStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { isInElevatorZone } from "@/systems/queuePositions";
import { ICON_MAP } from "./shared/iconMap";
import { drawBubble, drawIconBadge } from "./shared/drawBubble";
import { truncateBubbleText } from "@/utils/bubbleText";
import { heroBaseForAgent, heroClassForAgentType } from "@/dungeon/hero-class-registry";
import { HeroSprite } from "./HeroSprite";
import { HeroActivityIndicator } from "./HeroActivityIndicator";
import { toolCategoryFromBubbleIcon } from "@/dungeon/tool-activity";

// ============================================================================
// TYPES
// ============================================================================

export interface AgentSpriteProps {
  id: string;
  name: string | null;
  color: string;
  number: number;
  position: Position;
  phase: AgentPhase;
  bubble: BubbleContent | null;
  headsetTexture?: Texture | null;
  sunglassesTexture?: Texture | null;
  renderBubble?: boolean; // Whether to render bubble (default true)
  renderLabel?: boolean; // Whether to render name label (default true)
  isTyping?: boolean; // Whether agent is typing (animates arms)
  agentType?: string | null; // Subagent type → hero class (e.g. "planner")
}

// ============================================================================
// CONSTANTS
// ============================================================================


/** Feet sit this far below the engine's agent origin (old capsule bottom). */
const HERO_FEET_Y = 22;

// ============================================================================
// BUBBLE COMPONENT
// ============================================================================

interface BubbleProps {
  content: BubbleContent;
  yOffset: number;
}

function Bubble({ content, yOffset }: BubbleProps): ReactNode {
  const { type = "thought", icon } = content;
  const text = truncateBubbleText(content.text);

  // Convert icon name to emoji if needed
  const iconEmoji = icon ? (ICON_MAP[icon] ?? icon) : undefined;

  // Icon badge constants
  const badgeRadius = 16; // Radius of the circular badge

  // Calculate bubble dimensions (at display scale) - icon is outside bubble now
  const charWidth = 10;
  const paddingH = 36;
  const maxW = 300;
  const rawWidth = text.length * charWidth + paddingH;
  const bWidth = Math.min(maxW, Math.max(80, rawWidth));
  const capacity = (bWidth - paddingH) / charWidth;
  const lines = Math.max(1, Math.ceil(text.length / capacity));
  const bHeight = 40 + lines * 18;

  // Text style at 2x for sharp rendering
  const textStyle = useMemo<Partial<TextStyle>>(
    () => ({
      fontFamily:
        '"Courier New", Courier, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", monospace',
      fontSize: 26,
      fill: "#000000",
      fontWeight: "bold",
      wordWrap: true,
      wordWrapWidth: (bWidth - 36) * 2,
      breakWords: true,
      align: "left",
      lineHeight: 36,
      stroke: { width: 0, color: 0x000000 },
    }),
    [bWidth],
  );

  // Icon style - larger emoji
  const iconStyle = useMemo<Partial<TextStyle>>(
    () => ({
      fontFamily:
        '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
      fontSize: 40, // Large emoji for badge
      fill: "#000000",
    }),
    [],
  );

  return (
    <pixiContainer y={yOffset} x={45}>
      <pixiGraphics draw={(g) => drawBubble(g, bWidth, bHeight, type)} />
      {/* Icon badge on top-left corner of bubble */}
      {iconEmoji && (
        <pixiContainer x={-bWidth / 2 - 6} y={-bHeight + 6}>
          <pixiGraphics draw={(g) => drawIconBadge(g, badgeRadius)} />
          <pixiContainer scale={0.5} x={0} y={1}>
            <pixiText
              text={iconEmoji}
              anchor={0.5}
              style={iconStyle}
              resolution={2}
            />
          </pixiContainer>
        </pixiContainer>
      )}
      {/* Text rendered at 2x and scaled down for sharpness */}
      <pixiContainer x={-bWidth / 2 + 18} y={-bHeight / 2} scale={0.5}>
        <pixiText
          text={text}
          anchor={{ x: 0, y: 0.5 }}
          style={textStyle}
          resolution={2}
        />
      </pixiContainer>
    </pixiContainer>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function AgentSpriteComponent({
  id,
  name,
  color: _color,
  number: _number,
  position,
  phase: _phase,
  bubble,
  headsetTexture: _headsetTexture,
  sunglassesTexture: _sunglassesTexture,
  renderBubble = true,
  renderLabel = true,
  isTyping = false,
  agentType = null,
}: AgentSpriteProps): ReactNode {
  const clickToFocusEnabled = usePreferencesStore((s) => s.clickToFocusEnabled);
  const openFocusPopup = useAttentionStore((s) => s.openFocusPopup);

  // Class and look are fixed per agent (type + id never change).
  const heroBase = useMemo(
    () => heroBaseForAgent(id, heroClassForAgentType(agentType)),
    [id, agentType],
  );

  // Click handler for focus popup
  const handlePointerTap = useCallback(() => {
    if (!clickToFocusEnabled) return;
    const canvas = document.querySelector(".pixi-canvas-container canvas");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / 1280; // CANVAS_WIDTH = 1280
    const screenX = rect.left + position.x * scale;
    const screenY = rect.top + position.y * scale;
    openFocusPopup(id, screenX, screenY);
  }, [clickToFocusEnabled, id, position.x, position.y, openFocusPopup]);

  // Bubble offset for capsule rendering
  const bubbleOffset = -93;

  return (
    <pixiContainer
      x={position.x}
      y={position.y}
      onPointerTap={handlePointerTap}
      interactive={clickToFocusEnabled}
    >
      {/* Guild hero (animated, faces direction of travel) */}
      <HeroSprite base={heroBase} position={position} feetY={HERO_FEET_Y} seed={id} />

      {/* Current tool (pixel icon) + work sparks at the table while busy */}
      {!isInElevatorZone(position) && (
        <HeroActivityIndicator
          category={toolCategoryFromBubbleIcon(bubble?.icon)}
          working={isTyping}
          iconY={-88}
          sparkY={30}
        />
      )}

      {/* Agent name if present - hide when in elevator or when renderLabel is false */}
      {renderLabel && name && !isInElevatorZone(position) && (
        <pixiContainer y={-70} scale={0.5}>
          <pixiText
            text={name}
            anchor={0.5}
            style={{
              fontFamily: "monospace",
              fontSize: 30,
              fill: 0xffffff,
              fontWeight: "bold",
              stroke: { width: 4, color: 0x000000 },
            }}
            resolution={2}
          />
        </pixiContainer>
      )}

      {/* Bubble - hide when in elevator or when renderBubble is false */}
      {renderBubble && bubble && !isInElevatorZone(position) && (
        <Bubble content={bubble} yOffset={bubbleOffset} />
      )}
    </pixiContainer>
  );
}

// ============================================================================
// AGENT LABEL COMPONENT (rendered separately for z-ordering)
// ============================================================================

export interface AgentLabelProps {
  name: string;
  position: Position;
}

function AgentLabelComponent({ name, position }: AgentLabelProps): ReactNode {
  return (
    <pixiContainer x={position.x} y={position.y - 70} scale={0.5}>
      <pixiText
        text={name}
        anchor={0.5}
        style={{
          fontFamily: "monospace",
          fontSize: 30,
          fill: 0xffffff,
          fontWeight: "bold",
          stroke: { width: 4, color: 0x000000 },
        }}
        resolution={2}
      />
    </pixiContainer>
  );
}

export const AgentLabel = memo(AgentLabelComponent);

export const AgentSprite = memo(AgentSpriteComponent);

// Export Bubble component for use in top-level bubbles layer
export { Bubble };
