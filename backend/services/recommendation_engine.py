import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy.orm import Session

from database import Goal, Profile, Recommendation


def generate_daily_recommendations(
    db: Session,
    user_id: str,
    profile_data: dict,
    risk_scores: list[dict],
) -> list[dict[str, Any]]:
    """Generate personalized daily focus items."""
    recs = []

    sleep = profile_data.get("sleep_quality", "")
    if sleep in ("Poor", "Very poor", "poor"):
        recs.append(_rec("Sleep before 23:00", "Your sleep quality could benefit from a consistent bedtime.", 8, "sleep"))

    if (profile_data.get("sedentary_hours") or 0) > 6:
        recs.append(_rec("Walk 30 minutes", "Movement can support energy and recovery.", 7, "activity"))

    recs.append(_rec("Drink 2L of water", "Hydration supports overall wellness.", 6, "hydration"))

    anxiety = profile_data.get("anxiety_frequency", "")
    if anxiety in ("Often", "Very often", "Daily"):
        recs.append(_rec("10-minute breathing exercise", "A short mindfulness break may help manage stress.", 7, "mental_health"))

    goals = profile_data.get("health_goals") or []
    if isinstance(goals, str):
        goals = [goals]
    for goal in goals[:2]:
        recs.append(_rec(f"Work toward: {goal}", "Aligned with your personal health goal.", 9, "goal"))

    for risk in risk_scores[:2]:
        if risk["category"] == "fatigue":
            recs.append(_rec("Rest and monitor symptoms", risk["message"], 9, "medical_awareness"))

    meds = profile_data.get("current_medications") or []
    if meds:
        recs.append(_rec("Take scheduled medication", "Medication adherence supports your care plan.", 10, "medication"))

    recs.append(_rec("Stretch for 10 minutes", "Gentle movement supports recovery.", 5, "activity"))

    persisted = []
    for r in recs[:6]:
        existing = (
            db.query(Recommendation)
            .filter(
                Recommendation.user_id == user_id,
                Recommendation.title == r["title"],
                Recommendation.status == "pending",
            )
            .first()
        )
        if not existing:
            entry = Recommendation(
                id=str(uuid.uuid4()),
                user_id=user_id,
                title=r["title"],
                reason=r["reason"],
                priority=r["priority"],
                category=r["category"],
                status="pending",
            )
            db.add(entry)
            db.commit()
            db.refresh(entry)
            persisted.append(_rec_to_dict(entry))
        else:
            persisted.append(_rec_to_dict(existing))

    return persisted


def update_recommendation_status(db: Session, user_id: str, rec_id: str, status: str) -> Optional[dict]:
    rec = (
        db.query(Recommendation)
        .filter(Recommendation.id == rec_id, Recommendation.user_id == user_id)
        .first()
    )
    if not rec:
        return None
    rec.status = status
    rec.updated_at = datetime.utcnow()
    db.commit()
    return _rec_to_dict(rec)


def list_recommendations(db: Session, user_id: str, status: Optional[str] = None) -> list[dict]:
    q = db.query(Recommendation).filter(Recommendation.user_id == user_id)
    if status:
        q = q.filter(Recommendation.status == status)
    return [_rec_to_dict(r) for r in q.order_by(Recommendation.priority.desc()).all()]


def _rec(title: str, reason: str, priority: int, category: str) -> dict:
    return {"title": title, "reason": reason, "priority": priority, "category": category}


def _rec_to_dict(r: Recommendation) -> dict:
    return {
        "id": r.id,
        "title": r.title,
        "reason": r.reason,
        "priority": r.priority,
        "category": r.category,
        "status": r.status,
        "source": r.source,
    }
