from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    display_name: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class DemoAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str
    password: str
    user: "UserResponse"


class UserResponse(BaseModel):
    id: str
    email: str
    display_name: str
    is_demo: bool
    role: str

    class Config:
        from_attributes = True
