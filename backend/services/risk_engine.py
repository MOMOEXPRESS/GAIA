import json
import uuid
from datetime import datetime, timedelta
from typing import Any

from sqlalchemy.orm import Session

from database import HealthTimelineEvent, Profile, RiskScore, Symptom


RISK_CATEGORIES = ["sleep", "stress", "activity", "hydration", "medication_adherence", "fatigue"]


def compute_risk_scores(db: Session, user_id: str, profile_data: dict) -> list[dict[str, Any]]:
    """Pattern-based risk awareness — never diagnoses."""
    risks = []
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)

    recent_symptoms = (
        db.query(Symptom)
        .filter(Symptom.user_id == user_id, Symptom.created_at >= week_ago)
        .count()
    )
    recent_events = (
        db.query(HealthTimelineEvent)
        .filter(HealthTimelineEvent.user_id == user_id, HealthTimelineEvent.occurred_at >= week_ago)
        .count()
    )

    sleep_quality = profile_data.get("sleep_quality", "")
    if sleep_quality in ("Poor", "Very poor", "poor"):
        risks.append(_make_risk("sleep", 0.7, "moderate",
            ["Reported poor sleep quality"],
            "Your recent sleep patterns may be worth discussing with a healthcare provider."))

    anxiety = profile_data.get("anxiety_frequency", "")
    if anxiety in ("Often", "Very often", "often", "Daily"):
        risks.append(_make_risk("stress", 0.65, "moderate",
            ["Elevated anxiety frequency reported"],
            "Persistent stress patterns have been noted. Consider stress-management techniques."))

    if recent_symptoms >= 3:
        risks.append(_make_risk("fatigue", 0.6, "moderate",
            [f"{recent_symptoms} symptoms logged in the past week"],
            "You've logged several symptoms recently. It may be worthwhile to discuss persistent changes with your provider."))

    sedentary = profile_data.get("sedentary_hours") or 0
    if sedentary > 8:
        risks.append(_make_risk("activity", 0.55, "low",
            [f"Sedentary hours: {sedentary}/day"],
            "Low activity levels detected. Even short walks can support overall wellness."))

    if recent_events == 0 and profile_data.get("age"):
        risks.append(_make_risk("activity", 0.3, "low",
            ["No health events logged this week"],
            "Consider logging how you're feeling to help Gaia track your wellness over time."))

    for risk in risks:
        _persist_risk(db, user_id, risk)

    return risks


def _make_risk(category: str, score: float, level: str, factors: list, message: str) -> dict:
    return {"category": category, "score": score, "level": level, "factors": factors, "message": message}


def _persist_risk(db: Session, user_id: str, risk: dict):
    entry = RiskScore(
        id=str(uuid.uuid4()),
        user_id=user_id,
        category=risk["category"],
        score=risk["score"],
        level=risk["level"],
        factors=json.dumps(risk["factors"]),
        message=risk["message"],
        computed_at=datetime.utcnow(),
    )
    db.add(entry)
    db.commit()
