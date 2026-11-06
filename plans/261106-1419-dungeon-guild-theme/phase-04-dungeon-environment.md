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
- `frontend/src/themes/dungeon/components/` — `dungeon-background.tsx`, `dungeon-portal-stairs.tsx`, `dungeon-window.tsx`, `torch-light-effect.tsx` (Graphics + blend for flicker)
- Registered via ThemedSlot (P2).

## Related Code Files
- Create: components above · Modify: `dungeon-theme-manifest.ts`

## Implementation Steps
1. Tile background from atlas (random floor variants seeded, deterministic).
2. Walls, columns, banners; torches with flicker (alpha/scale tween, cheap).
3. Portal/stairs replacing elevator (reuse elevator open/close timing hooks).
4. Window, clock, decor props.
5. Floor/depth naming in building view (strings from P3).

## Todo List
- [ ] Floor + walls
- [ ] Torches + lighting
- [ ] Portal/stairs
- [ ] Window, clock, decor
- [ ] Depth naming

## Success Criteria
- Simulation scenario renders full dungeon room, 60fps, no layout/pathing regressions; office theme unaffected.

## Risk Assessment
- Lighting overlay cost → single overlay container, no per-frame filters; profile with many agents.

## Security Considerations
- None.

## Next Steps
- P05 places characters/stations in this room.
