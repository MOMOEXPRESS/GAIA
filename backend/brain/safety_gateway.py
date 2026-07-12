from typing import Any

from services.safety_checker import check_red_flags


def run_safety_gateway(text: str, context: dict | None = None) -> dict[str, Any]:
    """Mandatory pipeline — no AI response reaches users without safety checks."""
    flags = check_red_flags(text)
    result = {
        "text": text,
        "has_red_flags": bool(flags),
        "red_flags": flags,
        "blocked": bool(flags),
        "confidence": "moderate",
        "escalation": None,
        "disclaimer": "This is educational wellness information, not medical advice. Consult a licensed healthcare provider for medical concerns.",
    }

    if flags:
        result["escalation"] = "emergency"
        result["text"] = (
            "⚠️ Important: Based on what you've described, please seek immediate medical attention. "
            "Call your local emergency number or go to the nearest emergency department. "
            + result["disclaimer"]
        )
        result["confidence"] = "high"
        return result

    if context:
        missing = []
        if not context.get("has_profile"):
            missing.append("complete health profile")
        if not context.get("has_timeline"):
            missing.append("health timeline data")
        if missing:
            result["confidence"] = "low"
            result["data_gaps"] = missing

    return result
