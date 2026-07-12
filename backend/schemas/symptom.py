from pydantic import BaseModel, Field


class BodyLocation(BaseModel):
    region: str = ""
    side: str = ""
    description: str = ""


class SymptomCreate(BaseModel):
    symptom_name: str
    body_location: BodyLocation = Field(default_factory=BodyLocation)
    quality: str = ""
    intensity: int = Field(default=5, ge=0, le=10)
    duration: str = ""
    context: str = ""
    modifiers_better: str = ""
    modifiers_worse: str = ""
    accompanying_symptoms: list[str] = Field(default_factory=list)
    emotional_state: str = ""
    user_labels: list[str] = Field(default_factory=list)


class SymptomResponse(SymptomCreate):
    id: str
    timestamp: str
