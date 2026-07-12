import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import HealthEvent, Profile, QuestionnaireSession, User, get_db
from dependencies import get_current_user
from schemas.profile import (
    HealthEventCreate,
    HealthEventResponse,
    ProfileResponse,
    ProfileUpdateRequest,
    QuestionAnswerRequest,
    VoiceParseRequest,
    VoiceParseResponse,
)
from services.location_intelligence import build_location_context, get_cities_for_country, get_country_by_code, list_countries
from services.questionnaire_engine import (
    apply_answer_to_profile_field,
    count_progress,
    get_next_question_id,
    get_question,
    load_questionnaire,
)
from services.voice_parser import match_voice_to_options
from services.wellness_engine import compute_wellness_snapshot

router = APIRouter(tags=["profile"])


def _profile_to_dict(profile: Profile, user: User) -> dict:
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "age": profile.age,
        "sex_at_birth": profile.sex_at_birth,
        "gender_identity": profile.gender_identity,
        "ethnicity": profile.ethnicity,
        "blood_type": profile.blood_type,
        "height_cm": profile.height_cm,
        "weight_kg": profile.weight_kg,
        "country": profile.country,
        "country_code": profile.country_code,
        "city": profile.city,
        "climate_zone": profile.climate_zone,
        "occupation_type": profile.occupation_type,
        "sedentary_hours": profile.sedentary_hours,
        "shift_work": profile.shift_work or False,
        "marital_status": profile.marital_status,
        "household_size": profile.household_size,
        "financial_stress": profile.financial_stress,
        "social_support_index": profile.social_support_index,
        "meditation_minutes": profile.meditation_minutes or 0,
        "time_in_nature_minutes": profile.time_in_nature_minutes or 0,
        "sense_of_purpose_score": profile.sense_of_purpose_score,
        "mood_frequency": profile.mood_frequency,
        "sleep_quality": profile.sleep_quality,
        "anxiety_frequency": profile.anxiety_frequency,
        "current_medications": json.loads(profile.current_medications or "[]"),
        "allergies": json.loads(profile.allergies or "[]"),
        "past_illnesses": json.loads(profile.past_illnesses or "[]"),
        "family_history": json.loads(profile.family_history or "[]"),
        "health_goals": json.loads(getattr(profile, "health_goals", None) or "[]"),
        "questionnaire_answers": json.loads(profile.questionnaire_answers or "{}"),
        "voice_notes": json.loads(profile.voice_notes or "[]"),
        "wellness_snapshot": json.loads(profile.wellness_snapshot or "{}"),
        "location_context": json.loads(profile.location_context or "{}"),
        "share_code": profile.share_code,
        "display_name": user.display_name,
        "email": user.email,
        "is_demo": user.is_demo,
    }


async def _refresh_profile_scores(profile: Profile, user: User, db: Session):
    events = db.query(HealthEvent).filter(HealthEvent.user_id == user.id).all()
    pdata = _profile_to_dict(profile, user)
    snapshot = compute_wellness_snapshot(pdata, [{"severity": e.severity} for e in events])
    profile.wellness_snapshot = json.dumps(snapshot)
    if profile.country_code:
        ctx = await build_location_context(profile.country_code, profile.city or "")
        profile.location_context = json.dumps(ctx)
        profile.climate_zone = ctx.get("climate_zone")
    profile.updated_at = datetime.utcnow()
    db.commit()


def _get_or_create_profile(user: User, db: Session) -> Profile:
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _get_or_create_profile(user, db)
    return ProfileResponse(**_profile_to_dict(profile, user))


@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    data: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(user, db)
    for key, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(profile, key, value)
    if data.country_code:
        country = get_country_by_code(data.country_code)
        if country:
            profile.country = country["name"]
    await _refresh_profile_scores(profile, user, db)
    db.refresh(profile)
    return ProfileResponse(**_profile_to_dict(profile, user))


