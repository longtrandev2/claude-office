# Phase 03 — i18n: Vietnamese + dungeon strings for all languages

## Context Links
- [plan.md](plan.md) · `frontend/src/i18n/{index,en,es,pt-BR}.ts` · `frontend/src/constants/quotes.ts` · `backend/app/core/quotes.py`

## Overview
- Priority: P1 · Status: done 2026-11-06
- Add `vi` locale (full UI). Add dungeon-theme string set (class names, titles, prop labels, quest board, quotes) in **en, es, pt-BR, vi**.

## Key Insights
- Existing i18n supports pluralization (v0.14). ~288 lines per locale.
- Quotes exist both frontend (`quotes.ts`, 249 lines) and backend (`quotes.py`) → check which renders in bubbles; theme quotes must be locale-aware.

## Requirements
- `vi` selectable in language setting; no missing keys (type-checked against `en`).
- Dungeon wording replaces office wording in existing keys where the concept is the same (boss → Guild Master); new keys only for new concepts.
- Quotes per theme × locale: accept-quest / turn-in / idle / error lines, fantasy flavored, ≥15 each.

## Architecture
- `frontend/src/i18n/vi.ts` (mirrors `en.ts` shape)
- `frontend/src/dungeon/i18n/dungeon-strings-{en,es,pt-BR,vi}.ts` merged into locale at load
- `frontend/src/dungeon/dungeon-quotes.ts` keyed by locale

## Related Code Files
- Create: files above · Modify: `i18n/index.ts` (register vi + theme namespace), quotes consumer, backend `quotes.py` only if bubbles source from backend

## Implementation Steps
1. Trace where bubble quotes come from (frontend vs backend).
2. Create `vi.ts`; ensure TS type forces key parity with `en`.
3. Write dungeon string files for 4 locales (class names, Guild Master titles, props, quest board labels).
4. Locale-aware themed quotes.
5. Add vi to language selector.

## Todo List
- [x] Quote source traced (frontend `constants/quotes.ts` + boss lines in `agentMachineCommon.ts`; backend `quotes.py` on STOP)
- [x] vi.ts full parity (typed `Record<TranslationKey,string>`)
- [x] Dungeon wording in existing keys × 4 locales (35 keys: boss→Guild Master, floors→levels, elevator→portal, desk→station…)
- [x] Quotes × 4 locales in `src/i18n/quotes/*` (14 accept, 14 complete, 10 farewell, 3+3 Guild Master lines); ~300 office lines cut
- [x] Selector shows Tiếng Việt automatically; typecheck/lint green, 161 tests
- Known gap: backend STOP line + AI summaries stay English (backend not locale-aware).

## Success Criteria
- Switching language × theme (4×2) shows no raw keys; typecheck enforces parity.

## Risk Assessment
- Machine-translation quality (es/pt-BR) → keep short, simple phrasing; user reviews vi.

## Security Considerations
- None (static strings).

## Next Steps
- Strings consumed by P04–P07 components.
