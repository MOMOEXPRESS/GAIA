"""The AI Orchestrator — single entry point for all AI interactions.

Blueprint Vol 7 §3.2 Orchestration Pipeline:
  1. Pre-processing: Safety Input Guard; emergencies bypass everything.
  2. Context Assembly: query the Memory Engine.
  3. Intent & Complexity Analysis.
  4. Agent Dispatch (Month 1: a single, honest placeholder responder —
     specialized agents arrive with the LLM gateway in Month 2).
  5. Response Generation.
  6. Post-processing: Safety Output Guard; all steps logged.
"""
from __future__ import annotations

from ..memory.engine import MemoryEngine
from ..safety.emergency import emergency_message, is_emergency
from ..safety.input_guard import classify_input
from ..safety.output_guard import violates_clinical_boundary
from ..schemas import ChatResponse, InputGuardClass

_UNSAFE_REPLY = (
    "I can't help with that. I follow strict safety rules to protect your "
    "health: I never diagnose, never prescribe, and never work around your "
    "care team. If there's something health-related I can help you "
    "understand, I'm here."
)

_SYMPTOM_REPLY = (
    "Thank you for telling me. I'm still getting to know your health, so I "
    "can't assess symptoms yet — that's coming soon. If this feels serious "
    "or is getting worse, please contact your doctor. Would you like me to "
    "save this as a symptom log on your timeline?"
)

_GENERAL_REPLY = (
    "I'm Gaia — I'm still learning about you, and my full abilities are "
    "arriving soon. I'll always be honest about what I don't know, and I'll "
    "never replace your doctor."
)

# Static safe fallback if a generated response ever violates the clinical
# boundary (Vol 7 §10.3: blocked responses are re-generated with stronger
# constraints; the fallback guarantees we never emit a diagnosis).
_BOUNDARY_FALLBACK = (
    "I can share possible explanations and help you prepare questions for "
    "your doctor, but I can't give you a diagnosis — that's something only "
    "a clinician who examines you can do."
)


class Orchestrator:
    def __init__(self, memory: MemoryEngine) -> None:
        self._memory = memory

    async def handle_chat(self, user_id: str, message: str) -> ChatResponse:
        # 1. Input Guard — emergencies bypass all agents (Vol 7 §10.2).
        intent = classify_input(message)
        if is_emergency(intent):
            return ChatResponse(
                reply=emergency_message(intent),
                intent=intent,
                is_emergency=True,
                reasoning_trace="Input guard detected emergency language; "
                "static pre-approved escalation message returned without generation.",
            )

        # 2. Context assembly (Vol 7 §3.2). Degrades gracefully (Vol 7 §3.5).
        context = await self._memory.get_context(user_id)

        # 3-5. Intent-routed response (Month 1 placeholder agents).
        if intent == InputGuardClass.UNSAFE_REQUEST:
            reply = _UNSAFE_REPLY
        elif intent == InputGuardClass.SYMPTOM_REPORT:
            reply = _SYMPTOM_REPLY
        else:
            reply = _GENERAL_REPLY

        # 6. Output Guard (Vol 7 §10.3).
        if violates_clinical_boundary(reply):
            reply = _BOUNDARY_FALLBACK

        trace = (
            f"intent={intent.value}; memory_facts={len(context.facts)}; "
            "responder=month1-static; output_guard=passed"
        )
        return ChatResponse(
            reply=reply, intent=intent, is_emergency=False, reasoning_trace=trace
        )
