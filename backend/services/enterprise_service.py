from typing import Any

from sqlalchemy.orm import Session

from database import EnterpriseOrganization


def create_organization(db: Session, name: str, org_type: str = "employer") -> dict[str, Any]:
    import uuid
    org = EnterpriseOrganization(
        id=str(uuid.uuid4()),
        name=name,
        org_type=org_type,
    )
    db.add(org)
    db.commit()
    return {"id": org.id, "name": org.name, "org_type": org.org_type}


def get_population_metrics(db: Session, org_id: str) -> dict[str, Any]:
    """Privacy-preserving aggregated metrics stub."""
    return {
        "organization_id": org_id,
        "active_users": 0,
        "avg_wellness_score": 0,
        "medication_adherence_rate": 0,
        "sleep_improvement_pct": 0,
        "message": "Population analytics require minimum cohort size and privacy aggregation.",
    }
