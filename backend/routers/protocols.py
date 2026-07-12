from uuid import uuid4

from fastapi import APIRouter

from routers.symptoms import _symptom_store
from schemas.protocol import ProtocolGenerateRequest, ProtocolResponse
from services.knowledge_engine import generate_protocol

router = APIRouter(prefix="/protocols", tags=["protocols"])

_protocol_store: list[dict] = []


@router.post("/generate", response_model=ProtocolResponse)
async def create_protocol(request: ProtocolGenerateRequest):
    symptom_texts = list(request.symptom_texts)

    if request.symptom_ids and not symptom_texts:
        id_set = set(request.symptom_ids)
        for entry in _symptom_store:
            if entry["id"] in id_set:
                symptom_texts.append(entry.get("symptom_name", ""))
                symptom_texts.append(entry.get("context", ""))

    if not symptom_texts:
        symptom_texts = ["general fatigue and stress"]

    protocol = generate_protocol(symptom_texts)
    protocol["id"] = str(uuid4())
    protocol["status"] = "recommended"
    _protocol_store.append(protocol)
    return ProtocolResponse(**protocol)


@router.get("", response_model=list[ProtocolResponse])
async def list_protocols():
    return [ProtocolResponse(**p) for p in reversed(_protocol_store)]
