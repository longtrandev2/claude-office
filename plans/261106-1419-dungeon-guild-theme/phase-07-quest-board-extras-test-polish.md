# Phase 07 — Quest board, extras, test & polish

## Context Links
- [plan.md](plan.md) · `components/game/whiteboard/` · `docs/reference/whiteboard-modes.md` · Command Center components

## Overview
- Priority: P2 · Status: pending
- Reskin whiteboard as parchment Quest Board; Command Center as Guild Hall; full test pass; screenshots; docs.

## Key Insights
- 12 whiteboard modes; reskin frame + key modes first (todo → quest list, kanban → quest stages, tool pie → "spell usage", org chart → party roster, timeline → chronicle). Others keep content, themed frame only.

## Requirements
- Quest Board frame (parchment, pinned notes) applied to all modes.
- Command Center → Guild Hall (each session = party leader at round table).
- Safety sign → "Days without wipe" tavern sign; Employee of month → "Hero of the Week".
- All tests green: `make checkall` equivalent on Windows (backend pytest/ruff/pyright, frontend lint/typecheck/test).

## Architecture
- `themes/dungeon/components/quest-board-frame.tsx`, `guild-hall-command-center-skin.tsx`

## Related Code Files
- Create: above · Modify: whiteboard container (frame slot), README (fork section + screenshots), CHANGELOG

## Implementation Steps
1. Quest board frame + 5 key mode skins.
2. Guild Hall skin for Command Center.
3. Small props renames (hero of the week, tavern sign).
4. Run full checks; add tests for class registry, event→visual map, theme manifest parity (office vs dungeon slots).
5. Screenshots/GIF; README fork section; CREDITS check.

## Todo List
- [ ] Quest board frame + key modes
- [ ] Guild Hall skin
- [ ] Minor prop renames
- [ ] Unit tests (registry, visual map, manifest)
- [ ] Full checks green
- [ ] README/CHANGELOG/screenshots

## Success Criteria
- All checks pass; demo GIF shows real ClaudeKit session in dungeon theme in ≥2 languages.

## Risk Assessment
- Upstream changes during work → periodically `git fetch upstream` and rebase/merge.

## Security Considerations
- Screenshots must not leak private paths/prompts (use simulation for public media).

## Next Steps
- Separate plan: control features (A: two-way hooks — steer/STOP/queue; B: Agent SDK command desk).
