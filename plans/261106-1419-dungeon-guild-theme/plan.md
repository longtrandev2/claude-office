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
| 1 | [Dev env + asset sourcing & atlas pipeline](phase-01-dev-env-and-asset-pipeline.md) | M | in progress (supplement packs pending) |
| 2 | [Theme system foundation](phase-02-theme-system-foundation.md) | M | pending |
| 3 | [i18n: vi + dungeon strings all languages](phase-03-i18n-multilanguage-dungeon-strings.md) | S | pending |
| 4 | [Dungeon environment](phase-04-dungeon-environment.md) | M | pending |
| 5 | [Animated characters & classes](phase-05-animated-characters-and-classes.md) | L | pending |
| 6 | [Interactions & FX](phase-06-interactions-and-fx.md) | L | pending |
| 7 | [Quest board, extras, test & polish](phase-07-quest-board-extras-test-polish.md) | M | pending |

**MVP cut** (if token budget tight): P1 → P2 → P3 → P4 (floor/walls only) → P5 (Guild Master + 3 classes + Novice fallback).

## Dependencies
P1 → P2 → (P3 ∥ P4 ∥ P5) → P6 → P7. P3 independent once theme string keys exist (P2).

## Principles
- Keep `office` theme working (upstream mergeability); dungeon is a selectable theme, default in this fork.
- Theme code isolated under `frontend/src/themes/` to minimize upstream merge conflicts.
- Pixel-perfect: nearest-neighbor scaling, integer positions, no anti-aliasing.
- Every asset: license verified + listed in `frontend/public/themes/dungeon/CREDITS.md`.

## Unresolved questions
- Supplement packs for furniture — user downloads (itch.io blocks automation); candidates in phase-01.

## Decisions
- 2026-11-06: 0x72 license confirmed CC0 by user (itch page text "use this tileset for whatever you like (CC-0)"). Raw zip stays in gitignored `assets-src/`; generated atlas committed.
- 2026-11-06: theme picked from an entry menu on app open (+ Settings).
- 2026-11-06: local backend on port 8765 (8000 taken by another app) — see `docs/guides/windows-dev-setup.md`.

## Decisions
- 2026-11-06: theme is user-selectable in Settings (office ↔ dungeon); assumed default = dungeon in this fork (confirm with user).
- 2026-11-06: uv required on host even with Docker — hooks install via `uv tool install` (`hooks/install.sh:118`).
