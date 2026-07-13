"""Request/response models for the AI service (Blueprint Vol 5 §3, Vol 7 §10.2)."""
from enum import Enum

from pydantic import BaseModel, Field


class InputGuardClass(str, Enum):
    """Input Guard classification of every user message (Vol 7 §10.2)."""

    GENERAL_QUERY = "general_query"
    SYMPTOM_REPORT = "symptom_report"
    EMERGENCY_SELF_HARM = "emergency_self_harm"
    EMERGENCY_MEDICAL = "emergency_medical"
    UNSAFE_REQUEST = "unsafe_request"


class ChatRequest(BaseModel):
    user_id: str = Field(min_length=1)
    message: str = Field(min_length=1, max_length=8000)


class ChatResponse(BaseModel):
    reply: str
    intent: InputGuardClass
    is_emergency: bool
    # Trust through transparency (Vol 1 §5): every response can explain itself.
    reasoning_trace: str
