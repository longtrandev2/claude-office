# Phase 09 — World map & the descent (DRAFT — concept under discussion)

> 2026-11-06: user rejected "Forge = code" zones. Leading idea to discuss: **Dungeon = Codebase** — the Guild Hall is the surface (orchestration); descending levels are generated from the repo's folders, heroes walk to the file they read/edit (hook sends file paths), monsters spawn in the room of the file where an error happened. Rewrite this phase after that discussion.

## Context Links
- [plan.md](plan.md) · `frontend/src/constants/canvas.ts` · `frontend/src/systems/{navigationGrid,queuePositions,pathfinding}.ts` · `backend/app/core/{state_machine,floor_config,office_layout}.py` · building/floor views (`components/views`, navigationStore)

## Overview
- Priority: P2 (after P5 + P6 are stable) · Status: pending · Size: XL
- User requests (2026-11-06): the world is more than one fixed room, and you can **go down into the dungeon**.

## Requirements
**Zones around the Guild Hall (one world, camera pans)**
- Guild Hall (centre): Guild Master, portal, quest board.
- Library (research/docs: Read, Grep, WebSearch), Forge (Edit/Write/Bash), War Room (planner/brainstormer), Training Grounds (tester/debugger; error monsters live here).
- Heroes take the quest in the hall, then walk through corridors to the zone of their class / current tool.

**The descent**
- A stairway in the hall leads down: B1, B2, … are deeper levels (reuse the existing multi-floor building model: floor = dungeon level, building view = cross-section of the descent).
- Ideas to evaluate: deeper level = another project/session group (existing floor mapping); long-running background tasks "descend" to a lower level and return with loot when done; level depth darkens the lighting.
- Transition: heroes walk onto the stairs and fade down; level switch animates as a descent.

## Key Risks
- World size, nav grid (fixed 40×32), desk/queue positions are hard-coded on both frontend and backend (`DESKS_PER_ROW`, MIN_DESK_COUNT) → introduce a world/zone config first, keep the hall as zone 0 so existing flows keep working.
- Needs the P8 pixel camera (pan/follow) before zones are usable.

## Todo List
- [ ] World/zone config + bigger nav grid
- [ ] Corridors + zone backgrounds (baked like the hall)
- [ ] Zone routing by class/tool
- [ ] Stairs + descent transition, levels = floors
- [ ] Depth lighting
