# Phase 02 — Theme system foundation

## Context Links
- [plan.md](plan.md) · `frontend/src/hooks/useOfficeTextures.ts` · `frontend/src/stores/` (Zustand slices) · `backend/app/api/routes/preferences.py`

## Overview
- Priority: P0 · Status: done 2026-11-06 (ThemedSlot deferred to P4 — YAGNI until first themed component)
- Introduce selectable themes (`office`, `dungeon`) so all visuals/strings resolve through a theme manifest. No visual change yet besides toggle.

## Key Insights
- Textures centralized in `useOfficeTextures.ts` (OfficeTextures interface) → swap source by theme.
- Preferences already persisted via backend `PUT /preferences/{key}` → store `theme` there.
- Components (Elevator, PrinterStation, TrashCanSprite, CityWindow, Whiteboard, WallClock…) draw partly with Graphics → need per-theme render overrides, not just texture swaps.

## Requirements
- Theme manifest: id, texture map, atlas path, role→class map, prop overrides (component slot → themed component), palette, string namespace.
- **Entry menu theme picker** (user decision 2026-11-06): on opening the app, a start menu/title screen lets the user pick theme (office / dungeon) with preview thumbnails; choice remembered, menu reachable again from header.
- Settings UI: same selector in General Settings; live switch without reload if cheap, else reload.
- Office theme behavior unchanged (existing tests pass).

## Architecture
```
frontend/src/themes/
  theme-types.ts               # ThemeManifest interface
  theme-registry.ts            # { office, dungeon }
  use-active-theme.ts          # reads preference, returns manifest
  office/office-theme-manifest.ts
  dungeon/dungeon-theme-manifest.ts
  dungeon/components/…         # themed prop components (phase 04/06)
```
Component slot pattern: `<ThemedSlot name="printer" fallback={PrinterStation} />` → manifest may supply replacement.

## Related Code Files
- Create: files above
- Modify: `useOfficeTextures.ts` (theme-aware paths), `OfficeGame.tsx` (slot rendering), settings modal component, i18n index (namespace)

## Implementation Steps
1. Define `ThemeManifest` type; port current office paths into `office-theme-manifest.ts`.
2. `use-active-theme` hook backed by preferences store.
3. Make `useOfficeTextures` read paths from manifest; load atlas when manifest has one.
4. Add `ThemedSlot` for swappable prop components; wire in `OfficeGame.tsx`.
5. Add theme selector to settings + i18n keys.
6. Dungeon manifest skeleton (falls back to office assets until P4/P5).

## Todo List
- [x] ThemeManifest type + registry (`frontend/src/themes/`)
- [x] Office manifest (parity, test-enforced)
- [x] Theme-aware texture loading (`useOfficeTextures`, reloads on switch)
- [ ] ThemedSlot + OfficeGame wiring → moved to P4
- [x] Settings selector persisted (pref key `theme`)
- [x] Dungeon manifest skeleton
- [x] Entry menu theme picker (first launch + header THEME button), live canvas preview from 0x72 sheet, taste-skill inspected at 1440/768/390

## Success Criteria
- Toggle switches theme id persistently; office renders identically; `npm test` + frontend lint/typecheck green.

## Risk Assessment
- Over-abstracting → keep manifest minimal; add fields only when a phase needs them (YAGNI).
- Merge conflicts with upstream → keep edits to existing files small; logic lives in `themes/`.

## Security Considerations
- Preference value validated against registry ids (no arbitrary path loading).

## Next Steps
- P03 string namespace, P04 environment, P05 characters.
