import json
from datetime import datetime
from typing import Any, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import Protocol, Symptom, User, get_db
from dependencies import get_current_user
from events.bus import publish
from middleware.audit import log_audit
from schemas.protocol import ProtocolGenerateRequest, ProtocolResponse
from schemas.symptom import SymptomCreate, SymptomResponse
from services.knowledge_engine import generate_protocol
from services.safety_checker import check_red_flags
from services.timeline_engine import create_timeline_event

router = APIRouter(prefix="/symptoms", tags=["symptoms"])


def _symptom_to_response(s: Symptom) -> SymptomResponse:
    return SymptomResponse(
        id=s.id,
        timestamp=s.created_at.isoformat() if s.created_at else datetime.utcnow().isoformat(),
        symptom_name=s.symptom_name,
        intensity=s.severity or 5,
        duration=s.duration or "",
        context=s.context or "",
        accompanying_symptoms=json.loads(s.accompanying_symptoms or "[]"),
        modifiers_worse=s.modifiers_worse or "",
        modifiers_better=s.modifiers_better or "",
    )


@router.post("", response_model=SymptomResponse)
async def create_symptom(
    entry: SymptomCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    text_blob = " ".join(
        filter(None, [entry.symptom_name, entry.context or "", " ".join(entry.accompanying_symptoms), entry.modifiers_worse or ""])
    )
    flags = check_red_flags(text_blob)
    if flags:
        raise HTTPException(422, detail={"message": "Emergency red flags detected. Seek immediate medical care.", "flags": flags})

    symptom = Symptom(
        id=str(uuid4()),
        user_id=user.id,
        symptom_name=entry.symptom_name,
        severity=entry.intensity,
        duration=entry.duration,
        context=entry.context,
        accompanying_symptoms=json.dumps(entry.accompanying_symptoms),
        modifiers_worse=entry.modifiers_worse,
        modifiers_better=entry.modifiers_better,
    )
    db.add(symptom)
    db.commit()
    db.refresh(symptom)

    payload = {"user_id": user.id, "symptom_name": entry.symptom_name, "severity": entry.intensity, "context": entry.context}
    publish("SymptomLogged", payload)
    log_audit(db, "symptom_created", user.id, "symptom", symptom.id, payload)
    create_timeline_event(
        db, user.id, "symptom", "medical",
        title=entry.symptom_name,
        description=entry.context,
        source="user_entered",
        metadata=payload,
        importance=entry.intensity or 5,
    )

    return _symptom_to_response(symptom)


@router.get("", response_model=list[SymptomResponse])
async def list_symptoms(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    symptoms = db.query(Symptom).filter(Symptom.user_id == user.id).order_by(Symptom.created_at.desc()).all()
    return [_symptom_to_response(s) for s in symptoms]
