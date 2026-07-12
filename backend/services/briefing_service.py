import json
from datetime import datetime
from typing import Any, Optional

from sqlalchemy.orm import Session

from database import HealthEvent, Profile, User
from memory.engine import list_memories
from services.recommendation_engine import generate_daily_recommendations, list_recommendations
from services.risk_engine import compute_risk_scores
from services.timeline_engine import list_timeline_events, timeline_event_to_dict
from services.wellness_engine import compute_wellness_snapshot


def _time_greeting() -> str:
    hour = datetime.now().hour
    if hour < 12:
        return "Good morning"
    if hour < 17:
        return "Good afternoon"
    return "Good evening"


def _build_narrative(profile_data: dict, risks: list, recs: list, memories: list) -> str:
    """Rule-based narrative (LLM can replace this when Ollama is available)."""
    name = profile_data.get("display_name", "there")
    score = profile_data.get("wellness_snapshot", {}).get("overall_score", 0)
    parts = [f"{_time_greeting()}, {name}."]

    if score:
        parts.append(f"Your overall wellness score is {score}.")

    insights = profile_data.get("wellness_snapshot", {}).get("insights", [])
    if insights:
        parts.append(insights[0])

    if risks:
        parts.append(risks[0]["message"])

    if recs:
        focus = ", ".join(r["title"] for r in recs[:3])
        parts.append(f"Today's focus: {focus}.")

    if memories:
        parts.append(f"I remember: {memories[0].content}")

    parts.append("This is educational wellness information, not medical advice.")
    return " ".join(parts)


def get_daily_briefing(db: Session, user: User, profile: Profile) -> dict[str, Any]:
    profile_data = {
        "display_name": user.display_name,
        "age": profile.age,
        "height_cm": profile.height_cm,
        "weight_kg": profile.weight_kg,
        "sleep_quality": profile.sleep_quality,
        "anxiety_frequency": profile.anxiety_frequency,
        "mood_frequency": profile.mood_frequency,
        "sedentary_hours": profile.sedentary_hours or 0,
        "current_medications": json.loads(profile.current_medications or "[]"),
        "health_goals": json.loads(getattr(profile, "health_goals", None) or "[]"),
        "wellness_snapshot": json.loads(profile.wellness_snapshot or "{}"),
    }

    events = db.query(HealthEvent).filter(HealthEvent.user_id == user.id).all()

    if not profile_data["wellness_snapshot"]:
        profile_data["wellness_snapshot"] = compute_wellness_snapshot(
            profile_data, [{"severity": e.severity} for e in events]
        )

    risks = compute_risk_scores(db, user.id, profile_data)
    recs = generate_daily_recommendations(db, user.id, profile_data, risks)
    timeline = list_timeline_events(db, user.id, limit=5)
    memories = list_memories(db, user.id, tier="semantic", limit=3)

    narrative = _build_narrative(profile_data, risks, recs, memories)

    return {
        "greeting": _time_greeting(),
        "display_name": user.display_name,
        "date": datetime.utcnow().date().isoformat(),
        "wellness": profile_data["wellness_snapshot"],
        "risk_scores": risks,
        "recommendations": recs,
        "recent_timeline": [timeline_event_to_dict(e) for e in timeline],
        "ai_insight": narrative,
        "upcoming": [],
        "disclaimer": "Educational wellness information only. Not medical advice.",
    }
