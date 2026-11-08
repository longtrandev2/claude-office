/**
 * SceneTextOverlay
 *
 * In-scene text drawn as crisp HTML over the Pixi canvas instead of minified
 * canvas text: zone name plates, hero names, the Guild Master's title and
 * speech/thought bubbles. Positions follow the pixel camera (world → screen),
 * while the text keeps its own readable size at every zoom level.
 *
 * Text only (React escapes it), pointer-events off so clicks reach the canvas.
 */
"use client";

import { memo, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGameStore, selectAgents, selectBoss } from "@/stores/gameStore";
import { useCameraStore } from "@/stores/cameraStore";
import { cameraTransform, type CameraTransform } from "@/systems/pixelCamera";
import { isInElevatorZone } from "@/systems/queuePositions";
import { useTranslation } from "@/hooks/useTranslation";
import { truncateBubbleText } from "@/utils/bubbleText";
import { WORLD_ZONES } from "@/dungeon/dungeon-world-layout";
import type { BubbleContent, Position } from "@/types";

/** Hero name centre above the agent origin (world px; matches old canvas label). */
const AGENT_NAME_Y = -70;
/** Guild Master title centre above the boss origin (world px). */
const BOSS_TITLE_Y = -52;
/** Bubbles start right of the tool icon (icon half-width + plate, world px). */
const BUBBLE_X = 18;
/** Gap between a bubble's bottom and the name centre (CSS px). */
const BUBBLE_ABOVE_NAME = 12;
/** Zone plate distance below the wall foot, on the floor edge (world px). */
const ZONE_PLATE_Y = 10;
/** Skip items further than this outside the viewport (CSS px). */
const CULL_MARGIN = 160;

interface SceneTextOverlayProps {
  /** Guild Master is away from the war table (compaction walk). */
  bossAway: boolean;
}

function toScreen(t: CameraTransform, x: number, y: number) {
  return { left: Math.round(t.x + x * t.scale), top: Math.round(t.y + y * t.scale) };
}

function SceneBubble({ content, at }: { content: BubbleContent; at: { left: number; top: number } }): ReactNode {
  const type = content.type ?? "thought";
  return (
    <div className={`scene-bubble scene-bubble--${type}`} style={{ left: at.left, top: at.top }}>
      {truncateBubbleText(content.text)}
    </div>
  );
}

/** Screen placement (CSS px) of one character's text, as primitives for memo. */
function characterTextAt(t: CameraTransform, position: Position, nameY: number) {
  const name = toScreen(t, position.x, position.y + nameY);
  return {
    nameLeft: name.left,
    nameTop: name.top,
    bubbleLeft: toScreen(t, position.x + BUBBLE_X, 0).left,
    bubbleTop: name.top - BUBBLE_ABOVE_NAME,
  };
}

/**
 * Name label + optional bubble for one character. Memoized on primitive
 * screen positions, so a frame only re-renders characters that moved or changed.
 */
const CharacterText = memo(function CharacterText({
  nameLeft,
  nameTop,
  bubbleLeft,
  bubbleTop,
  name,
  bubble,
}: {
  nameLeft: number;
  nameTop: number;
  bubbleLeft: number;
  bubbleTop: number;
  name: string | null;
  bubble: BubbleContent | null;
}): ReactNode {
  return (
    <>
      {name && (
        <div className="scene-name" style={{ left: nameLeft, top: nameTop }}>
          {name}
        </div>
      )}
      {bubble && <SceneBubble content={bubble} at={{ left: bubbleLeft, top: bubbleTop }} />}
    </>
  );
});

export function SceneTextOverlay({ bossAway }: SceneTextOverlayProps): ReactNode {
  const { t: tr } = useTranslation();
  const agents = useGameStore(useShallow(selectAgents));
  const boss = useGameStore(selectBoss);
  const view = useCameraStore((s) => s.view);
  const viewport = useCameraStore((s) => s.viewport);
  if (!view || !viewport) return null;

  const t = cameraTransform(view, viewport);
  const visible = (p: Position) => {
    const s = toScreen(t, p.x, p.y);
    return (
      s.left > -CULL_MARGIN &&
      s.top > -CULL_MARGIN &&
      s.left < viewport.width + CULL_MARGIN &&
      s.top < viewport.height + CULL_MARGIN
    );
  };

  return (
    <div className="scene-text-overlay" aria-hidden="true">
      {WORLD_ZONES.map((zone) => {
        const at = toScreen(t, zone.rect.x + zone.rect.width / 2, zone.rect.y + zone.wallHeight + ZONE_PLATE_Y);
        return (
          <div key={zone.id} className="scene-zone-plate" style={{ left: at.left, top: at.top }}>
            {tr(zone.nameKey)}
          </div>
        );
      })}

      {Array.from(agents.values())
        .filter((a) => !isInElevatorZone(a.currentPosition) && visible(a.currentPosition))
        .map((a) => (
          <CharacterText
            key={a.id}
            {...characterTextAt(t, a.currentPosition, AGENT_NAME_Y)}
            name={a.name}
            bubble={a.bubble.content}
          />
        ))}

      {visible(boss.position) && (
        <CharacterText
          {...characterTextAt(t, boss.position, BOSS_TITLE_Y)}
          name={bossAway ? null : tr("attention.popup.boss")}
          bubble={boss.bubble.content}
        />
      )}
    </div>
  );
}
