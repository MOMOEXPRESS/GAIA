import json
from uuid import uuid4

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import Protocol, Symptom, User, get_db
from dependencies import get_current_user
from events.bus import publish
from middleware.audit import log_audit
from schemas.protocol import ProtocolGenerateRequest, ProtocolResponse
from services.knowledge_engine import generate_protocol
from services.timeline_engine import create_timeline_event

router = APIRouter(prefix="/protocols", tags=["protocols"])


def _protocol_to_response(p: Protocol) -> ProtocolResponse:
    return ProtocolResponse(
        id=p.id,
        status=p.status,
        based_on_imbalance=p.based_on_imbalance,
        score=p.match_score or 0,
        herbs=json.loads(p.herbs or "[]"),
        nutrition=json.loads(p.nutrition or "[]"),
        lifestyle=json.loads(p.lifestyle or "[]"),
        exercise=json.loads(p.exercise or "[]"),
        mind_body=json.loads(p.mind_body or "{}"),
    )


@router.post("/generate", response_model=ProtocolResponse)
async def create_protocol(
    request: ProtocolGenerateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    symptom_texts = list(request.symptom_texts)

    if request.symptom_ids and not symptom_texts:
        symptoms = db.query(Symptom).filter(
            Symptom.user_id == user.id, Symptom.id.in_(request.symptom_ids)
        ).all()
        for s in symptoms:
            symptom_texts.append(s.symptom_name)
            if s.context:
                symptom_texts.append(s.context)

    if not symptom_texts:
        symptom_texts = ["general fatigue and stress"]

    data = generate_protocol(symptom_texts)
    protocol = Protocol(
        id=str(uuid4()),
        user_id=user.id,
        status="recommended",
        based_on_imbalance=data["based_on_imbalance"],
        match_score=data.get("match_score"),
        herbs=json.dumps(data.get("herbs", [])),
        nutrition=json.dumps(data.get("nutrition", [])),
        lifestyle=json.dumps(data.get("lifestyle", [])),
        exercise=json.dumps(data.get("exercise", [])),
        mind_body=json.dumps(data.get("mind_body", {})),
        affordability_overlay=json.dumps(data.get("affordability_overlay", {})),
    )
    db.add(protocol)
    db.commit()
    db.refresh(protocol)

    publish("ProtocolGenerated", {"user_id": user.id, "based_on_imbalance": protocol.based_on_imbalance})
    log_audit(db, "protocol_generated", user.id, "protocol", protocol.id)
    create_timeline_event(
        db, user.id, "protocol", "medical",
        title=f"Protocol: {protocol.based_on_imbalance}",
        source="system",
        metadata={"match_score": protocol.match_score},
    )

    return _protocol_to_response(protocol)


@router.get("", response_model=list[ProtocolResponse])
async def list_protocols(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    protocols = db.query(Protocol).filter(Protocol.user_id == user.id).order_by(Protocol.created_at.desc()).all()
    return [_protocol_to_response(p) for p in protocols]
