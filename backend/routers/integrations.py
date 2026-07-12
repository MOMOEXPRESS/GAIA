from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import User, get_db
from dependencies import get_current_user
from integrations.adapter import connect_provider, list_providers, sync_provider

router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.get("/providers")
async def get_providers():
    return list_providers()


@router.post("/{provider}/connect")
async def connect(provider: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return connect_provider(db, user.id, provider)


@router.post("/{provider}/sync")
async def sync(provider: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return sync_provider(db, user.id, provider)
