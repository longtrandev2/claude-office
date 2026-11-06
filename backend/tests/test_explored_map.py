"""Tests for the phase 9 explored dungeon map (repo levels/rooms touched by agents)."""

from datetime import UTC, datetime

from app.core.explored_map import ENTRANCE_ROOM, ROOT_LEVEL, ExploredMap, locate

ROOT = "D:\\Project\\AgentWork\\claude-office"
NOW = datetime(2026, 11, 6, tzinfo=UTC)


def win(*parts: str) -> str:
    """Windows-style absolute path under ROOT."""
    return "\\".join([ROOT, *parts])


def test_locate_windows_absolute_file() -> None:
    assert locate(win("frontend", "src", "app", "page.tsx"), ROOT) == (
        "frontend",
        "src",
        "frontend/src/app/page.tsx",
    )


def test_locate_git_bash_and_case_insensitive_root() -> None:
    loc = locate("/d/project/agentwork/CLAUDE-OFFICE/backend/app/main.py", ROOT)
    assert loc == ("backend", "app", "backend/app/main.py")


def test_locate_relative_and_directories() -> None:
    assert locate("hooks/src", ROOT) == ("hooks", "src", None)
    assert locate("hooks", ROOT) == ("hooks", ENTRANCE_ROOM, None)
    assert locate("README.md", ROOT) == (ROOT_LEVEL, ENTRANCE_ROOM, "README.md")
    assert locate(".claude/skills", ROOT) == (".claude", "skills", None)


def test_locate_rejects_outside_and_traversal() -> None:
    assert locate("C:\\Windows\\system32\\x.dll", ROOT) is None
    assert locate("../secrets/.env", ROOT) is None
    assert locate(ROOT, ROOT) is None
    assert locate("/abs/path.txt", None) is None


def test_record_counts_categories_and_recent_files() -> None:
    m = ExploredMap()
    m.record_tool("Read", {"file_path": win("backend", "app", "main.py")}, ROOT, "main", NOW)
    m.record_tool("Edit", {"file_path": win("backend", "app", "config.py")}, ROOT, "a1", NOW)
    m.record_tool("Grep", {"pattern": "x", "path": "backend/app"}, ROOT, "a1", NOW)
    m.record_tool("Bash", {"command": "ls backend"}, ROOT, "main", NOW)  # no path: ignored
    m.record_tool("Read", {"file_path": "C:\\other\\x.py"}, ROOT, "main", NOW)  # outside: ignored
    (level,) = m.to_levels()
    assert level.name == "backend" and level.visits == 3
    (room,) = level.rooms
    assert room.counts == {"read": 1, "write": 1, "search": 1}
    assert room.last_agent_id == "a1"
    assert room.files == ["backend/app/config.py", "backend/app/main.py"]


def test_caps_rooms_and_orders_by_activity() -> None:
    m = ExploredMap()
    for i in range(10):
        for _ in range(i + 1):
            m.record_tool("Read", {"file_path": f"frontend/r{i}/f.ts"}, ROOT, "main", NOW)
    m.record_tool("Read", {"file_path": "backend/app/x.py"}, ROOT, "main", NOW)
    levels = m.to_levels(max_rooms=8)
    assert [lv.name for lv in levels] == ["frontend", "backend"]
    assert levels[0].rooms[0].name == "r9"
    assert len(levels[0].rooms) == 8 and levels[0].hidden_rooms == 2


def test_payload_uses_camel_case() -> None:
    m = ExploredMap()
    m.record_tool("Write", {"file_path": "docs/guides/a.md"}, ROOT, "main", NOW)
    dumped = m.to_levels()[0].model_dump(by_alias=True)
    assert "hiddenRooms" in dumped and "lastAgentId" in dumped["rooms"][0]
