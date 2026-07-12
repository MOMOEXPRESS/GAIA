from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import User, get_db
from dependencies import get_current_user
from middleware.rbac import require_admin
from services.enterprise_service import create_organization, get_population_metrics

router = APIRouter(prefix="/enterprise", tags=["enterprise"])


class OrgCreate(BaseModel):
    name: str
    org_type: str = "employer"


@router.post("/organizations")
async def create_org(body: OrgCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    require_admin(user)
    return create_organization(db, body.name, body.org_type)


@router.get("/organizations/{org_id}/metrics")
async def org_metrics(org_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    require_admin(user)
    return get_population_metrics(db, org_id)
