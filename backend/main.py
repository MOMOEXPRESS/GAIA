import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import init_db
from middleware.audit import CorrelationMiddleware
from routers import (
    ai,
    auth,
    briefing,
    clinical,
    doctors,
    enterprise,
    integrations,
    memory,
    privacy,
    protocols,
    safety,
    shopping,
    symptoms,
    timeline,
    users,
)
from workers.event_consumer import register_handlers

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")

app = FastAPI(
    title=settings.app_name,
    description="Gaia Health — Personal Health Operating System API",
    version="1.0.0",
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]

app.add_middleware(CorrelationMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if not settings.debug else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(users.router, prefix=settings.api_prefix)
app.include_router(symptoms.router, prefix=settings.api_prefix)
app.include_router(protocols.router, prefix=settings.api_prefix)
app.include_router(safety.router, prefix=settings.api_prefix)
app.include_router(shopping.router, prefix=settings.api_prefix)
app.include_router(doctors.router, prefix=settings.api_prefix)
app.include_router(timeline.router, prefix=settings.api_prefix)
app.include_router(memory.router, prefix=settings.api_prefix)
app.include_router(briefing.router, prefix=settings.api_prefix)
app.include_router(ai.router, prefix=settings.api_prefix)
app.include_router(privacy.router, prefix=settings.api_prefix)
app.include_router(clinical.router, prefix=settings.api_prefix)
app.include_router(integrations.router, prefix=settings.api_prefix)
app.include_router(enterprise.router, prefix=settings.api_prefix)


@app.on_event("startup")
def startup():
    init_db()
    register_handlers()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "gaia-health-api", "version": "1.0.0", "auth_mode": settings.auth_mode}
