"""Explored dungeon map payload (phase 9): repo levels and rooms agents touched."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class ExploredRoom(BaseModel):
    """A second-level folder agents have touched this session."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    name: str
    counts: dict[str, int] = Field(default_factory=dict)  # category → tool uses
    visits: int = 0
    last_agent_id: str | None = None
    last_seen: datetime | None = None
    files: list[str] = Field(default_factory=list)  # repo-relative, most recent first


class ExploredLevel(BaseModel):
    """A top-level folder (dungeon level) with its explored rooms."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    name: str
    visits: int = 0
    rooms: list[ExploredRoom] = Field(default_factory=list)
    hidden_rooms: int = 0
