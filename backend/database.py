import json
import uuid
from datetime import datetime
from pathlib import Path

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
    event,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

from config import settings

Base = declarative_base()


def _resolve_database_url() -> str:
    url = settings.database_url
    if url == "sqlite" or not url:
        db_path = Path(__file__).parent / "gaia.db"
        return f"sqlite:///{db_path}"
    if url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql+asyncpg://", "postgresql://", 1)
    if url.startswith("postgresql://"):
        return url
    db_path = Path(__file__).parent / "gaia.db"
    return f"sqlite:///{db_path}"


DATABASE_URL = _resolve_database_url()
_IS_SQLITE = DATABASE_URL.startswith("sqlite")

engine_kwargs: dict = {}
if _IS_SQLITE:
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    display_name = Column(String, default="")
    is_demo = Column(Boolean, default=False)
    role = Column(String, default="user")
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False)
    health_events = relationship("HealthEvent", back_populates="user")
    questionnaire_sessions = relationship("QuestionnaireSession", back_populates="user")
    symptoms = relationship("Symptom", back_populates="user")
    protocols = relationship("Protocol", back_populates="user")
    timeline_events = relationship("HealthTimelineEvent", back_populates="user")
    memories = relationship("AIMemory", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")
    goals = relationship("Goal", back_populates="user")
    risk_scores = relationship("RiskScore", back_populates="user")
    consent_records = relationship("ConsentRecord", back_populates="user")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    age = Column(Integer)
    sex_at_birth = Column(String)
    gender_identity = Column(String)
    ethnicity = Column(String)
    blood_type = Column(String)
    height_cm = Column(Float)
    weight_kg = Column(Float)
    country = Column(String)
    country_code = Column(String)
    city = Column(String)
    climate_zone = Column(String)
    altitude = Column(Integer)
    occupation_type = Column(String)
    sedentary_hours = Column(Float)
    shift_work = Column(Boolean, default=False)
    marital_status = Column(String)
    household_size = Column(Integer)
    financial_stress = Column(Integer)
    social_support_index = Column(Integer)
    meditation_minutes = Column(Integer, default=0)
    prayer = Column(Boolean, default=False)
    time_in_nature_minutes = Column(Integer, default=0)
    sense_of_purpose_score = Column(Integer)
    mood_frequency = Column(String)
    sleep_quality = Column(String)
    anxiety_frequency = Column(String)
    health_goals = Column(Text, default="[]")
    current_medications = Column(Text, default="[]")
    allergies = Column(Text, default="[]")
    past_illnesses = Column(Text, default="[]")
    family_history = Column(Text, default="[]")
    questionnaire_answers = Column(Text, default="{}")
    voice_notes = Column(Text, default="[]")
    wellness_snapshot = Column(Text, default="{}")
    location_context = Column(Text, default="{}")
    emergency_contacts = Column(Text, default="[]")
    insurance_info = Column(Text, default="{}")
    share_code = Column(String, default=lambda: uuid.uuid4().hex[:12])
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

    def get_json_field(self, field: str, default=None):
        raw = getattr(self, field) or "{}"
        try:
            return json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            return default if default is not None else {}

    def set_json_field(self, field: str, value):
        setattr(self, field, json.dumps(value))


class HealthEvent(Base):
    __tablename__ = "health_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    event_date = Column(String)
    event_type = Column(String, nullable=False)
    description = Column(String)
    severity = Column(Integer)
    duration_days = Column(Integer)
    medication_used = Column(Text, default="[]")
    natural_remedies_used = Column(Text, default="[]")
    outcome = Column(String)
    tags = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="health_events")


class QuestionnaireSession(Base):
    __tablename__ = "questionnaire_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    current_question_id = Column(String, default="root")
    answers = Column(Text, default="{}")
    history = Column(Text, default="[]")
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="questionnaire_sessions")


class Symptom(Base):
    __tablename__ = "symptoms"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    symptom_name = Column(String, nullable=False)
    severity = Column(Integer)
    duration = Column(String)
    context = Column(Text)
    accompanying_symptoms = Column(Text, default="[]")
    modifiers_worse = Column(String)
    modifiers_better = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="symptoms")


class Protocol(Base):
    __tablename__ = "protocols"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="recommended")
    based_on_imbalance = Column(String, nullable=False)
    match_score = Column(Float)
    herbs = Column(Text, default="[]")
    nutrition = Column(Text, default="[]")
    lifestyle = Column(Text, default="[]")
    exercise = Column(Text, default="[]")
    mind_body = Column(Text, default="{}")
    affordability_overlay = Column(Text, default="{}")
    doctor_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="protocols")


