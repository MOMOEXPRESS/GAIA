from datetime import datetime
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from schemas.symptom import SymptomCreate, SymptomResponse
from services.safety_checker import check_red_flags

router = APIRouter(prefix="/symptoms", tags=["symptoms"])

# In-memory store until MongoDB is connected
_symptom_store: list[dict[str, Any]] = []


@router.post("", response_model=SymptomResponse)
async def create_symptom(entry: SymptomCreate):
    text_blob = " ".join(
        filter(
            None,
            [
                entry.symptom_name,
                entry.context or "",
                " ".join(entry.accompanying_symptoms),
                entry.modifiers_worse or "",
            ],
        )
    )
    flags = check_red_flags(text_blob)
    if flags:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Emergency red flags detected. Seek immediate medical care.",
                "flags": flags,
            },
        )

    doc = {
        "id": str(uuid4()),
        "timestamp": datetime.utcnow().isoformat(),
        **entry.model_dump(),
    }
    _symptom_store.append(doc)
    return SymptomResponse(**doc)


@router.get("", response_model=list[SymptomResponse])
async def list_symptoms():
    return [SymptomResponse(**s) for s in reversed(_symptom_store)]
