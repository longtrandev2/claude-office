/**
 * BossSprite Component
 *
 * Renders the Guild Master (main agent) at the war table as an animated hero,
 * plus the walking Guild Master used during context compaction.
 */

"use client";

import { memo, useMemo, type ReactNode } from "react";
import { Graphics, TextStyle, Texture } from "pixi.js";
import type { BossState, BubbleContent, Position } from "@/types";
import { MarqueeText } from "./MarqueeText";
import { ICON_MAP } from "./shared/iconMap";
import { drawBubble, drawIconBadge } from "./shared/drawBubble";
import { useTranslation } from "@/hooks/useTranslation";
import { HERO_CLASSES } from "@/dungeon/hero-class-registry";
import { HeroSprite } from "./HeroSprite";
import { truncateBubbleText } from "@/utils/bubbleText";

// ============================================================================
// TYPES
// ============================================================================

export interface BossSpriteProps {
  position: Position;
  state: BossState;
  bubble: BubbleContent | null;
  inUseBy: "arrival" | "departure" | null;
  currentTask: string | null;
  chairTexture: Texture | null;
  deskTexture: Texture | null;
  keyboardTexture: Texture | null;
  monitorTexture: Texture | null;
  phoneTexture: Texture | null;
  headsetTexture: Texture | null;
  sunglassesTexture: Texture | null;
  renderBubble?: boolean; // Whether to render bubble (default true)
  isTyping?: boolean; // Whether boss is typing (animates arms)
  isAway?: boolean; // Whether boss is away from desk (hides body, shows only furniture)
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** The Guild Master always wears the first guild-master sprite. */
const GUILD_MASTER_BASE = HERO_CLASSES["guild-master"].bases[0];
/** Feet offset below the boss origin (old capsule bottom: 6 + 38). */
const SEATED_FEET_Y = 44;
const WALKING_FEET_Y = 38;
const LABEL_STYLE = {
  fontFamily: "monospace",
  fontSize: 24,
  fill: 0xffffff,
  fontWeight: "bold" as const,
  stroke: { width: 4, color: 0x000000 },
};

// ============================================================================
// DRAWING FUNCTIONS
// ============================================================================

function drawFallbackChair(g: Graphics): void {
  g.clear();
  g.circle(0, 15, 25);
  g.fill(0x4a5568);
  g.stroke({ width: 2, color: 0x2d3748 });
}

function drawFallbackDesk(g: Graphics): void {
  g.clear();
  g.rect(-70, 15, 140, 80);
  g.fill(0x5d3a1e);
  g.stroke({ width: 4, color: 0x3d2a1e });
}

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
  const charWidth = 7.5;
  const paddingH = 30;
  const maxW = 220;
  const rawWidth = text.length * charWidth + paddingH;
  const bWidth = Math.min(maxW, Math.max(80, rawWidth));
  const capacity = (bWidth - paddingH) / charWidth;
  const lines = Math.max(1, Math.ceil(text.length / capacity));
  const bHeight = 35 + lines * 14;

  // Text style at 2x for sharp rendering
  const textStyle = useMemo<Partial<TextStyle>>(
    () => ({
      fontFamily:
        '"Courier New", Courier, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", monospace',
      fontSize: 20,
      fill: "#000000",
      fontWeight: "bold",
      wordWrap: true,
      wordWrapWidth: (bWidth - 30) * 2,
      breakWords: true,
      align: "left",
      lineHeight: 28,
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
      <pixiContainer x={-bWidth / 2 + 15} y={-bHeight / 2} scale={0.5}>
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

function BossSpriteComponent({
  position,
  state: _state,
  bubble,
  inUseBy: _inUseBy,
  currentTask,
  chairTexture,
  deskTexture,
  keyboardTexture,
  monitorTexture,
  phoneTexture: _phoneTexture,
  headsetTexture: _headsetTexture,
  sunglassesTexture: _sunglassesTexture,
  renderBubble = true,
  isTyping: _isTyping = false,
  isAway = false,
}: BossSpriteProps): ReactNode {
  const { t } = useTranslation();
  const bubbleOffset = -80;

  return (
    <pixiContainer x={position.x} y={position.y}>
      {/* Chair - behind everything */}
      {chairTexture ? (
        <pixiSprite texture={chairTexture} anchor={0.5} x={5} y={30} scale={0.1386} />
      ) : (
        <pixiGraphics draw={drawFallbackChair} />
      )}

      {/* Guild Master - hidden when away from the table */}
      {!isAway && (
        <HeroSprite base={GUILD_MASTER_BASE} position={position} feetY={SEATED_FEET_Y} seed="guild-master" />
      )}

      {/* Desk surface - in front of the Guild Master */}
      {deskTexture ? (
        <pixiSprite texture={deskTexture} anchor={{ x: 0.5, y: 0 }} y={30} scale={0.105} />
      ) : (
        <pixiGraphics draw={drawFallbackDesk} />
      )}

      {/* Keyboard - on desk surface */}
      {keyboardTexture && (
        <pixiSprite texture={keyboardTexture} anchor={0.5} x={0} y={42} scale={0.04} />
      )}

      {/* Monitor - left side of desk */}
      {monitorTexture && (
        <pixiSprite texture={monitorTexture} anchor={0.5} x={-45} y={27} scale={0.08} />
      )}

      {/* Title label - hidden when away from the table */}
      {!isAway && (
        <pixiContainer y={-52} scale={0.5}>
          <pixiText text={t("attention.popup.boss")} anchor={0.5} style={LABEL_STYLE} resolution={2} />
        </pixiContainer>
      )}

      {/* Task marquee on desk - scrolling user prompt */}
      {currentTask && (
        <pixiContainer x={0} y={70}>
          <MarqueeText text={currentTask} width={115} color="#00ff88" />
        </pixiContainer>
      )}

      {/* Bubble - only render if renderBubble is true and boss is at desk */}
      {renderBubble && bubble && !isAway && <Bubble content={bubble} yOffset={bubbleOffset} />}
    </pixiContainer>
  );
}

export const BossSprite = memo(BossSpriteComponent);

// Export Bubble component for use in top-level bubbles layer
export { Bubble as BossBubble };

// ============================================================================
// MOBILE BOSS COMPONENT (for walking around the office)
// ============================================================================

export interface MobileBossProps {
  position: Position;
  jumpOffset?: number; // Vertical offset for jump animation
  scale?: number; // Scale factor for boss body
  sunglassesTexture: Texture | null;
  headsetTexture: Texture | null;
}

function MobileBossComponent({
  position,
  jumpOffset = 0,
  scale = 1.0,
  sunglassesTexture: _sunglassesTexture,
  headsetTexture: _headsetTexture,
}: MobileBossProps): ReactNode {
  const { t } = useTranslation();
  return (
    <pixiContainer x={position.x} y={position.y + jumpOffset} scale={scale}>
      <HeroSprite base={GUILD_MASTER_BASE} position={position} feetY={WALKING_FEET_Y} seed="guild-master" />
      <pixiContainer y={-58} scale={0.5}>
        <pixiText text={t("attention.popup.boss")} anchor={0.5} style={LABEL_STYLE} resolution={2} />
      </pixiContainer>
    </pixiContainer>
  );
}

export const MobileBoss = memo(MobileBossComponent);
