import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from database import AIMemory, ConsentRecord


CONSENT_TYPES = [
    "ai_memory",
    "ai_personalization",
    "wearable_data",
    "clinician_sharing",
    "family_sharing",
    "notifications",
    "preventive_analytics",
    "research_participation",
]


def has_consent(db: Session, user_id: str, consent_type: str) -> bool:
    record = (
        db.query(ConsentRecord)
        .filter(ConsentRecord.user_id == user_id, ConsentRecord.consent_type == consent_type)
        .first()
    )
    return record.granted if record else False


def set_consent(db: Session, user_id: str, consent_type: str, granted: bool) -> ConsentRecord:
    record = (
        db.query(ConsentRecord)
        .filter(ConsentRecord.user_id == user_id, ConsentRecord.consent_type == consent_type)
        .first()
    )
    now = datetime.utcnow()
    if record:
        record.granted = granted
        if granted:
            record.granted_at = now
            record.revoked_at = None
        else:
            record.revoked_at = now
    else:
        record = ConsentRecord(
            id=str(uuid.uuid4()),
            user_id=user_id,
            consent_type=consent_type,
            granted=granted,
            granted_at=now if granted else None,
        )
        db.add(record)
    db.commit()
    db.refresh(record)
    return record


def ensure_default_consents(db: Session, user_id: str):
    for ct in CONSENT_TYPES:
        existing = (
            db.query(ConsentRecord)
            .filter(ConsentRecord.user_id == user_id, ConsentRecord.consent_type == ct)
            .first()
        )
        if not existing:
            default_granted = ct in ("ai_memory", "ai_personalization", "notifications")
            set_consent(db, user_id, ct, default_granted)


def store_memory(
    db: Session,
    user_id: str,
    tier: str,
    content: str,
    source: str = "system",
    timeline_event_id: Optional[str] = None,
    confidence: float = 1.0,
    require_consent: bool = True,
) -> Optional[AIMemory]:
    if require_consent and not has_consent(db, user_id, "ai_memory"):
        return None
    memory = AIMemory(
        id=str(uuid.uuid4()),
        user_id=user_id,
        tier=tier,
        content=content,
        source=source,
        timeline_event_id=timeline_event_id,
        confidence=confidence,
    )
    db.add(memory)
    db.commit()
    db.refresh(memory)
    return memory


def list_memories(
    db: Session,
    user_id: str,
    tier: Optional[str] = None,
    limit: int = 50,
) -> list[AIMemory]:
    q = db.query(AIMemory).filter(AIMemory.user_id == user_id, AIMemory.active == True)
    if tier:
        q = q.filter(AIMemory.tier == tier)
    return q.order_by(AIMemory.created_at.desc()).limit(limit).all()


def extract_memories_from_profile(db: Session, user_id: str, profile_data: dict):
    """Extract semantic memories from profile/questionnaire data."""
    if not has_consent(db, user_id, "ai_memory"):
        return

    goals = profile_data.get("health_goals") or profile_data.get("questionnaire_answers", {}).get("health_goals")
    if goals:
        if isinstance(goals, list):
            for g in goals:
                store_memory(db, user_id, "semantic", f"Health goal: {g}", require_consent=False)
        elif isinstance(goals, str):
            store_memory(db, user_id, "semantic", f"Health goal: {goals}", require_consent=False)

    sleep = profile_data.get("sleep_quality")
    if sleep:
        store_memory(db, user_id, "semantic", f"Sleep quality reported as: {sleep}", require_consent=False)

    mood = profile_data.get("mood_frequency")
    if mood:
        store_memory(db, user_id, "semantic", f"Mood frequency: {mood}", require_consent=False)

    anxiety = profile_data.get("anxiety_frequency")
    if anxiety:
        store_memory(db, user_id, "semantic", f"Anxiety frequency: {anxiety}", require_consent=False)

    occupation = profile_data.get("occupation_type")
    if occupation:
        store_memory(db, user_id, "procedural", f"Occupation type: {occupation}", require_consent=False)
