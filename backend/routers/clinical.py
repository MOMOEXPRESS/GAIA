import json
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import FamilyRelationship, LabResult, Medication, SleepLog, User, get_db
from dependencies import get_current_user
from events.bus import publish

router = APIRouter(tags=["clinical"])


# --- Medications ---

class MedicationCreate(BaseModel):
    name: str
    dosage: str | None = None
    frequency: str | None = None
    reminder_time: str | None = None


@router.get("/medications")
async def list_medications(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    meds = db.query(Medication).filter(Medication.user_id == user.id, Medication.active == True).all()
    return [{"id": m.id, "name": m.name, "dosage": m.dosage, "frequency": m.frequency, "reminder_time": m.reminder_time} for m in meds]


@router.post("/medications")
async def create_medication(body: MedicationCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    med = Medication(id=str(uuid.uuid4()), user_id=user.id, **body.model_dump())
    db.add(med)
    db.commit()
    publish("MedicationLogged", {"user_id": user.id, "name": body.name})
    return {"id": med.id, "name": med.name}


@router.post("/medications/{med_id}/log-adherence")
async def log_adherence(med_id: str, taken: bool = True, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    med = db.query(Medication).filter(Medication.id == med_id, Medication.user_id == user.id).first()
    if not med:
        raise HTTPException(404, "Medication not found")
    log = json.loads(med.adherence_log or "[]")
    log.append({"date": datetime.utcnow().date().isoformat(), "taken": taken})
    med.adherence_log = json.dumps(log[-90:])
    db.commit()
    return {"logged": True, "adherence_rate": sum(1 for e in log if e["taken"]) / max(len(log), 1)}


# --- Labs ---

class LabCreate(BaseModel):
    test_name: str
    value: str | None = None
    unit: str | None = None
    reference_range: str | None = None
    test_date: str | None = None


@router.get("/labs")
async def list_labs(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    labs = db.query(LabResult).filter(LabResult.user_id == user.id).order_by(LabResult.test_date.desc()).all()
    return [{"id": l.id, "test_name": l.test_name, "value": l.value, "unit": l.unit, "reference_range": l.reference_range, "test_date": l.test_date} for l in labs]


@router.post("/labs")
async def create_lab(body: LabCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lab = LabResult(id=str(uuid.uuid4()), user_id=user.id, **body.model_dump())
    db.add(lab)
    db.commit()
    return {"id": lab.id, "test_name": lab.test_name}


# --- Sleep ---

class SleepCreate(BaseModel):
    sleep_date: str
    duration_hours: float | None = None
    quality_score: int | None = None
    notes: str | None = None


@router.get("/sleep")
async def list_sleep(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(SleepLog).filter(SleepLog.user_id == user.id).order_by(SleepLog.sleep_date.desc()).limit(30).all()
    return [{"id": s.id, "sleep_date": s.sleep_date, "duration_hours": s.duration_hours, "quality_score": s.quality_score} for s in logs]


@router.post("/sleep")
async def create_sleep(body: SleepCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log = SleepLog(id=str(uuid.uuid4()), user_id=user.id, **body.model_dump())
    db.add(log)
    db.commit()
    return {"id": log.id, "sleep_date": log.sleep_date}


# --- Family ---

class FamilyCreate(BaseModel):
    relationship_type: str
    name: str
    can_view_health: bool = False
    emergency_contact: bool = False


@router.get("/family")
async def list_family(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    members = db.query(FamilyRelationship).filter(FamilyRelationship.user_id == user.id).all()
    return [{"id": m.id, "name": m.name, "relationship_type": m.relationship_type, "can_view_health": m.can_view_health, "emergency_contact": m.emergency_contact} for m in members]


@router.post("/family")
async def add_family(body: FamilyCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    member = FamilyRelationship(id=str(uuid.uuid4()), user_id=user.id, **body.model_dump())
    db.add(member)
    db.commit()
    return {"id": member.id, "name": member.name}
