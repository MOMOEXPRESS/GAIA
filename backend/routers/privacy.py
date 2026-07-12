from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import AuditLog, User, get_db
from dependencies import get_current_user
from memory.engine import CONSENT_TYPES, ensure_default_consents, has_consent, set_consent

router = APIRouter(prefix="/privacy", tags=["privacy"])


class ConsentUpdate(BaseModel):
    consent_type: str
    granted: bool


@router.get("/consents")
async def get_consents(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ensure_default_consents(db, user.id)
    return {
        "consents": [
            {"type": ct, "granted": has_consent(db, user.id, ct)}
            for ct in CONSENT_TYPES
        ],
        "available_types": CONSENT_TYPES,
    }


@router.put("/consents")
async def update_consent(body: ConsentUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if body.consent_type not in CONSENT_TYPES:
        return {"error": f"Unknown consent type. Available: {CONSENT_TYPES}"}
    record = set_consent(db, user.id, body.consent_type, body.granted)
    return {"type": record.consent_type, "granted": record.granted}


@router.get("/audit-log")
async def get_audit_log(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = (
        db.query(AuditLog)
        .filter(AuditLog.user_id == user.id)
        .order_by(AuditLog.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "action": l.action,
            "resource_type": l.resource_type,
            "created_at": l.created_at.isoformat() if l.created_at else None,
        }
        for l in logs
    ]


@router.get("/data-summary")
async def data_summary(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from database import AIMemory, HealthTimelineEvent, Symptom, Protocol
    return {
        "timeline_events": db.query(HealthTimelineEvent).filter(HealthTimelineEvent.user_id == user.id).count(),
        "memories": db.query(AIMemory).filter(AIMemory.user_id == user.id, AIMemory.active == True).count(),
        "symptoms": db.query(Symptom).filter(Symptom.user_id == user.id).count(),
        "protocols": db.query(Protocol).filter(Protocol.user_id == user.id).count(),
        "message": "Your data is stored to personalize your health experience. You control what Gaia remembers.",
    }