@router.get("/profile/wellness")
async def get_wellness(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _get_or_create_profile(user, db)
    snapshot = json.loads(profile.wellness_snapshot or "{}")
    if not snapshot:
        await _refresh_profile_scores(profile, user, db)
        db.refresh(profile)
        snapshot = json.loads(profile.wellness_snapshot or "{}")
    return snapshot


@router.get("/profile/location-context")
async def get_location_context(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _get_or_create_profile(user, db)
    if not profile.country_code:
        raise HTTPException(400, "No country set on profile")
    ctx = await build_location_context(profile.country_code, profile.city or "")
    profile.location_context = json.dumps(ctx)
    profile.climate_zone = ctx.get("climate_zone")
    db.commit()
    return ctx


@router.get("/location-preview/{country_code}")
async def location_preview(country_code: str, city: str = ""):
    return await build_location_context(country_code, city)


@router.get("/countries")
def list_countries_endpoint():
    return list_countries()


@router.get("/countries/{code}/cities")
def list_cities(code: str):
    return {"cities": get_cities_for_country(code)}


# Questionnaire
@router.post("/questionnaire/session")
def start_session(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = load_questionnaire()
    session = QuestionnaireSession(user_id=user.id, current_question_id=data["start"])
    db.add(session)
    db.commit()
    db.refresh(session)
    q = get_question(data["start"])
    return {
        "session_id": session.id,
        "question": q,
        "progress": {"answered": 0, "total": data["total_questions"]},
    }


@router.get("/questionnaire/session/{session_id}")
def get_session(session_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(QuestionnaireSession).filter(
        QuestionnaireSession.id == session_id, QuestionnaireSession.user_id == user.id
    ).first()
    if not session:
        raise HTTPException(404, "Session not found")
    answers = json.loads(session.answers or "{}")
    q = get_question(session.current_question_id)
    answered, total = count_progress(answers)
    return {
        "session_id": session.id,
        "question": q,
        "answers": answers,
        "completed": session.completed,
        "progress": {"answered": answered, "total": total},
    }


@router.post("/questionnaire/answer")
async def submit_answer(
    req: QuestionAnswerRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(QuestionnaireSession).filter(
        QuestionnaireSession.id == req.session_id, QuestionnaireSession.user_id == user.id
    ).first()
    if not session:
        raise HTTPException(404, "Session not found")
    if session.completed:
        raise HTTPException(400, "Session already completed")

    q = get_question(req.question_id)
    if not q:
        raise HTTPException(404, "Question not found")

    answers = json.loads(session.answers or "{}")
    answers[req.question_id] = req.answer
    session.answers = json.dumps(answers)

    history = json.loads(session.history or "[]")
    history.append(req.question_id)
    session.history = json.dumps(history)

    profile = _get_or_create_profile(user, db)
    if q.get("field"):
        pdata = _profile_to_dict(profile, user)
        updated = apply_answer_to_profile_field(q["field"], req.answer, pdata)
        for key in ("past_illnesses", "current_medications", "allergies", "family_history", "health_goals"):
            if key in updated:
                setattr(profile, key, json.dumps(updated[key]))
        for key, val in updated.items():
            if key not in ("past_illnesses", "current_medications", "allergies", "family_history", "health_goals",
                           "questionnaire_answers", "voice_notes", "wellness_snapshot", "location_context",
                           "display_name", "email", "is_demo", "id", "user_id", "share_code"):
                if hasattr(profile, key):
                    setattr(profile, key, val)

    profile.questionnaire_answers = json.dumps(answers)

    if req.voice_transcript:
        notes = json.loads(profile.voice_notes or "[]")
        notes.append({"question_id": req.question_id, "transcript": req.voice_transcript})
        profile.voice_notes = json.dumps(notes)

    next_id = get_next_question_id(req.question_id, req.answer)
    if next_id == "complete" or not next_id:
        session.completed = True
        session.current_question_id = "complete"
        await _refresh_profile_scores(profile, user, db)
        from events.bus import publish
        from memory.engine import ensure_default_consents, extract_memories_from_profile
        ensure_default_consents(db, user.id)
        extract_memories_from_profile(db, user.id, _profile_to_dict(profile, user))
        publish("QuestionnaireCompleted", {"user_id": user.id, "profile_data": _profile_to_dict(profile, user)})
    else:
        session.current_question_id = next_id

    db.commit()
    db.refresh(session)

    next_q = get_question(session.current_question_id) if not session.completed else get_question("complete")
    answered, total = count_progress(answers)
    return {
        "session_id": session.id,
        "question": next_q,
        "completed": session.completed,
        "progress": {"answered": answered, "total": total},
    }


@router.post("/questionnaire/voice", response_model=VoiceParseResponse)
def parse_voice(req: VoiceParseRequest):
    result = match_voice_to_options(req.transcript, req.options)
    return VoiceParseResponse(**result)


# Health events
@router.get("/health-events", response_model=list[HealthEventResponse])
def list_health_events(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    events = db.query(HealthEvent).filter(HealthEvent.user_id == user.id).order_by(HealthEvent.created_at.desc()).all()
    return [
        HealthEventResponse(
            id=e.id,
            event_type=e.event_type,
            event_date=e.event_date,
            description=e.description,
            severity=e.severity,
            duration_days=e.duration_days,
            outcome=e.outcome,
            tags=json.loads(e.tags or "[]"),
        )
        for e in events
    ]


@router.post("/health-events", response_model=HealthEventResponse)
async def create_health_event(
    data: HealthEventCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = HealthEvent(
        user_id=user.id,
        event_type=data.event_type,
        event_date=data.event_date,
        description=data.description,
        severity=data.severity,
        duration_days=data.duration_days,
        outcome=data.outcome,
        tags=json.dumps(data.tags),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    from services.timeline_engine import create_timeline_event
    create_timeline_event(
        db, user.id, data.event_type, "medical",
        title=data.event_type.replace("_", " ").title(),
        description=data.description,
        source="user_entered",
        metadata={"severity": data.severity, "outcome": data.outcome},
        importance=data.severity or 5,
    )
    profile = _get_or_create_profile(user, db)
    await _refresh_profile_scores(profile, user, db)
    return HealthEventResponse(
        id=event.id,
        event_type=event.event_type,
        event_date=event.event_date,
        description=event.description,
        severity=event.severity,
        duration_days=event.duration_days,
        outcome=event.outcome,
        tags=json.loads(event.tags or "[]"),
    )


@router.delete("/health-events/{event_id}")
async def delete_health_event(
    event_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = db.query(HealthEvent).filter(HealthEvent.id == event_id, HealthEvent.user_id == user.id).first()
    if not event:
        raise HTTPException(404, "Event not found")
    db.delete(event)
    db.commit()
    profile = _get_or_create_profile(user, db)
    await _refresh_profile_scores(profile, user, db)
    return {"deleted": True}
