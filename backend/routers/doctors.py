from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import DoctorPatientLink, Profile, User, get_db
from dependencies import get_current_user
from middleware.audit import log_audit
from middleware.rbac import require_doctor
from services.doctor_copilot import generate_patient_summary

router = APIRouter(prefix="/doctor", tags=["doctors"])


@router.post("/link-patient")
async def link_patient(
    share_code: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    require_doctor(user)
    patient_profile = db.query(Profile).filter(Profile.share_code == share_code).first()
    if not patient_profile:
        raise HTTPException(404, "Invalid share code")

    existing = (
        db.query(DoctorPatientLink)
        .filter(DoctorPatientLink.doctor_id == user.id, DoctorPatientLink.patient_id == patient_profile.user_id)
        .first()
    )
    if existing:
        return {"id": existing.id, "status": existing.status, "patient_id": existing.patient_id}

    link = DoctorPatientLink(
        id=str(uuid4()),
        doctor_id=user.id,
        patient_id=patient_profile.user_id,
        share_code=share_code,
        status="pending",
    )
    db.add(link)
    db.commit()
    log_audit(db, "doctor_link_requested", user.id, "doctor_patient_link", link.id)
    return {"id": link.id, "status": link.status, "patient_id": link.patient_id}


@router.get("/patients")
async def list_patients(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    require_doctor(user)
    links = (
        db.query(DoctorPatientLink)
        .filter(DoctorPatientLink.doctor_id == user.id, DoctorPatientLink.status == "active")
        .all()
    )
    result = []
    for link in links:
        patient = db.query(User).filter(User.id == link.patient_id).first()
        profile = db.query(Profile).filter(Profile.user_id == link.patient_id).first()
        result.append({
            "link_id": link.id,
            "patient_id": link.patient_id,
            "display_name": patient.display_name if patient else "Unknown",
            "share_code": link.share_code,
            "access_level": link.access_level,
        })
    return result


@router.get("/patients/{patient_id}/summary")
async def patient_summary(
    patient_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    require_doctor(user)
    link = (
        db.query(DoctorPatientLink)
        .filter(
            DoctorPatientLink.doctor_id == user.id,
            DoctorPatientLink.patient_id == patient_id,
            DoctorPatientLink.status == "active",
        )
        .first()
    )
    if not link:
        raise HTTPException(403, "No active link to this patient")
    log_audit(db, "doctor_viewed_summary", user.id, "patient", patient_id)
    return generate_patient_summary(db, patient_id)


@router.post("/links/{link_id}/activate")
async def activate_link(
    link_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    link = db.query(DoctorPatientLink).filter(DoctorPatientLink.id == link_id).first()
    if not link:
        raise HTTPException(404, "Link not found")
    if link.patient_id != user.id and link.doctor_id != user.id:
        raise HTTPException(403, "Not authorized")
    link.status = "active"
    db.commit()
    return {"id": link.id, "status": "active"}
