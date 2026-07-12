from typing import Any

from services.knowledge_engine import generate_protocol
from services.safety_checker import check_red_flags


class SymptomAgent:
    name = "symptom"

    def respond(self, message: str, context: dict) -> dict[str, Any]:
        flags = check_red_flags(message)
        if flags:
            return {
                "text": (
                    "I've detected language that may indicate a medical emergency. "
                    "Please seek immediate medical attention. "
                    "Detected concerns: " + ", ".join(flags)
                )
            }

        memories = context.get("memories", [])
        parts = []

        if memories:
            related = [m for m in memories if any(w in m.lower() for w in ("symptom", "pain", "headache", "sleep"))]
            if related:
                parts.append(f"Looking at your health history: {related[0]}")

        protocol = generate_protocol([message])
        parts.append(
            f"Based on educational natural wellness patterns, {protocol.get('based_on_imbalance', 'general wellness')} "
            f"may be worth exploring. Match confidence: {protocol.get('match_score', 0):.0%}."
        )
        parts.append(
            "This is not a diagnosis. Please consult a licensed healthcare provider for persistent or worsening symptoms."
        )

        return {"text": " ".join(parts)}
