# Windows dev setup (no make / tmux)

Tested on Windows 11, Git Bash + PowerShell, node 24, Python 3.14, uv 0.13.

## 1. Prerequisites

```powershell
winget install astral-sh.uv        # Python env/package manager (backend + hooks need it)
```
Node 20+ required. Bun is optional — `npm` works (Next falls back fine).

## 2. Install dependencies

```bash
cd backend  && uv sync
cd ../hooks && uv sync
cd ../frontend && npm install
```

## 3. Install Claude Code hooks

Back up first — the installer edits the global `~/.claude/settings.json`
(it also writes `settings.json.bak`):

```bash
cp ~/.claude/settings.json ~/.claude/settings.json.before-claude-office
cd hooks && bash ./install.sh
```
Check `claude-office-hook` resolves: `Get-Command claude-office-hook` (lives in `%USERPROFILE%\.local\bin`).
Restart Claude Code afterwards.

Uninstall: `cd hooks && bash ./uninstall.sh`.

## 4. Port 8000 already in use?

Pick another port (example: 8765) and point both producers/consumers at it:

- Frontend: `frontend/.env.local` (gitignored)
  ```
  NEXT_PUBLIC_API_URL=http://localhost:8765
  ```
- Hooks: append to `~/.claude/claude-office-config.env`
  ```
  CLAUDE_OFFICE_API_URL=http://localhost:8765/api/v1/events
  ```
  Also set `CLAUDE_OFFICE_STRIP_PREFIXES` to your project root prefix, e.g. `"D--Project-AgentWork-,D--Project-"`.

## Quick start

Double-click `start-agentdungeon.cmd` in the repo root: it opens the backend and frontend in two PowerShell windows (UTF-8 mode, stable key, no reload) and then opens the browser already signed in. Close those two windows to stop.

## 5. Run (two terminals)

```bash
# terminal 1 — backend (UTF-8 mode is required on Windows: without it the
# logger crashes on Vietnamese/non-ASCII text and requests fail with 500)
export PYTHONUTF8=1 PYTHONIOENCODING=utf-8
# Reuse the hooks' key so it stays stable across --reload restarts
export CLAUDE_OFFICE_API_KEY=$(grep '^CLAUDE_OFFICE_API_KEY=' ~/.claude/claude-office-config.env | cut -d= -f2- | tr -d '"')
# No --reload on Windows: WatchFiles reloads can hang and keep serving old code.
cd backend && uv run uvicorn app.main:app --host 127.0.0.1 --port 8765

# terminal 2 — frontend
cd frontend && npm run dev
```

Open `http://localhost:3000/?token=<CLAUDE_OFFICE_API_KEY>` (the same key as above).

## 6. Simulate events (no real agent needed)

```bash
CLAUDE_OFFICE_API_URL=http://localhost:8765/api/v1/events uv run --project backend python scripts/simulate_events.py
```

## 7. Rebuild dungeon theme atlas

```bash
node scripts/build-dungeon-atlas.mjs   # reads assets-src/dungeon/0x72_DungeonTilesetII_v1.7
```
