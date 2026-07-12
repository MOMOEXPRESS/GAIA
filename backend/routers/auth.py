from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from dependencies import get_current_user
from database import User
from schemas.auth import (
    AuthResponse,
    DemoAuthResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse,
)
from services.auth_provider import get_auth_provider

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    provider = get_auth_provider()
    try:
        user, token = provider.register(db, req.email, req.password, req.display_name)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except NotImplementedError as e:
        raise HTTPException(501, str(e))
    return AuthResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    provider = get_auth_provider()
    try:
        user, token = provider.login(db, req.email, req.password)
    except ValueError as e:
        raise HTTPException(401, str(e))
    except NotImplementedError as e:
        raise HTTPException(501, str(e))
    return AuthResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/demo", response_model=DemoAuthResponse)
def create_demo(db: Session = Depends(get_db)):
    from middleware.rbac import check_rate_limit
    check_rate_limit("auth_demo", max_requests=5, window_seconds=300)
    provider = get_auth_provider()
    try:
        user, password, token = provider.create_demo(db)
    except NotImplementedError:
        raise HTTPException(501, "Demo accounts only available in mock auth mode (AUTH_MODE=mock)")
    except Exception as e:
        raise HTTPException(500, f"Demo account creation failed: {e}")
    return DemoAuthResponse(
        access_token=token,
        email=user.email,
        password=password,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)
