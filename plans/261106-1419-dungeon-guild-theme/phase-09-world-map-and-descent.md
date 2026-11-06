# Phase 09 — Dungeon = Codebase (world map & the descent)

## Context Links
- [plan.md](plan.md) · [phase-08](phase-08-ux-and-liveliness.md) (pixel camera, HTML text overlay) · hook tool inputs carry file paths (`hooks/.../event_mapper.py`) · `backend/app/core/{state_machine,floor_config}.py` · `frontend/src/dungeon/*`

## Overview
- Priority: P1 (next after P6) · Status: M1 done; M2 first cut done 2026-11-06 · Size: XL (3 milestones)
- The Guild Hall is the surface (orchestration). Below it, the dungeon IS the repo: heroes go down to the folder of the file they are reading/editing; rooms appear only once explored.

## Decisions (user, 2026-11-06)
- **Map = A**: level = top-level folder (`frontend/` → B1, `backend/` → B2 …); room = 2nd-level folder; files = spots inside a room.
- **View = X**: one vertical cross-section — hall on top, levels stacked below; camera pans vertically; each level is a wide strip so wide screens are filled (also fixes the small-text problem with P8 camera + HTML text overlay).
- **Fog of war**: only paths touched this session are shown (honest, compact, scales to huge repos).
- **Guild Master stays in the hall** at the war table; a ghost marker shows which room the main agent is working in. Subagents walk down and back.

## Requirements
- Path → (level, room): relative to project root; Windows/Unix separators; outside-repo paths ignored; per-level cap ~6–8 most active rooms, rest grouped as "deeper tunnels".
- Per room: tool-category counts (read/search/write/bash/web), last visitor, last activity time, error count (when an error signal exists).
- Hero movement: go down via the stairs when a tool targets a file in another room; hysteresis (stay N seconds before moving again) so rapid Grep/Read bursts don't jitter; return to hall on hand-off/finish carrying loot to the chest.
- Monsters spawn in the room of the failing file — only once a real tool-failure hook signal is verified (Claude Code `PostToolUseFailure` or equivalent). No signal, no monster.
- Lighting: deeper levels darker; explored rooms lit by torches, unexplored stay in fog.

## Milestones
- **M1 — Explored-map data (S/M)**: backend aggregates a per-session explored tree from tool inputs (file_path, path, glob roots); sent in session state; unit tests for path → (level, room) mapping and caps. Optional: show as a list in the Party panel.
- **M2 — Cross-section view (L)**: render levels/rooms with the baked-canvas approach (reuse hall composer), fog, stairs, vertical camera with integer zoom (P8), crisp HTML text overlay.
- **M3 — Descent behaviour (L)**: heroes route hall ↔ stairs ↔ room with hysteresis; Guild Master ghost marker; loot carried back; monsters when error signal exists.

## Risks
- Engine positions (desks, queues, nav grid 40×32) are hall-only → dungeon levels need their own nav grids or simple scripted paths (prefer scripted: corridors are linear).
- Backend `DESKS_PER_ROW`/`MIN_DESK_COUNT` coupling stays hall-only; dungeon positions are frontend-derived from the explored tree.
- Privacy: paths stay local (LOCALHOST_ONLY); never send file contents.

## Todo List
- [x] M1 explored-map data + tests (`backend/app/core/explored_map.py`, `models/explored_map.py`, GameState.exploredMap, TS types; verified live: `.claude` level with `rules`/`skills` rooms from real Read/Grep)
- [~] M2 cross-section view: first cut done — `DungeonDescent.tsx` under the hall in a scrollable centre panel (scroll down = descend): level strips (parchment B-plaque, darker per depth), chambers with atlas stone floor, pixel tool icons + counts, recent files, torch outline when active <60s, "+N deeper tunnels"; all HTML so text is crisp; fed by `exploredMapStore` from WS state.
- [ ] M2 remaining: stairs linking hall ↔ B1, corridors between levels, fog visuals for unexplored, pixel camera (integer zoom) for the hall part
- [ ] M3 descent behaviour, ghost marker, loot
- [ ] Monsters (blocked on error signal)
