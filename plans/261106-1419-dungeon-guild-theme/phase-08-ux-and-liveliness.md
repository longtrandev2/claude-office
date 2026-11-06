# Phase 08 — UX improvements & liveliness (engine extensions)

## Context Links
- [plan.md](plan.md) · `frontend/src/systems/*` · `frontend/src/machines/*` · `frontend/src/components/{layout,attention,overlay,tour}` · `components/game/OfficeGame.tsx`

## Overview
- Priority: P1 (runs alongside P4–P7, items tagged per phase) · Status: pending
- Keep engine core; extend render pipeline, behaviors, and information UX so the scene is both **lively** and **useful at a glance**.

## Key Insights (engine audit 2026-11-06)
- Solid core, keep: PixiJS 8.22 + @pixi/react 8, XState 5 agent machines (arrival/departure/queue), A* + navigation grid + path smoothing + collision, animation system, state reconciler, WebSocket controller, Zustand slices (batched per tick), 500+ tests.
- Gaps: no lighting; zoom via `react-zoom-pan-pinch` (DOM scale → non-integer, blurry pixels); capsule agents (no sprite animation); agents idle = stand still; info mostly in sidebar text, little on-canvas affordance.

## Requirements
**Engine extensions**
- Render layers: floor → decals → y-sorted actors+props → lighting → FX → on-canvas UI.
- Pixel camera: integer zoom steps (1×–4×), smooth pan, **follow-cam** on selected agent; replace DOM zoom in dungeon theme.
- Sprite animation support in `animationSystem` (idle/run/work/hit, flip).
- Idle behavior scheduler as a new non-blocking agent sub-state (wander, visit barrel/fountain, chat in pairs) — never interferes with work states.

**UX (information)**
- Click hero → detail card: class, task, current tool + target file, elapsed time, tool count/level, last 5 actions; "follow" toggle.
- Hover tooltip: name + current action.
- Tool icons above heads (book=Read, quill=Edit, rune=Bash, orb=Web) instead of long text; full text in card.
- Attention: needs-you heroes glow + "!" + optional sound + browser notification; header counter.
- Quest log (themed EventLog): filter by agent/tool/errors, click entry → focus hero.
- Session replay speed controls (backend `/sessions/{id}/replay` exists).
- Accessibility: reduced-motion setting (disables flicker/particles), color-blind-safe status cues (shape + color).

**Liveliness**
- Reactions: party cheer when subagent completes, Guild Master nods on hand-in, level-up burst.
- Ambient: rats/bats wandering, dust motes, flickering lights, banner sway; day/night tint from real clock.
- Emotes: 💡 idea, 💢 error, 💤 idle, ❓ waiting permission.

## Architecture
- `frontend/src/systems/render-layers.ts`, `pixel-camera.ts`, `idle-behavior-scheduler.ts`
- `frontend/src/components/game/hero-detail-card.tsx`, `hero-hover-tooltip.tsx`
- Built directly for the dungeon look (single theme).

## Implementation Steps
1. Render layers + y-sort (with P4).
2. Sprite animation in animationSystem (with P5).
3. Pixel camera + follow-cam.
4. Detail card, hover tooltip, tool icons.
5. Attention upgrades + notifications.
6. Idle behaviors + reactions + ambient critters (with P6).
7. Quest log filters, replay controls, reduced-motion.

## Todo List
- [ ] Render layers + y-sort
- [ ] Sprite animation support
- [ ] Pixel camera + follow-cam
- [ ] Detail card + tooltip + tool icons
- [ ] Attention + notifications
- [ ] Idle behaviors, reactions, ambient
- [ ] Quest log filters, replay speed, reduced-motion

## Success Criteria
- New user can answer "who is doing what / who needs me" within 3 s of looking.
- 60 fps with 10 agents + lighting on mid laptop; existing machine tests green.

## Risk Assessment
- XState machine edits can break arrival/departure flows → add idle as separate actor/sub-state, extend tests first.
- Over-animation hurts readability → caps per agent, reduced-motion toggle.

## Security Considerations
- Detail card shows tool inputs/paths → render as text only (no HTML), truncate long values.

## Next Steps
- After P8 + P7: control features plan (two-way hooks / Agent SDK command desk).
