from pydantic import BaseModel, Field


class HerbItem(BaseModel):
    name: str
    latin_name: str = ""
    part_used: str = ""
    dosage: str
    frequency: str
    duration: str = ""
    caution: str = ""


class NutritionItem(BaseModel):
    meal_type: str
    foods: list[str]
    avoid: list[str] = Field(default_factory=list)
    recipes: list[str] = Field(default_factory=list)


class LifestyleItem(BaseModel):
    activity: str
    duration: str
    time_of_day: str


class ExerciseItem(BaseModel):
    type: str
    intensity: str
    duration: str
    frequency: str
    video_url: str = ""


class MindBody(BaseModel):
    meditation: str = ""
    breathwork: str = ""
    journaling_prompts: list[str] = Field(default_factory=list)


class ProtocolGenerateRequest(BaseModel):
    symptom_ids: list[str] = Field(default_factory=list)
    symptom_texts: list[str] = Field(default_factory=list)


class ProtocolResponse(BaseModel):
    id: str
    based_on_imbalance: str
    status: str = "draft"
    score: float
    herbs: list[HerbItem] = Field(default_factory=list)
    nutrition: list[NutritionItem] = Field(default_factory=list)
    lifestyle: list[LifestyleItem] = Field(default_factory=list)
    exercise: list[ExerciseItem] = Field(default_factory=list)
    mind_body: MindBody = Field(default_factory=MindBody)
