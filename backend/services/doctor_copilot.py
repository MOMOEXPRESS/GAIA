import json
import uuid
from datetime import datetime, timedelta
from typing import Any, Optional

from sqlalchemy.orm import Session

from database import HealthTimelineEvent, Profile, Symptom, User
from memory.engine import list_memories
from services.risk_engine import compute_risk_scores
from services.wellness_engine import compute_wellness_snapshot


def generate_patient_summary(db: Session, patient_id: str) -> dict[str, Any]:
    """AI-generated patient summary for doctor copilot."""
    user = db.query(User).filter(User.id == patient_id).first()
    profile = db.query(Profile).filter(Profile.user_id == patient_id).first()
    if not user or not profile:
        return {"error": "Patient not found"}

    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_symptoms = (
        db.query(Symptom)
        .filter(Symptom.user_id == patient_id, Symptom.created_at >= week_ago)
        .all()
    )
    recent_events = (
        db.query(HealthTimelineEvent)
        .filter(HealthTimelineEvent.user_id == patient_id, HealthTimelineEvent.occurred_at >= week_ago)
        .order_by(HealthTimelineEvent.occurred_at.desc())
        .limit(10)
        .all()
    )

    profile_data = {
        "age": profile.age,
        "sleep_quality": profile.sleep_quality,
        "anxiety_frequency": profile.anxiety_frequency,
        "mood_frequency": profile.mood_frequency,
        "current_medications": json.loads(profile.current_medications or "[]"),
        "allergies": json.loads(profile.allergies or "[]"),
        "wellness_snapshot": json.loads(profile.wellness_snapshot or "{}"),
    }

    risks = compute_risk_scores(db, patient_id, profile_data)
    memories = list_memories(db, patient_id, limit=5)

    summary_parts = [
        f"Patient: {user.display_name} ({user.email})",
        f"Age: {profile.age or 'Not recorded'}",
    ]

    if profile_data["current_medications"]:
        summary_parts.append(f"Medications: {', '.join(profile_data['current_medications'])}")
    if profile_data["allergies"]:
        summary_parts.append(f"Allergies: {', '.join(profile_data['allergies'])}")

    if recent_symptoms:
        names = [s.symptom_name for s in recent_symptoms]
        summary_parts.append(f"Recent symptoms (7d): {', '.join(names)}")

    if risks:
        summary_parts.append(f"Risk awareness: {risks[0]['message']}")

    suggested_questions = []
    if profile.sleep_quality in ("Poor", "Very poor"):
        suggested_questions.append("How has your sleep been affecting your daily activities?")
    if recent_symptoms:
        suggested_questions.append(f"Can you tell me more about the {recent_symptoms[0].symptom_name}?")
    if profile_data["allergies"]:
        suggested_questions.append("Have you had any recent allergic reactions?")

    return {
        "patient_id": patient_id,
        "display_name": user.display_name,
        "summary": "\n".join(summary_parts),
        "wellness_snapshot": profile_data["wellness_snapshot"],
        "risk_scores": risks,
        "recent_timeline": [
            {"type": e.event_type, "title": e.title, "date": e.occurred_at.isoformat()}
            for e in recent_events
        ],
        "memories": [m.content for m in memories],
        "suggested_questions": suggested_questions,
        "disclaimer": "AI-generated summary for clinician reference. Verify with patient.",
    }
