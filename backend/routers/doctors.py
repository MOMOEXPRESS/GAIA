from uuid import uuid4

from fastapi import APIRouter

router = APIRouter(prefix="/doctor", tags=["doctors"])

_doctor_links: list[dict] = []


@router.post("/link-patient")
async def link_patient(doctor_id: str, share_code: str):
    link = {
        "id": str(uuid4()),
        "doctor_id": doctor_id,
        "share_code": share_code,
        "status": "pending",
    }
    _doctor_links.append(link)
    return link


@router.get("/patients")
async def list_patients(doctor_id: str):
    return [
        l for l in _doctor_links if l["doctor_id"] == doctor_id and l["status"] == "active"
    ]
