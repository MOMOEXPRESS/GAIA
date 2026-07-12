from typing import Any, Optional

from pydantic import BaseModel, Field


class ProfileResponse(BaseModel):
    id: str
    user_id: str
    age: Optional[int] = None
    sex_at_birth: Optional[str] = None
    gender_identity: Optional[str] = None
    ethnicity: Optional[str] = None
    blood_type: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    city: Optional[str] = None
    climate_zone: Optional[str] = None
    occupation_type: Optional[str] = None
    sedentary_hours: Optional[float] = None
    shift_work: bool = False
    marital_status: Optional[str] = None
    household_size: Optional[int] = None
    financial_stress: Optional[int] = None
    social_support_index: Optional[int] = None
    meditation_minutes: int = 0
    time_in_nature_minutes: int = 0
    sense_of_purpose_score: Optional[int] = None
    mood_frequency: Optional[str] = None
    sleep_quality: Optional[str] = None
    anxiety_frequency: Optional[str] = None
    current_medications: list[str] = Field(default_factory=list)
    allergies: list[str] = Field(default_factory=list)
    past_illnesses: list[str] = Field(default_factory=list)
    family_history: list[str] = Field(default_factory=list)
    questionnaire_answers: dict[str, Any] = Field(default_factory=dict)
    voice_notes: list[dict] = Field(default_factory=list)
    wellness_snapshot: dict[str, Any] = Field(default_factory=dict)
    location_context: dict[str, Any] = Field(default_factory=dict)
    share_code: Optional[str] = None
    display_name: Optional[str] = None
    email: Optional[str] = None
    is_demo: bool = False


class ProfileUpdateRequest(BaseModel):
    age: Optional[int] = None
    sex_at_birth: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    country_code: Optional[str] = None
    city: Optional[str] = None
    financial_stress: Optional[int] = None
    social_support_index: Optional[int] = None
    mood_frequency: Optional[str] = None
    sleep_quality: Optional[str] = None
    anxiety_frequency: Optional[str] = None
    meditation_minutes: Optional[int] = None
    time_in_nature_minutes: Optional[int] = None


class HealthEventCreate(BaseModel):
    event_type: str
    event_date: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[int] = Field(None, ge=1, le=10)
    duration_days: Optional[int] = None
    outcome: Optional[str] = None
    tags: list[str] = Field(default_factory=list)


class HealthEventResponse(HealthEventCreate):
    id: str


class QuestionAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    answer: Any
    voice_transcript: Optional[str] = None


class VoiceParseRequest(BaseModel):
    transcript: str
    options: list[str]


class VoiceParseResponse(BaseModel):
    matched: Optional[str]
    confidence: float
    transcript: str
