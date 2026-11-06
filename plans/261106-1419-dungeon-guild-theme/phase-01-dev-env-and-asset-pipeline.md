# Phase 01 — Dev env (Windows) + asset sourcing & atlas pipeline

## Context Links
- [plan.md](plan.md) · upstream README · `docs/guides/quickstart.md` · `.claude/skills/office-sprite/SKILL.md`

## Overview
- Priority: P0 (blocks everything) · Status: pending
- Get backend+frontend running on Windows without make/tmux; acquire 0x72 DungeonTileset II + supplements; build sprite atlas pipeline.

## Key Insights
- No make/uv/bun/tmux/ImageMagick locally; node 24, python 3.14, docker present. Backend needs Python 3.13+ (3.14 OK) + uv.
- 0x72 DungeonTileset II (from memory, VERIFY): CC0, 16×16 tiles, heroes knight/wizard/elf/dwarf/lizard (m/f) with idle 4f + run 4f + hit 1f; monsters (goblin, imp, skeleton, orc, slime-like, demon, necromancer…); separate weapon sprites; animated chests, flasks, coins, spikes, fountains. Ships a tile-list text with sprite coordinates.
- Likely gaps: ranger/rogue/cleric/scribe/merchant looks, owl, quest board, portal, anvil, bookshelf, cauldron, torches/banners.

## Requirements
- Functional: `npm`-based dev start for frontend; `uv run` backend; hooks installed for Claude Code on Windows.
- Atlas: script converts pack sheet + tile list → PixiJS spritesheet JSON (`frames` + `animations`).
- Non-functional: all assets CC0 or license allowing modification + redistribution in public fork.

## Architecture
```
assets-src/dungeon/<pack>/ (raw, gitignored if license forbids redistribution)
  └─ scripts/build-dungeon-atlas.mjs → frontend/public/themes/dungeon/atlas.{png,json}
```
Supplement priority: (1) other CC0 packs with matching 16px top-down style (e.g. Purple Dungeon TileSet, Kenney 16px) → (2) recolor/kitbash 0x72 parts → (3) AI-generate via repo `office-sprite` skill, downscale to 16px, palette-snap.

## Related Code Files
- Create: `scripts/build-dungeon-atlas.mjs`, `frontend/public/themes/dungeon/{atlas.png,atlas.json,CREDITS.md}`, `docs/guides/windows-dev-setup.md`
- Modify: `.gitignore` (raw asset dir if needed)

## Implementation Steps
1. Install uv (`pip install uv` or winget). Run backend `cd backend && uv sync && uv run uvicorn …` (copy cmd from Makefile). Frontend `npm install && npm run dev`.
2. Install hooks without make: run the hooks installer target's underlying command manually; confirm events arrive (`/health`, WS in devtools).
3. Run a simulation scenario (`scripts/scenarios/`) to confirm visuals work.
4. Download 0x72 pack manually (user or browser); verify license text; record in CREDITS.md.
5. Inventory gaps vs class/prop list (phase 05/04); pick supplement packs; verify licenses.
6. Write atlas build script (sharp or pure node PNG lib; no ImageMagick dependency).
7. Document Windows setup.

## Todo List
- [ ] Backend + frontend run on Windows
- [ ] Hooks firing from Claude Code
- [ ] Simulation scenario renders
- [ ] 0x72 downloaded, license verified
- [ ] Gap inventory + supplement packs chosen & licensed
- [ ] Atlas build script + generated atlas
- [ ] CREDITS.md + windows-dev-setup.md

## Success Criteria
- `localhost:3000` shows live office driven by a real Claude Code session on this machine.
- `atlas.json` loads in PixiJS `Assets.load` with named animations (e.g. `wizard_m_idle`, `wizard_m_run`).

## Risk Assessment
- Pack license differs from memory → switch to alternative CC0 pack before investing in P5.
- Windows hook path/encoding issues (upstream fixed an OpenSSL hook crash) → use Docker fallback (`docker compose`, UI :8050).

## Security Considerations
- Hooks send tool I/O + file paths; keep `LOCALHOST_ONLY` default; never set `CLAUDE_OFFICE_ALLOW_REMOTE`.
- Don't commit `backend/.env` (OAuth token).

## Next Steps
- Phase 02 consumes atlas paths via theme manifest.
