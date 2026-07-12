from pydantic import BaseModel


class SafetyCheckRequest(BaseModel):
    text: str


class SafetyCheckResponse(BaseModel):
    has_red_flags: bool
    flags: list[str]
