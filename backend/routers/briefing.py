from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import Profile, User, get_db
from dependencies import get_current_user
from services.briefing_service import get_daily_briefing
from services.recommendation_engine import list_recommendations, update_recommendation_status

router = APIRouter(prefix="/briefing", tags=["briefing"])


@router.get("/today")
async def today_briefing(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        return {"greeting": "Welcome", "message": "Complete your health profile to unlock your daily briefing."}
    return get_daily_briefing(db, user, profile)


@router.get("/recommendations")
async def get_recommendations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_recommendations(db, user.id)


@router.patch("/recommendations/{rec_id}")
async def patch_recommendation(rec_id: str, status: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if status not in ("pending", "accepted", "dismissed", "completed"):
        return {"error": "Invalid status"}
    result = update_recommendation_status(db, user.id, rec_id, status)
    return result or {"error": "Not found"}
