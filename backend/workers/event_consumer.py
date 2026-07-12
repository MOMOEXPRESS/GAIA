import json
import logging

from sqlalchemy.orm import Session

from database import SessionLocal
from events.bus import subscribe
from memory.engine import store_memory
from services.risk_engine import compute_risk_scores
from services.timeline_engine import create_timeline_event

logger = logging.getLogger("gaia.workers")


def _get_db():
    return SessionLocal()


def handle_symptom_logged(payload: dict):
    db = _get_db()
    try:
        user_id = payload["user_id"]
        create_timeline_event(
            db, user_id, "symptom", "medical",
            title=payload.get("symptom_name"),
            description=payload.get("context"),
            source="user_entered",
            metadata=payload,
            importance=payload.get("severity", 5),
        )
        store_memory(db, user_id, "episodic",
            f"Logged symptom: {payload.get('symptom_name')}", source="symptom_journal")
    finally:
        db.close()


def handle_protocol_generated(payload: dict):
    db = _get_db()
    try:
        create_timeline_event(
            db, payload["user_id"], "protocol", "medical",
            title=f"Protocol: {payload.get('based_on_imbalance')}",
            source="system",
            metadata=payload,
        )
    finally:
        db.close()


def handle_questionnaire_completed(payload: dict):
    db = _get_db()
    try:
        user_id = payload["user_id"]
        create_timeline_event(
            db, user_id, "questionnaire_completed", "wellness",
            title="Health profile completed",
            source="questionnaire",
            importance=7,
        )
        from memory.engine import extract_memories_from_profile
        extract_memories_from_profile(db, user_id, payload.get("profile_data", {}))
    finally:
        db.close()


def handle_medication_logged(payload: dict):
    db = _get_db()
    try:
        create_timeline_event(
            db, payload["user_id"], "medication", "medical",
            title=f"Medication: {payload.get('name')}",
            source="user_entered",
            metadata=payload,
        )
    finally:
        db.close()


def register_handlers():
    subscribe("SymptomLogged", handle_symptom_logged)
    subscribe("ProtocolGenerated", handle_protocol_generated)
    subscribe("QuestionnaireCompleted", handle_questionnaire_completed)
    subscribe("MedicationLogged", handle_medication_logged)
