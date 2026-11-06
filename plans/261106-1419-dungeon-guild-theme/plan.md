---
title: Dungeon Guild theme for claude-office fork
status: pending
created: 2026-11-06
branch: feat/dungeon-guild-theme
---

# Dungeon Guild Theme — Plan

Reskin claude-office (pixel office visualizer for Claude Code) into a **fantasy adventurer guild in a dungeon**:
main agent = Guild Master, ClaudeKit subagents = adventurer classes, office props = dungeon props.
Multi-language (en/es/pt-BR/vi). Control features (hook two-way "A", Agent SDK "B") are OUT of scope — later plan.

## Key facts (verified in code 2026-11-06)
- In-game characters are **colored capsules** drawn via PixiJS Graphics (`components/game/AgentSprite.tsx`); `agent1_*_sheet.png` only used in debug preview → we build a new animated character renderer freely.
- All prop textures load centrally in `frontend/src/hooks/useOfficeTextures.ts` → natural theme indirection point.
- Hook already sends `subagent_type` → `agent_type` (`hooks/src/claude_office_hooks/event_mapper.py:123`, `types/generated.ts:549`) → class mapping possible without backend changes.
- i18n exists: `frontend/src/i18n/{en,es,pt-BR}.ts` (~288 lines each). Quotes: `frontend/src/constants/quotes.ts`, `backend/app/core/quotes.py`.
- `make simulate` / `scripts/scenarios/` replays fake events → test visuals without real agents.
- Local machine: node 24, python 3.14, docker OK; **make, uv, bun, tmux, ImageMagick missing**.

## Phases
| # | Phase | Size | Status |
|---|---|---|---|
| 1 | [Dev env + asset sourcing & atlas pipeline](phase-01-dev-env-and-asset-pipeline.md) | M | done |
| 2 | [Theme system foundation](phase-02-theme-system-foundation.md) | M | superseded — reverted, dungeon is the only look |
| 3 | [i18n: vi + dungeon strings all languages](phase-03-i18n-multilanguage-dungeon-strings.md) | S | pending |
| 4 | [Dungeon environment](phase-04-dungeon-environment.md) | M | pending |
| 5 | [Animated characters & classes](phase-05-animated-characters-and-classes.md) | L | pending |
| 6 | [Interactions & FX](phase-06-interactions-and-fx.md) | L | pending |
| 7 | [Quest board, extras, test & polish](phase-07-quest-board-extras-test-polish.md) | M | pending |
| 8 | [UX & liveliness (engine extensions)](phase-08-ux-and-liveliness.md) | L | pending — interleaved with P4–P7 |

**MVP cut** (if token budget tight): P1 → P3 → P4 (floor/walls only) → P5 (Guild Master + 3 classes + Novice fallback).

## Dependencies
P1 → (P3 ∥ P4 ∥ P5) → P6 → P7; P8 interleaved. P2 dropped.

## Principles
- **Dungeon is the only look** (user decision 2026-11-06): office visuals are replaced in place, no theme switch, no picker.
- New dungeon-specific modules live under `frontend/src/dungeon/` (kebab-case files); existing components are edited directly.
- Upstream merges are best-effort only (visual layer diverges by design; engine/backend changes still mergeable).
- Pixel-perfect: nearest-neighbor scaling, integer positions, no anti-aliasing.
- Every asset: license verified + listed in `frontend/public/themes/dungeon/CREDITS.md`.

## Unresolved questions
- Supplement packs for furniture — user downloads (itch.io blocks automation); candidates in phase-01.

## Decisions
- 2026-11-06: 0x72 license confirmed CC0 by user (itch page text "use this tileset for whatever you like (CC-0)"). Raw zip stays in gitignored `assets-src/`; generated atlas committed.
- 2026-11-06: local backend on port 8765 (8000 taken by another app) — see `docs/guides/windows-dev-setup.md`.

## Decisions
- 2026-11-06: ~~theme selectable / entry menu~~ → superseded same day: office look dropped, dungeon replaces it (picker code reverted from 7ec5e50; recoverable from git history, incl. DungeonThemePreviewCanvas).
- 2026-11-06: uv required on host even with Docker — hooks install via `uv tool install` (`hooks/install.sh:118`).

## Visual quality bar (user goal 2026-11-06: clearly prettier than upstream)
Upstream weaknesses: mixed AI-generated sprites (inconsistent style/palette), capsule agents, flat lighting.
- One palette: snap all assets (incl. supplements/AI fills) to 0x72 palette.
- Pixel-perfect: integer scale, nearest sampling, rounded positions, crisp pixel UI font (OFL/CC0).
- Lighting: dark ambient overlay + additive radial torch/candle lights with flicker, vignette.
- Depth: y-sorting (heroes pass behind/in front of furniture), soft ellipse shadows under characters.
- Life: animated candles/fountains/banners, dust motes, spawn squash-stretch, eased movement.
- Proper walls: 0x72 high/low autotiles, floor variation, room composed in zones (war table center, class stations, quest board wall, portal).
- UI chrome: parchment/stone 9-slice panels for bubbles, sidebar, modals in dungeon theme.
- **Gate**: P4 starts with a static mockup scene (screenshot) approved by user before mass implementation.

## Anti-slop rules (user requirement 2026-11-06 — MUST follow)
- Every visual/animation/monster maps to a real event signal or clear purpose; nothing random/decorative-only.
- Single art family (0x72 + compatible CC0 packs), one palette; AI-generated fill only as last resort, palette-snapped + reviewed.
- In-canvas icons = pack pixel sprites, never emoji. No gradient/glow overload, no filler flavor text.
- Hard caps: ≤1 monster per agent, ≤6 monsters per room, particles pooled + capped; reduced-motion respected.
