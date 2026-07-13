"""Gaia AI Service — FastAPI entry point (Blueprint Vol 6 §5.4 AI Brain Service).

Endpoints:
  POST /ai/chat  — the Chat API (Vol 5 §3). Streaming (SSE) arrives with the
                   LLM gateway; Month 1 returns complete messages.
  GET  /health   — liveness probe for Kubernetes.
"""
from fastapi import FastAPI

from .memory.engine import MemoryEngine
from .orchestrator.orchestrator import Orchestrator
from .schemas import ChatRequest, ChatResponse

app = FastAPI(title="Gaia AI Service", version="0.1.0")

_orchestrator = Orchestrator(memory=MemoryEngine())


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "gaia-ai"}


@app.post("/ai/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    return await _orchestrator.handle_chat(request.user_id, request.message)
