"""Tests for subagent type normalization stored on Agent.agent_type."""

from app.core.state_machine import _normalize_agent_type


def test_normalizes_case_and_whitespace() -> None:
    assert _normalize_agent_type("  Planner ") == "planner"


def test_empty_becomes_none() -> None:
    assert _normalize_agent_type(None) is None
    assert _normalize_agent_type("") is None
    assert _normalize_agent_type("   ") is None


def test_caps_length() -> None:
    assert len(_normalize_agent_type("x" * 500) or "") == 64
