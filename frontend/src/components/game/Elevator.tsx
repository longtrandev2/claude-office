/**
 * Elevator → Guild Portal
 *
 * The engine still calls this spot "the elevator" (agents spawn and leave
 * here, `isOpen` drives arrivals/departures). Visually it is an arched stone
 * doorway set into the wall with an arcane portal veil:
 *   1. Back:  dark recess inside a 0x72 door frame
 *   2. Middle: agents standing inside the portal
 *   3. Front: the veil, opaque and slowly pulsing while closed (hides agents),
 *             fading to a thin shimmer while open so agents step through.
 * A rune gem on the arch glows teal while the portal is open.
 *
 * The veil animates in the Pixi ticker (no React re-render per frame) and is
 * drawn still under prefers-reduced-motion.
 */
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useTick } from "@pixi/react";
import { Graphics, Texture } from "pixi.js";
import { ELEVATOR_POSITION } from "@/systems/queuePositions";
import { loadDungeonAtlas } from "@/dungeon/dungeon-atlas";
import { getDungeonTexture } from "@/dungeon/dungeon-pixi-textures";
import { DUNGEON_SCALE, HALL_WALL_HEIGHT } from "@/dungeon/dungeon-hall-layout";
import { AgentSprite } from "./AgentSprite";
import type { AgentAnimationState } from "@/stores/gameStore";

interface ElevatorProps {
  /** Whether the portal is open (agents arriving/leaving) */
  isOpen: boolean;
  /** Map of all agents to filter those inside the portal */
  agents: Map<string, AgentAnimationState>;
  /** Headset texture for agents */
  headsetTexture: Texture | null;
  /** Sunglasses texture for agents */
  sunglassesTexture: Texture | null;
}

// Opening: 32x32 source px door leaf scaled to 96x96, its sill on the wall foot.
const OPENING = 32 * DUNGEON_SCALE;
const OPEN_LEFT = ELEVATOR_POSITION.x - OPENING / 2;
const OPEN_TOP = HALL_WALL_HEIGHT - OPENING;
const FRAME_SIDE_W = 16 * DUNGEON_SCALE;
const FRAME_TOP_H = 16 * DUNGEON_SCALE;

const VEIL_RINGS = [
  { s: 1, color: 0x16303c },
  { s: 0.78, color: 0x24586a },
  { s: 0.55, color: 0x3f9a96 },
  { s: 0.32, color: 0x8ee6d0 },
  { s: 0.14, color: 0xe6fff6 },
];
const VEIL_ALPHA_CLOSED = 1;
const VEIL_ALPHA_OPEN = 0.22;
const VEIL_FADE_MS = 500;
const RUNE_OPEN = 0x8ee6d0;
const RUNE_CLOSED = 0x7a2a35;
const RECESS = 0x07060c;

/** Snap to whole source pixels so the veil stays on the pixel grid. */
const snap = (v: number) => Math.round(v / DUNGEON_SCALE) * DUNGEON_SCALE;

function drawVeil(g: Graphics, timeMs: number, still: boolean): void {
  const t = still ? 0 : timeMs / 1000;
  const half = OPENING / 2;
  g.clear();
  for (const ring of VEIL_RINGS) {
    const rx = snap(half * ring.s);
    const ry = snap(half * ring.s * (0.92 + 0.07 * Math.sin(t * 2.1 + ring.s * 5)));
    g.ellipse(half, half, rx, ry);
    g.fill(ring.color);
  }
  // Six sparks orbiting the core.
  for (let k = 0; k < 6; k++) {
    const a = t * 1.4 + (k * Math.PI * 2) / 6;
    g.rect(snap(half + Math.cos(a) * 30), snap(half + Math.sin(a) * 26), DUNGEON_SCALE, DUNGEON_SCALE);
    g.fill(0xe6fff6);
  }
}

function drawRecess(g: Graphics): void {
  g.clear();
  g.rect(OPEN_LEFT, OPEN_TOP, OPENING, OPENING);
  g.fill(RECESS);
}

