"""Emergency Escalation Protocol (Blueprint Vol 7 §10.4, Vol 3 §4.4).

When triggered, the AI immediately abandons the normal conversation and sends
a pre-written, STATIC emergency message — no generation is involved, ever.
The client renders this as a full-screen alert with no exit back to chat until
acknowledged. This is non-negotiable.
"""
from ..schemas import InputGuardClass

# Pre-approved static messages. These are content-reviewed artifacts; do not
# reword them in code changes without clinical safety review.
_SELF_HARM_MESSAGE = (
    "I'm here to help, but I can't provide emergency support. "
    "If you're thinking about harming yourself, please reach out right now: "
    "call or text 988 (Suicide & Crisis Lifeline) or your local crisis line, "
    "or call your local emergency number. You deserve support, and people are "
    "ready to help you at any hour."
)

_MEDICAL_MESSAGE = (
    "I'm here to help, but I can't provide emergency support. "
    "What you're describing could be a medical emergency. Please call your "
    "local emergency services right now, or have someone take you to the "
    "nearest emergency room."
)


def is_emergency(intent: InputGuardClass) -> bool:
    return intent in (
        InputGuardClass.EMERGENCY_SELF_HARM,
        InputGuardClass.EMERGENCY_MEDICAL,
    )


def emergency_message(intent: InputGuardClass) -> str:
    if intent == InputGuardClass.EMERGENCY_SELF_HARM:
        return _SELF_HARM_MESSAGE
    return _MEDICAL_MESSAGE
