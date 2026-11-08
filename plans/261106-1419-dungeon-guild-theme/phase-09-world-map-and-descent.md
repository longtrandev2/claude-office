# Phase 09 — Task zones (forge, meeting room, library, dungeon below)

## Context Links
- [plan.md](plan.md) · [phase-08](phase-08-ux-and-liveliness.md) (pixel camera, HTML text overlay) · [phase-06](phase-06-interactions-and-fx.md) (tool categories, monsters)
- Engine: `frontend/src/constants/canvas.ts`, `frontend/src/systems/{navigationGrid,queuePositions,pathfinding}.ts`, `frontend/src/machines/*`
- Signals: `agentType` on agents (P5), tool category from bubble icon (`frontend/src/dungeon/tool-activity.ts`)

## Overview
- Priority: P1 (next) · Status: M1 + M2 done 2026-11-08 (awaiting user review), M3 next · Size: XL
- Zones follow the KIND OF TASK an agent is doing; heroes walk to that zone to work. (An earlier "dungeon = codebase" attempt was reverted on 2026-11-08 at the user's request.)

## Decisions (user, 2026-11-08)
- **Zone rule = hybrid**: agent type sets the home zone; the current tool can pull the hero to another zone for a while, then it returns home.
- **Layout = Guild Hall in the middle + surface wings + monster dungeon downstairs** (scroll/pan down to descend).

## Zone map (draft — confirm names/art with user)
| Zone | Work | Home for (agent type) | Pulled in by (tool) |
|---|---|---|---|
| Guild Hall (centre) | orchestration, hand-offs | main agent (Guild Master) | Task/Agent |
| Forge | write/edit code | fullstack-developer, code-simplifier | Edit, Write, MultiEdit |
| Meeting room / war room | plan, brainstorm | planner, brainstormer, project-manager | TodoWrite |
| Library | research, read, search | researcher, Explore, docs-manager | Read, Grep, Glob, WebSearch, WebFetch |
| Review chamber | code review | code-reviewer | — |
| Dungeon (below) | debug, test, fix; monsters live here | debugger, tester | Bash test/build commands |
| Tavern | idle / finished / waiting | anyone idle | — |

## Requirements
- Routing: target zone = tool zone while a tool of that category is active (hold ≥ ~5 s, hysteresis so bursts don't jitter), else home zone; idle → tavern.
- Each zone has stations (reuse `DungeonStations` style) and zone-specific props from the CC0 packs (anvil/blacksmith for forge, globe/war table for meeting room, books/scrolls for library, crates/cells for dungeon).
- Dungeon below: reached by stairs from the hall; darker lighting; error monsters spawn here once a real tool-failure hook signal exists (no signal, no monster).
- Readability: wider world fills wide screens; in-scene text as crisp HTML overlay; integer zoom (from P8).
- Multi-session unchanged: each session has its own world; Sessions list / Command Center switch between them.

## Milestones
- **M1 World & camera (L)**: bigger world (hall centre + wings + dungeon below), pixel camera with integer zoom + pan, HTML text overlay. Keep the hall's existing coordinates as one region so current flows keep working.
- **M2 Zones & stations (M)**: bake each zone like the hall (composer + layout data), stations per zone, lighting.
- **M3 Routing (L)**: zone choice (hybrid rule) + walking between zones via doors/stairs; nav grid extended or scripted corridor paths; Guild Master stays in the hall.
- **M4 Dungeon life (M)**: monsters (after error signal is verified), tavern idle behaviour, polish.

## Risks
- Nav grid (40x32), desk/queue positions are hall-only and partly mirrored in the backend (`DESKS_PER_ROW`, `MIN_DESK_COUNT`) → treat the hall as region 0; new zones get their own positions (frontend-only).
- Agent state machines assume desk seating → add zone stations without breaking arrival/departure queues; extend tests first.

## Todo List
- [x] M1 world & camera (2026-11-08)
  - World: hall stays at origin (engine coords unchanged); Library/Forge left wing (x −768..0), War Room/Review Chamber right wing (x 1280..2048), Tavern + Dungeon lower level (y 1024..1792). Data in `frontend/src/dungeon/dungeon-world-layout.ts`; rooms baked by `compose-dungeon-zone-room-canvas.ts` (empty shells, no lights yet).
  - Pixel camera: `systems/pixelCamera.ts` + `stores/cameraStore.ts` + `hooks/usePixelCameraInput.ts`; integer device-px-per-art-px zoom 1–6, default frames the hall (2× on 1917x876 → hall + both wings fill the width), wheel zoom at cursor, drag pan, double-click / `Home` reset, `+`/`-`, arrow keys jump to the neighbouring room and frame it (user request 2026-11-08; `dungeon/world-zone-navigation.ts`). react-zoom-pan-pinch removed from the game view (Command Center still uses it).
  - HTML overlay `components/game/SceneTextOverlay.tsx`: zone plates, hero names, Guild Master title, bubbles (parchment, no emoji badge — the pixel tool icon above the head already shows the tool).
  - Still canvas text: desk task marquee, chest %, teammate nameplates, elevator floor sign → move to overlay in M2 if still hard to read.
- [x] M2 zones & stations (2026-11-08)
  - Furnishing data `frontend/src/dungeon/zone-room-decor-layouts.ts` (room-local), world offsets in `world-ambience-layout.ts`; baked by `compose-dungeon-zone-room-canvas.ts`; animated torches/candles + light pools share `DungeonHallAmbience`; stations drawn by `DungeonZoneStations.tsx` (same table as hall).
  - Library: 3 shelves with painted book spines (banner palette), beige rug, quill/globe stations, candles. Forge: Niji lava furnace, weapons on wall, barrel/crate, hammer/sword/axe/knife stations, torch. War Room: red/blue banners, red rug, quill/globe/coin, torch. Review Chamber: glowing truth chest, blue rug, quill/flask, candles. Tavern: wine cabinets, barrels, 6 tables with drinks/coins, torches. Dungeon: stairs from the hall, 4 jail cells, lever/bomb/button test benches, sparse torches.
  - Room signposts at the scene edges (arrow + room name, clickable) and arrow keys jump rooms (edge-based neighbours, min 2x when framing a room).
  - New CC0 props cropped from jojomod + Niji (see CREDITS.md); `blacksmith-anvil` renamed `three-tier-shelf` (it is a shelf).
  - Heroes still never leave the hall (routing = M3).
- [ ] M3 routing (hybrid)
- [ ] M4 dungeon life
