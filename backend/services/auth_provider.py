from abc import ABC, abstractmethod
import uuid
from typing import Optional

from sqlalchemy.orm import Session

from config import settings
from database import Profile, User
from dependencies import create_access_token, hash_password, verify_password


class AuthProvider(ABC):
    @abstractmethod
    def register(self, db: Session, email: str, password: str, display_name: str = "") -> tuple[User, str]:
        pass

    @abstractmethod
    def login(self, db: Session, email: str, password: str) -> tuple[User, str]:
        pass

    @abstractmethod
    def create_demo(self, db: Session) -> tuple[User, str, str]:
        pass


class MockAuthProvider(AuthProvider):
    def register(self, db: Session, email: str, password: str, display_name: str = "") -> tuple[User, str]:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise ValueError("Email already registered")
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            password_hash=hash_password(password),
            display_name=display_name or email.split("@")[0],
        )
        db.add(user)
        db.flush()
        profile = Profile(id=str(uuid.uuid4()), user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(user)
        return user, create_access_token(user.id, user.email)

    def login(self, db: Session, email: str, password: str) -> tuple[User, str]:
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.password_hash):
            raise ValueError("Invalid email or password")
        return user, create_access_token(user.id, user.email)

    def create_demo(self, db: Session) -> tuple[User, str, str]:
        import secrets
        suffix = secrets.token_hex(3)
        email = f"demo_{suffix}@gaia.local"
        password = secrets.token_urlsafe(8)
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            password_hash=hash_password(password),
            display_name=f"Demo User {suffix}",
            is_demo=True,
        )
        db.add(user)
        db.flush()
        profile = Profile(id=str(uuid.uuid4()), user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(user)
        return user, password, create_access_token(user.id, user.email)


class SupabaseAuthProvider(AuthProvider):
    """Stub for future Supabase integration — validates via Supabase JWT."""

    def register(self, db: Session, email: str, password: str, display_name: str = "") -> tuple[User, str]:
        raise NotImplementedError("Use Supabase client SDK for registration when AUTH_MODE=supabase")

    def login(self, db: Session, email: str, password: str) -> tuple[User, str]:
        raise NotImplementedError("Use Supabase client SDK for login when AUTH_MODE=supabase")

    def create_demo(self, db: Session) -> tuple[User, str, str]:
        raise NotImplementedError("Demo accounts only available in mock auth mode")


def get_auth_provider() -> AuthProvider:
    if settings.auth_mode == "supabase":
        return SupabaseAuthProvider()
    return MockAuthProvider()
