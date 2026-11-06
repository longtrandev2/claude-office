# Phase 04 — Dungeon environment

## Context Links
- [plan.md](plan.md) · `frontend/src/components/game/{OfficeBackground,Elevator,CityWindow,DeskGrid,WallClock}.tsx` · `frontend/src/constants/positions.ts` · `backend/app/core/office_layout.py`

## Overview
- Priority: P1 · Status: pending
- Replace office room with a dungeon guild hall: stone floor/walls, torches with flicker light, themed furniture. Layout positions stay compatible (pathfinding, seats).

## Key Insights
- Keep existing coordinate system/seat positions → pathfinding (A*) & backend layout untouched; only visuals change.
- 16px tiles scaled ×3 (48px) nearest-neighbor ≈ current agent size (~60px).

## Requirements — prop mapping
| Office | Dungeon |
|---|---|
| floor tile / walls | stone floor (with variation), brick walls, columns |
| desk + chair + monitor | workstation per class (P5 decides: anvil, map table, lectern…); default: wooden table + stool + candle |
| boss rug/desk | Guild Master war table + banner |
| elevator | stone stairway / portal (agents arrive/leave) |
| city window | barred window with moon/sky; day/night from real time |
| wall clock | hourglass or sundial-style clock |
| water cooler / coffee | ale barrel / potion cauldron |
| plant | mushrooms / skull pile |
| floors (multi-floor building) | dungeon depths B1, B2… labels |

## Architecture
- `frontend/src/dungeon/components/` — `dungeon-background.tsx`, `dungeon-portal-stairs.tsx`, `dungeon-window.tsx`, `torch-light-effect.tsx` (Graphics + blend for flicker)
- Replace office components in place (OfficeBackground, Elevator, CityWindow, …); no slot/manifest layer.

## Related Code Files
- Create: components above · Modify: `OfficeBackground`, `Elevator`, `CityWindow`, `DeskGrid`, `WallClock`, `useOfficeTextures` (dungeon atlas)

## Implementation Steps
1. Tile background from atlas (random floor variants seeded, deterministic).
2. Walls, columns, banners; torches with flicker (alpha/scale tween, cheap).
3. Portal/stairs replacing elevator (reuse elevator open/close timing hooks).
4. Window, clock, decor props.
5. Floor/depth naming in building view (strings from P3).

## Todo List
- [x] Floor + walls (static hall baked to one nearest-sampled texture: `frontend/src/dungeon/compose-dungeon-hall-canvas.ts`, layout data in `dungeon-hall-layout.ts`, `DungeonHallBackground.tsx`; crimson centre carpet, stepped wall darkness, columns, banners, fountain, candles, corner clutter; office decor removed: city window, outlet, cooler, coffee, plant, rug)
- [x] **User review of static hall screenshot** (gate) — approved 2026-11-06
- [x] Torches + lighting (baked ambient darkness + stepped lit zones + edge vignette; `DungeonHallAmbience.tsx`: candle/fountain frame cycling, flickering additive light pools; standing candles flank the Guild Master; heroes not darkened for readability; reduced-motion = still)
- [x] Portal/stairs (Elevator.tsx → stone door-frame arch + arcane veil: opaque pulsing when closed, thin shimmer when open; rune gem teal/red; teal light pool; engine API unchanged)
- [~] Window, clock, decor: safety sign → tavern tally board ("spells cast since last rest", i18n, no emoji); employee-of-month frame removed from hall (decorative only) → guild banners; clock + whiteboard (→ quest board, P7) + printer (→ owl, P6) remain
- [ ] Depth naming

## Success Criteria
- Simulation scenario renders full dungeon room, 60fps, no layout/pathing regressions.

## Risk Assessment
- Lighting overlay cost → single overlay container, no per-frame filters; profile with many agents.

## Security Considerations
- None.

## Next Steps
- P05 places characters/stations in this room.