class DoctorPatientLink(Base):
    __tablename__ = "doctor_patient_links"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    doctor_id = Column(String, ForeignKey("users.id"), nullable=False)
    patient_id = Column(String, ForeignKey("users.id"), nullable=False)
    share_code = Column(String)
    access_level = Column(String, default="view")
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)


class HealthTimelineEvent(Base):
    __tablename__ = "health_timeline_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    event_type = Column(String, nullable=False)
    category = Column(String, nullable=False)
    occurred_at = Column(DateTime, default=datetime.utcnow)
    source = Column(String, default="user_entered")
    title = Column(String)
    description = Column(Text)
    metadata_json = Column(Text, default="{}")
    importance = Column(Integer, default=5)
    ai_summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="timeline_events")


class AIMemory(Base):
    __tablename__ = "ai_memories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    tier = Column(String, nullable=False)  # semantic | episodic | procedural
    content = Column(Text, nullable=False)
    source = Column(String, default="system")
    timeline_event_id = Column(String, ForeignKey("health_timeline_events.id"))
    confidence = Column(Float, default=1.0)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="memories")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    reason = Column(Text)
    priority = Column(Integer, default=5)
    category = Column(String, default="wellness")
    source = Column(String, default="system")
    status = Column(String, default="pending")  # pending | accepted | dismissed | completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="recommendations")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, default="wellness")
    target_value = Column(String)
    current_value = Column(String)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="goals")


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    level = Column(String, default="low")
    factors = Column(Text, default="[]")
    message = Column(Text)
    computed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="risk_scores")


class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    consent_type = Column(String, nullable=False)
    granted = Column(Boolean, default=False)
    granted_at = Column(DateTime)
    revoked_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="consent_records")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String)
    action = Column(String, nullable=False)
    resource_type = Column(String)
    resource_id = Column(String)
    details = Column(Text, default="{}")
    ip_address = Column(String)
    correlation_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class FamilyRelationship(Base):
    __tablename__ = "family_relationships"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    related_user_id = Column(String, ForeignKey("users.id"))
    relationship_type = Column(String, nullable=False)
    name = Column(String)
    can_view_health = Column(Boolean, default=False)
    can_manage = Column(Boolean, default=False)
    emergency_contact = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Medication(Base):
    __tablename__ = "medications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    dosage = Column(String)
    frequency = Column(String)
    reminder_time = Column(String)
    adherence_log = Column(Text, default="[]")
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class LabResult(Base):
    __tablename__ = "lab_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    test_name = Column(String, nullable=False)
    value = Column(String)
    unit = Column(String)
    reference_range = Column(String)
    test_date = Column(String)
    source = Column(String, default="user_entered")
    created_at = Column(DateTime, default=datetime.utcnow)


class SleepLog(Base):
    __tablename__ = "sleep_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    sleep_date = Column(String, nullable=False)
    duration_hours = Column(Float)
    quality_score = Column(Integer)
    notes = Column(Text)
    source = Column(String, default="user_entered")
    created_at = Column(DateTime, default=datetime.utcnow)


class IntegrationConnection(Base):
    __tablename__ = "integration_connections"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    provider = Column(String, nullable=False)
    status = Column(String, default="disconnected")
    last_sync_at = Column(DateTime)
    metadata_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)


class EnterpriseOrganization(Base):
    __tablename__ = "enterprise_organizations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    org_type = Column(String, default="employer")
    settings = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)


def _migrate_sqlite():
    """Add new columns/tables to existing SQLite databases."""
    if not _IS_SQLITE:
        return
    import sqlite3
    db_path = Path(__file__).parent / "gaia.db"
    if not db_path.exists():
        return
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(profiles)")
    cols = {row[1] for row in cursor.fetchall()}
    if "health_goals" not in cols:
        cursor.execute("ALTER TABLE profiles ADD COLUMN health_goals TEXT DEFAULT '[]'")
    if "emergency_contacts" not in cols:
        cursor.execute("ALTER TABLE profiles ADD COLUMN emergency_contacts TEXT DEFAULT '[]'")
    if "insurance_info" not in cols:
        cursor.execute("ALTER TABLE profiles ADD COLUMN insurance_info TEXT DEFAULT '{}'")
    conn.commit()
    conn.close()


def init_db():
    Base.metadata.create_all(bind=engine)
    _migrate_sqlite()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
