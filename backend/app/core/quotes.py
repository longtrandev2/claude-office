"""Guild Master dialogue for when the main agent finishes a turn.

Shown in the Guild Master's bubble on STOP when no AI-generated summary is
available. English only: backend bubbles are not localized yet (the frontend
localizes adventurer dialogue; see frontend/src/constants/quotes.ts).
Kept short and few on purpose — every line should sound like this world.
"""

import random

JOB_COMPLETION_QUOTES: list[str] = [
    "Quest complete. The hall is quiet again.",
    "That's the job done. Who's buying at the tavern?",
    "Mark it on the board: finished.",
    "Every scroll accounted for.",
    "Done. Not a single torch lost.",
    "The map is updated. Rest your blades.",
    "Good work, all of you.",
    "Loot sorted, quest closed.",
    "That one took some digging. Done.",
    "Finished. I'll be at the war table.",
    "Seal it and file it. We're done here.",
    "The tunnels are clear.",
    "Another quest off the board.",
    "Report written. Ready for the next one.",
    "All tasks done. Awaiting your orders.",
    "Done. Ring the bell when you need us.",
]


def get_random_job_completion_quote() -> str:
    """Return a random Guild Master completion line."""
    return random.choice(JOB_COMPLETION_QUOTES)
