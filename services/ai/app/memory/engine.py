"""Memory Engine client stub (Blueprint Vol 5 §4, Vol 7 §5).

Month 1 provides the interface the Orchestrator programs against. The real
implementation (Neo4j knowledge graph + vector store) plugs in behind this
interface; the graceful-degradation contract (Vol 7 §3.5) is honored from day
one: when memory is unavailable, the Orchestrator continues with general help.
"""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class MemoryContext:
    """A compact context graph returned for prompt assembly (Vol 7 §3.2 step 2)."""

    facts: list[str] = field(default_factory=list)
    recent_episodes: list[str] = field(default_factory=list)
    available: bool = True


class MemoryEngine:
    """Interface stub — replaced by the graph+vector implementation in Month 2+."""

    async def get_context(self, user_id: str) -> MemoryContext:
        # No memories yet: the AI is still "getting to know" the user
        # (onboarding empty state, Vol 3 §4.1 Step 6).
        return MemoryContext(facts=[], recent_episodes=[], available=True)
