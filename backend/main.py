from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import doctors, protocols, safety, shopping, symptoms, users

app = FastAPI(
    title=settings.app_name,
    description="Holistic wellness API — educational natural health support",
    version="0.1.0",
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if not settings.debug else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix=settings.api_prefix)
app.include_router(symptoms.router, prefix=settings.api_prefix)
app.include_router(protocols.router, prefix=settings.api_prefix)
app.include_router(safety.router, prefix=settings.api_prefix)
app.include_router(shopping.router, prefix=settings.api_prefix)
app.include_router(doctors.router, prefix=settings.api_prefix)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "gaia-health-api"}
