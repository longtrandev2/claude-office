# Phase 06 — Interactions & FX

## Context Links
- [plan.md](plan.md) · `frontend/src/machines/` (agent state machines) · `components/game/{TrashCanSprite,PrinterStation,AgentStatus}.tsx` · event types in `types/generated.ts`

## Overview
- Priority: P2 · Status: pending
- Pack has only idle/run/hit → "correct-looking" interactions are composed in code: item hand-offs, particles, class work loops, tool-specific effects.

## Key Insights
- Event stream already distinguishes: subagent_start/stop, pre/post_tool_use (tool name), permission_request, context_compaction, stop, reporting, errors.
- Reuse existing state machine transitions; theme only maps state → animation/FX.

## Requirements — event → visual
| Event / state | Dungeon visual |
|---|---|
| subagent_start | portal swirl, hero steps out, Guild Master hands a quest scroll |
| working (per class) | Mage: floating rune glyphs · Blacksmith: hammer anvil + sparks · Knight: shield raise · Scout: reads map · Cleric: stamps scroll |
| tool: Read/Grep | book / magnifier icon pops |
| tool: Edit/Write | quill scratch / anvil sparks |
| tool: Bash | rune fire burst |
| tool: WebSearch/WebFetch | crystal ball glow |
| tool error | red hit flash + small slime pops out & hops away |
| permission_request | "!" bubble, hero raises hand |
| subagent_stop | walks back, drops loot/scroll into guild chest, exits via portal |
| report produced | owl flies scroll to mailbox (replaces printer) |
| context fill | treasure chest fills with coins (replaces trash can) |
| context_compaction | Guild Master casts tidy spell, chest snaps shut |
| main idle (waiting user) | Guild Master sits at war table, zzz |

## Architecture
- `frontend/src/dungeon/fx/` — `particle-burst.ts`, `floating-icon.ts`, `carried-item.ts` (item follows hand-off path), `slime-critter.ts`
- `frontend/src/dungeon/dungeon-event-visual-map.ts` — declarative event/tool → FX table (DRY, easy to extend)

## Related Code Files
- Create: above + `guild-chest-context-meter.tsx`, `owl-courier-report.tsx` · Modify: `TrashCanSprite`, `PrinterStation`, `AgentStatus` (replace in place)

## Implementation Steps
1. Tiny FX toolkit (pooled particles, tweens) — no new deps unless pixi particle lib clearly simpler.
2. Declarative visual map; hook to existing event handlers/store.
3. Hand-off scroll + return loot paths.
4. Class work loops.
5. Chest meter, owl courier, slime on error, permission "!".

## Todo List
- [ ] FX toolkit
- [ ] Event→visual map
- [ ] Hand-off & return
- [ ] Class work loops
- [x] Chest meter + compaction (`TreasureChestContextMeter.tsx` replaces trash can: closed <35%, ajar <70%, open ≥70%, spilling coins ≥90%; stomp squish/shake kept)
- [ ] Owl courier
- [ ] Error slime + permission bubble — BLOCKED on a real error signal: installed hooks (9 events) emit no tool-failure event; verify Claude Code `PostToolUseFailure` (or tool_response error fields) and map it in hooks before adding monsters (anti-slop: no signal, no monster)

## Success Criteria
- Each row of table observable in simulation; FPS stable with 8+ agents.

## Risk Assessment
- Visual noise with many agents → throttle FX per agent, cap particles.

## Security Considerations
- Tool names/inputs only used for lookup; never rendered as HTML.

## Next Steps
- P07 quest board & polish.
