from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import User, get_db
from dependencies import get_current_user
from services.timeline_engine import list_timeline_events, timeline_event_to_dict

router = APIRouter(prefix="/timeline", tags=["timeline"])


@router.get("")
async def get_timeline(
    category: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    events = list_timeline_events(db, user.id, category=category, limit=limit, offset=offset)
    return [timeline_event_to_dict(e) for e in events]
