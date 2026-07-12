from typing import Any, Optional

from sqlalchemy.orm import Session

from brain.agents.symptom_agent import SymptomAgent
from brain.agents.wellness_agent import WellnessAgent
from brain.safety_gateway import run_safety_gateway
from memory.engine import list_memories


class Orchestrator:
    """Gaia Brain — routes requests to specialized agents."""

    def __init__(self):
        self.agents = {
            "wellness": WellnessAgent(),
            "symptom": SymptomAgent(),
            "medication": WellnessAgent(),
            "nutrition": WellnessAgent(),
            "mental_health": WellnessAgent(),
            "preventive": WellnessAgent(),
        }

    def classify_intent(self, message: str) -> str:
        lower = message.lower()
        if any(w in lower for w in ("symptom", "pain", "headache", "hurt", "ache", "fever")):
            return "symptom"
        if any(w in lower for w in ("medication", "medicine", "pill", "drug", "dose")):
            return "medication"
        if any(w in lower for w in ("sleep", "tired", "fatigue", "rest", "insomnia")):
            return "wellness"
        if any(w in lower for w in ("food", "nutrition", "eat", "diet", "meal")):
            return "nutrition"
        if any(w in lower for w in ("stress", "anxiety", "mood", "depress", "worry")):
            return "mental_health"
        return "wellness"

    def process(
        self,
        db: Session,
        user_id: str,
        message: str,
        profile_data: Optional[dict] = None,
        intent: Optional[str] = None,
    ) -> dict[str, Any]:
        intent = intent or self.classify_intent(message)
        agent = self.agents.get(intent, self.agents["wellness"])

        memories = list_memories(db, user_id, limit=10)
        memory_context = [m.content for m in memories]

        context = {
            "profile": profile_data or {},
            "memories": memory_context,
            "has_profile": bool(profile_data and profile_data.get("age")),
            "has_timeline": len(memory_context) > 0,
        }

        raw_response = agent.respond(message, context)
        safe = run_safety_gateway(raw_response["text"], context)

        return {
            "intent": intent,
            "agent": agent.name,
            "response": safe["text"],
            "has_red_flags": safe["has_red_flags"],
            "red_flags": safe.get("red_flags", []),
            "confidence": safe["confidence"],
            "disclaimer": safe["disclaimer"],
            "sources_considered": memory_context[:3],
            "data_gaps": safe.get("data_gaps", []),
        }
