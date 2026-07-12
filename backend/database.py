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
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

DB_PATH = Path(__file__).parent / "gaia.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


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
    current_medications = Column(Text, default="[]")
    allergies = Column(Text, default="[]")
    past_illnesses = Column(Text, default="[]")
    family_history = Column(Text, default="[]")
    questionnaire_answers = Column(Text, default="{}")
    voice_notes = Column(Text, default="[]")
    wellness_snapshot = Column(Text, default="{}")
    location_context = Column(Text, default="{}")
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


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
