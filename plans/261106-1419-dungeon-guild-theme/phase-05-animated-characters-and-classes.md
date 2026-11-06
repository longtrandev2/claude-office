# Phase 05 — Animated characters & classes

## Context Links
- [plan.md](plan.md) · `frontend/src/components/game/{AgentSprite,BossSprite,AgentStatus}.tsx` · `frontend/src/systems/` (animation, pathfinding) · `backend/app/core/summary_service.py:44` (subagent_type name map)

## Overview
- Priority: P1 (core of the theme) · Status: in progress — heroes live; next: class stations replacing office desks, fantasy names/levels
- Replace capsule agents with animated pixel characters; map ClaudeKit `agent_type` → class; add variety (gender/palette/names/level).

## Key Insights
- Agents currently capsules (Graphics). Movement/state already driven by systems + store → renderer swap, logic stays.
- Pack heroes: idle 4f, run 4f, hit 1f, face right only → flip X for left; weapons are separate sprites → attach & animate in code.
- `agent_type` available on subagent_start events.

## Requirements — class map (configurable in class registry)
| agent_type | Class | Base sprite (0x72, verify) | Prop/weapon |
|---|---|---|---|
| main | Guild Master | knight (gold tint) | banner/sword, war table |
| planner | Cartographer Mage | wizard | staff + map |
| researcher, Explore | Scout | elf | bow |
| fullstack-developer | Blacksmith Warrior | dwarf | hammer, anvil |
| debugger | Monster Hunter | lizard | daggers |
| tester | Shield Knight | knight | shield |
| code-reviewer | Inquisitor | angel | golden sword / tome |
| docs-manager | Scribe | doc | quill |
| git-manager | Courier/Merchant | dwarf (recolor) | backpack |
| brainstormer | Oracle | orc_shaman | crystal ball |
| debugger (alt) | Monster Hunter | lizard | knife ×2 |
| ui-ux-designer | Enchanter | pumpkin_dude or wizzard_f | green staff |
| unknown | Novice Adventurer | random hero | — |
- Pack names: `wizzard_*` (double z). Heroes 16×28 → scale ×2 (32×56) or ×3 (48×84); pick in P5 vs current agent box ~60×75 (integer scale only).
- Monsters reserved for FX: slug/swampy = error slime, chest_mimic = fun error variant, imp/goblin = bug critters.
- Variety: m/f variants, palette-swap shader/tint per instance, fantasy name generator (seeded by agent id), level badge (tool calls → XP).

## Architecture
- `frontend/src/dungeon/components/animated-hero-sprite.tsx` — PixiJS AnimatedSprite from atlas; states idle/run/work/hit; flip by velocity.
- `frontend/src/dungeon/dungeon-class-registry.ts` — agent_type → {sprite, weapon, station, colors, i18n key}.
- `frontend/src/dungeon/hero-variety.ts` — seeded variant, name, level calc.
- `AgentSprite`/`BossSprite` render the animated heroes directly (capsule kept only as load-failure fallback).

## Related Code Files
- Create: above · Modify: `AgentSprite.tsx`, `BossSprite.tsx` (render heroes directly)

## Implementation Steps
1. AnimatedHeroSprite with idle/run from atlas; integer positions; flip.
2. Hook into existing movement state (walking vs idle vs working).
3. Class registry + mapping from `agent_type` (normalize ClaudeKit names, case-insensitive).
4. Weapon/prop attachment with simple code animations (bob, swing).
5. MVP: Guild Master + Mage + Blacksmith + Shield Knight + Novice; then rest.
6. Variety: variants, names, level badge.

## Todo List
- [x] AnimatedHeroSprite (`HeroSprite.tsx`: idle/run 4f from atlas, faces travel direction, shadow, ticker-driven, reduced-motion still)
- [x] State wiring idle/run (movement-detected); work loop → P6
- [x] Class registry + mapping (`hero-class-registry.ts`; backend now stores `agent_type` on Agent → `agentType` in frontend state; verified with 6 typed demo subagents)
- [ ] Weapons/props
- [x] MVP 4 classes + Novice → all 11 classes + Novice done; Guild Master = knight_m (seated + walking)
- [x] Remaining classes
- [ ] Variety (variants, names, levels)

## Success Criteria
- Simulation with mixed agent_types shows correct classes, smooth walk/idle, no capsules.

## Risk Assessment
- Missing class looks → recolor/kitbash before AI-generation.
- Many agents → AnimatedSprite pooling; share textures.

## Security Considerations
- agent_type is untrusted string → only used as lookup key; never as path.

## Next Steps
- P06 adds work loops & interactions per class.
