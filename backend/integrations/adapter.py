from typing import Any, Optional

from sqlalchemy.orm import Session

from database import IntegrationConnection


PROVIDERS = [
    {"id": "apple_health", "name": "Apple Health", "type": "wearable"},
    {"id": "google_health_connect", "name": "Google Health Connect", "type": "wearable"},
    {"id": "fitbit", "name": "Fitbit", "type": "wearable"},
    {"id": "garmin", "name": "Garmin", "type": "wearable"},
    {"id": "oura", "name": "Oura Ring", "type": "wearable"},
    {"id": "withings", "name": "Withings", "type": "device"},
    {"id": "dexcom", "name": "Dexcom", "type": "medical_device"},
    {"id": "libre", "name": "FreeStyle Libre", "type": "medical_device"},
    {"id": "labcorp", "name": "LabCorp", "type": "laboratory"},
    {"id": "quest", "name": "Quest Diagnostics", "type": "laboratory"},
]


def list_providers() -> list[dict]:
    return PROVIDERS


def get_connection(db: Session, user_id: str, provider: str) -> Optional[IntegrationConnection]:
    return (
        db.query(IntegrationConnection)
        .filter(IntegrationConnection.user_id == user_id, IntegrationConnection.provider == provider)
        .first()
    )


def connect_provider(db: Session, user_id: str, provider: str) -> dict[str, Any]:
    conn = get_connection(db, user_id, provider)
    if not conn:
        import uuid
        from datetime import datetime
        conn = IntegrationConnection(
            id=str(uuid.uuid4()),
            user_id=user_id,
            provider=provider,
            status="connected",
            last_sync_at=datetime.utcnow(),
        )
        db.add(conn)
    else:
        from datetime import datetime
        conn.status = "connected"
        conn.last_sync_at = datetime.utcnow()
    db.commit()
    return {"provider": provider, "status": "connected", "message": "Integration adapter ready. Full sync pending provider API credentials."}


def sync_provider(db: Session, user_id: str, provider: str) -> dict[str, Any]:
    """Stub sync — returns sample imported events for timeline."""
    conn = get_connection(db, user_id, provider)
    if not conn or conn.status != "connected":
        return {"error": "Provider not connected"}

    from datetime import datetime
    conn.last_sync_at = datetime.utcnow()
    db.commit()

    return {
        "provider": provider,
        "synced_at": conn.last_sync_at.isoformat(),
        "events_imported": 0,
        "message": "Integration framework ready. Configure provider API keys for live data import.",
    }
