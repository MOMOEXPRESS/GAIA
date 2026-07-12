from collections import defaultdict
from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException, status

# Simple in-memory rate limiter (swap for Redis in production)
_rate_buckets: dict[str, list[datetime]] = defaultdict(list)

ROLES = {"user", "doctor", "admin", "caregiver", "nurse"}


def check_rate_limit(key: str, max_requests: int = 10, window_seconds: int = 60):
    now = datetime.utcnow()
    cutoff = now - timedelta(seconds=window_seconds)
    bucket = _rate_buckets[key]
    _rate_buckets[key] = [t for t in bucket if t > cutoff]
    if len(_rate_buckets[key]) >= max_requests:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Rate limit exceeded")
    _rate_buckets[key].append(now)


def require_role(user, *allowed_roles: str):
    if user.role not in allowed_roles and user.role != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, f"Requires role: {', '.join(allowed_roles)}")


def require_doctor(user):
    require_role(user, "doctor", "admin")


def require_admin(user):
    require_role(user, "admin")
