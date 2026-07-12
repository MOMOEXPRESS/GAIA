from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import User, get_db
from dependencies import get_current_user
from memory.engine import list_memories, store_memory

router = APIRouter(prefix="/memory", tags=["memory"])


class MemoryCreate(BaseModel):
    tier: str
    content: str


@router.get("")
async def get_memories(
    tier: str | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    memories = list_memories(db, user.id, tier=tier)
    return [
        {
            "id": m.id,
            "tier": m.tier,
            "content": m.content,
            "source": m.source,
            "confidence": m.confidence,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in memories
    ]


@router.post("")
async def create_memory(
    body: MemoryCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.tier not in ("semantic", "episodic", "procedural"):
        raise HTTPException(400, "tier must be semantic, episodic, or procedural")
    memory = store_memory(db, user.id, body.tier, body.content, source="user")
    if not memory:
        raise HTTPException(403, "AI memory consent not granted")
    return {"id": memory.id, "tier": memory.tier, "content": memory.content}
