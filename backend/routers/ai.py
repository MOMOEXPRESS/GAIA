import json

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from brain.orchestrator import Orchestrator
from database import Profile, User, get_db
from dependencies import get_current_user
from middleware.audit import log_audit
from services.recommendation_engine import list_recommendations
from services.risk_engine import compute_risk_scores

router = APIRouter(prefix="/ai", tags=["ai"])
_orchestrator = Orchestrator()


class AIChatRequest(BaseModel):
    message: str
    intent: str | None = None


@router.post("/chat")
async def ai_chat(body: AIChatRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    profile_data = {}
    if profile:
        profile_data = {
            "age": profile.age,
            "sleep_quality": profile.sleep_quality,
            "anxiety_frequency": profile.anxiety_frequency,
            "mood_frequency": profile.mood_frequency,
            "display_name": user.display_name,
        }
    result = _orchestrator.process(db, user.id, body.message, profile_data, body.intent)
    log_audit(db, "ai_chat", user.id, "ai", details={"intent": result["intent"], "agent": result["agent"]})
    return result


@router.get("/workspace")
async def ai_workspace(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    profile_data = {}
    if profile:
        profile_data = {
            "sleep_quality": profile.sleep_quality,
            "wellness_snapshot": json.loads(profile.wellness_snapshot or "{}"),
        }
    risks = compute_risk_scores(db, user.id, profile_data) if profile else []
    recs = list_recommendations(db, user.id, status="pending")

    from memory.engine import list_memories
    memories = list_memories(db, user.id, limit=10)

    return {
        "summary": profile_data.get("wellness_snapshot", {}),
        "recommendations": recs[:5],
        "risk_trends": risks,
        "insights": profile_data.get("wellness_snapshot", {}).get("insights", []),
        "memories": [{"tier": m.tier, "content": m.content} for m in memories],
        "disclaimer": "Educational wellness information only.",
    }
