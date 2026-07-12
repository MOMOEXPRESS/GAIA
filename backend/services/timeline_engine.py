import json
import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy.orm import Session

from database import HealthTimelineEvent


def create_timeline_event(
    db: Session,
    user_id: str,
    event_type: str,
    category: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    source: str = "user_entered",
    metadata: Optional[dict] = None,
    importance: int = 5,
    ai_summary: Optional[str] = None,
    occurred_at: Optional[datetime] = None,
) -> HealthTimelineEvent:
    event = HealthTimelineEvent(
        id=str(uuid.uuid4()),
        user_id=user_id,
        event_type=event_type,
        category=category,
        occurred_at=occurred_at or datetime.utcnow(),
        source=source,
        title=title,
        description=description,
        metadata_json=json.dumps(metadata or {}),
        importance=importance,
        ai_summary=ai_summary,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def list_timeline_events(
    db: Session,
    user_id: str,
    category: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> list[HealthTimelineEvent]:
    q = db.query(HealthTimelineEvent).filter(HealthTimelineEvent.user_id == user_id)
    if category:
        q = q.filter(HealthTimelineEvent.category == category)
    return q.order_by(HealthTimelineEvent.occurred_at.desc()).offset(offset).limit(limit).all()


def timeline_event_to_dict(event: HealthTimelineEvent) -> dict[str, Any]:
    return {
        "id": event.id,
        "event_type": event.event_type,
        "category": event.category,
        "occurred_at": event.occurred_at.isoformat() if event.occurred_at else None,
        "source": event.source,
        "title": event.title,
        "description": event.description,
        "metadata": json.loads(event.metadata_json or "{}"),
        "importance": event.importance,
        "ai_summary": event.ai_summary,
        "created_at": event.created_at.isoformat() if event.created_at else None,
    }
