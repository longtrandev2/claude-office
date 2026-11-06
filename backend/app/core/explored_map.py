"""Explored dungeon map: which parts of the repo agents have touched.

Phase 9 "Dungeon = Codebase": the repo is the dungeon. A level is a top-level
folder, a room is a second-level folder, files are spots inside a room. Only
paths that agents actually touched in this session appear (fog of war).

Pure bookkeeping from tool inputs (``file_path`` / ``notebook_path`` /
``path``) — no filesystem access, no file contents.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from app.models.explored_map import ExploredLevel, ExploredRoom

#: Tool name → activity category (mirrors frontend ``tool-activity.ts``).
TOOL_CATEGORY: dict[str, str] = {
    "Read": "read",
    "Grep": "search",
    "Glob": "search",
    "Edit": "write",
    "Write": "write",
    "MultiEdit": "write",
    "NotebookEdit": "write",
}
_PATH_KEYS = ("file_path", "notebook_path", "path")
ROOT_LEVEL = "(root)"
ENTRANCE_ROOM = "(entrance)"
MAX_FILES_PER_ROOM = 12
_GIT_BASH_DRIVE = re.compile(r"^/([a-zA-Z])/")


def _normalize(path: str) -> str:
    """Forward slashes, Git-Bash drive (/d/x becomes d:/x), no trailing slash."""
    p = path.strip().replace("\\", "/")
    m = _GIT_BASH_DRIVE.match(p)
    if m:
        p = f"{m.group(1)}:/{p[3:]}"
    return p.rstrip("/")


def _relative_parts(path: str, root: str | None) -> list[str] | None:
    """Path segments relative to the project root, or None if outside it."""
    p = _normalize(path)
    is_absolute = p.startswith("/") or bool(re.match(r"^[a-zA-Z]:/", p))
    if is_absolute:
        if not root:
            return None
        r = _normalize(root)
        # Windows paths are case-insensitive; compare lowercased prefixes.
        if not (p.lower() == r.lower() or p.lower().startswith(r.lower() + "/")):
            return None
        p = p[len(r) :]
    parts = [s for s in p.split("/") if s and s != "."]
    if any(s == ".." for s in parts):
        return None
    return parts


def _looks_like_file(name: str) -> bool:
    """Heuristic without filesystem access: 'x.ts' is a file, '.claude' is a folder."""
    return "." in name.lstrip(".")


def locate(path: str, root: str | None) -> tuple[str, str, str | None] | None:
    """Map a path to (level, room, file) — or None when outside the repo."""
    parts = _relative_parts(path, root)
    if not parts:
        return None
    file_name = parts[-1] if _looks_like_file(parts[-1]) else None
    dirs = parts[:-1] if file_name else parts
    level = dirs[0] if dirs else ROOT_LEVEL
    room = dirs[1] if len(dirs) >= 2 else ENTRANCE_ROOM
    rel_file = "/".join(parts) if file_name else None
    return level, room, rel_file


@dataclass
class _Room:
    counts: dict[str, int] = field(default_factory=dict)
    visits: int = 0
    last_agent_id: str | None = None
    last_seen: datetime | None = None
    files: list[str] = field(default_factory=list)


@dataclass
class ExploredMap:
    """Per-session explored tree: level → room → stats."""

    levels: dict[str, dict[str, _Room]] = field(default_factory=dict)

    def record_tool(
        self,
        tool_name: str | None,
        tool_input: dict[str, Any] | None,
        root: str | None,
        agent_id: str,
        when: datetime | None,
    ) -> None:
        """Record one tool use if it targets a path inside the repo."""
        category = TOOL_CATEGORY.get(tool_name or "")
        if not category or not tool_input:
            return
        raw = next(
            (tool_input.get(k) for k in _PATH_KEYS if isinstance(tool_input.get(k), str)), None
        )
        if not raw:
            return
        located = locate(raw, root)
        if not located:
            return
        level, room_name, rel_file = located
        room = self.levels.setdefault(level, {}).setdefault(room_name, _Room())
        room.counts[category] = room.counts.get(category, 0) + 1
        room.visits += 1
        room.last_agent_id = agent_id
        room.last_seen = when
        if rel_file:
            if rel_file in room.files:
                room.files.remove(rel_file)
            room.files.insert(0, rel_file)  # most recent first
            del room.files[MAX_FILES_PER_ROOM:]

    def to_levels(self, max_levels: int = 10, max_rooms: int = 8) -> list[ExploredLevel]:
        """Most active levels/rooms first; overflow rooms are counted, not listed."""
        out: list[ExploredLevel] = []
        for name, rooms in self.levels.items():
            ranked = sorted(rooms.items(), key=lambda kv: kv[1].visits, reverse=True)
            out.append(
                ExploredLevel(
                    name=name,
                    visits=sum(r.visits for r in rooms.values()),
                    rooms=[
                        ExploredRoom(
                            name=rn,
                            counts=dict(r.counts),
                            visits=r.visits,
                            last_agent_id=r.last_agent_id,
                            last_seen=r.last_seen,
                            files=list(r.files),
                        )
                        for rn, r in ranked[:max_rooms]
                    ],
                    hidden_rooms=max(0, len(ranked) - max_rooms),
                )
            )
        out.sort(key=lambda lv: lv.visits, reverse=True)
        return out[:max_levels]