function isInsideElevator(agentX: number, agentY: number, elevatorX: number, elevatorY: number): boolean {
  const dx = Math.abs(agentX - elevatorX);
  const dy = Math.abs(agentY - elevatorY);
  return dx < 50 && dy < 80;
}

export function Elevator({ isOpen, agents, headsetTexture, sunglassesTexture }: ElevatorProps): ReactNode {
  const [frames, setFrames] = useState<Record<"left" | "right" | "top", Texture> | null>(null);
  const veilRef = useRef<Graphics | null>(null);
  const elapsed = useRef(0);
  const openness = useRef(isOpen ? 1 : 0); // 0 closed, 1 open
  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    let cancelled = false;
    loadDungeonAtlas()
      .then((atlas) => {
        if (cancelled) return;
        setFrames({
          left: getDungeonTexture(atlas, "doors_frame_left"),
          right: getDungeonTexture(atlas, "doors_frame_right"),
          top: getDungeonTexture(atlas, "doors_frame_top"),
        });
      })
      .catch((err: unknown) => console.error("[Portal] atlas load failed:", err));
    return () => {
      cancelled = true;
    };
  }, []);

  useTick((ticker) => {
    const g = veilRef.current;
    if (!g) return;
    elapsed.current += ticker.deltaMS;
    const target = isOpen ? 1 : 0;
    const gap = target - openness.current;
    const step = reduceMotion ? 1 : ticker.deltaMS / VEIL_FADE_MS;
    openness.current += Math.sign(gap) * Math.min(step, Math.abs(gap));
    g.alpha = VEIL_ALPHA_CLOSED + (VEIL_ALPHA_OPEN - VEIL_ALPHA_CLOSED) * openness.current;
    drawVeil(g, elapsed.current, reduceMotion);
  });

  const drawRune = (g: Graphics) => {
    g.clear();
    g.rect(
      ELEVATOR_POSITION.x - DUNGEON_SCALE,
      OPEN_TOP - FRAME_TOP_H + 2 * DUNGEON_SCALE,
      2 * DUNGEON_SCALE,
      2 * DUNGEON_SCALE,
    );
    g.fill(isOpen ? RUNE_OPEN : RUNE_CLOSED);
  };

  const agentsInside = Array.from(agents.values()).filter((agent) =>
    isInsideElevator(agent.currentPosition.x, agent.currentPosition.y, ELEVATOR_POSITION.x, ELEVATOR_POSITION.y),
  );

  return (
    <>
      {/* Back: dark recess + stone door frame */}
      <pixiGraphics draw={drawRecess} />
      {frames && (
        <>
          <pixiSprite texture={frames.left} x={OPEN_LEFT - FRAME_SIDE_W} y={OPEN_TOP} scale={DUNGEON_SCALE} />
          <pixiSprite texture={frames.right} x={OPEN_LEFT + OPENING} y={OPEN_TOP} scale={DUNGEON_SCALE} />
          <pixiSprite texture={frames.top} x={OPEN_LEFT} y={OPEN_TOP - FRAME_TOP_H} scale={DUNGEON_SCALE} />
        </>
      )}

      {/* Middle: agents inside the portal (behind the veil) */}
      {agentsInside.map((agent) => (
        <AgentSprite
          key={agent.id}
          id={agent.id}
          name={agent.name}
          color={agent.color}
          number={agent.number}
          position={agent.currentPosition}
          phase={agent.phase}
          bubble={agent.bubble.content}
          headsetTexture={headsetTexture}
          sunglassesTexture={sunglassesTexture}
          renderBubble={false}
          isTyping={agent.isTyping}
        />
      ))}

      {/* Front: portal veil + rune gem on the arch */}
      <pixiGraphics ref={veilRef} x={OPEN_LEFT} y={OPEN_TOP} draw={(g) => drawVeil(g, 0, true)} />
      <pixiGraphics draw={drawRune} />
    </>
  );
}

/**
 * Check if an agent is inside the portal (for external use)
 */
export function isAgentInElevator(agentX: number, agentY: number): boolean {
  return isInsideElevator(agentX, agentY, ELEVATOR_POSITION.x, ELEVATOR_POSITION.y);
}
