"""Input Guard: intent & urgency detection (Blueprint Vol 7 §10.2).

The production guard is a fine-tuned BERT classifier; Month 1 ("The Seed")
ships a deterministic keyword classifier with the *same interface and the same
five classes*, so the model swap later changes no calling code. The guard is
deliberately conservative: emergencies must never be missed, so recall is
prioritized over precision for the emergency classes.
"""
from __future__ import annotations

import re

from ..schemas import InputGuardClass

# Phrase groups are checked in priority order: self-harm first, then medical
# emergencies, then unsafe requests, then symptom reports.
_SELF_HARM_PATTERNS = [
    r"\bkill myself\b",
    r"\bend my life\b",
    r"\bsuicid\w*\b",
    r"\bself[- ]harm\w*\b",
    r"\bhurt myself\b",
    r"\bwant to die\b",
    r"\bno reason to live\b",
]

_MEDICAL_EMERGENCY_PATTERNS = [
    r"\bchest pain\b",
    r"\bcan'?t breathe\b",
    r"\bdifficulty breathing\b",
    r"\bstroke\b",
    r"\bheart attack\b",
    r"\bsevere bleeding\b",
    r"\bunconscious\b",
    r"\boverdose\w*\b",
    r"\bseizure\b",
    r"\banaphyla\w*\b",
]

_UNSAFE_REQUEST_PATTERNS = [
    r"\bignore (your|all|previous) (rules|instructions)\b",
    r"\bpretend (you are|to be) (a|my) doctor\b",
    r"\bprescribe\b.*\bwithout\b",
    r"\bhow (do i|to) (get|buy) .* without (a )?prescription\b",
    r"\bjailbreak\b",
]

_SYMPTOM_PATTERNS = [
    r"\bheadache\w*\b",
    r"\bpain\b",
    r"\bfever\w*\b",
    r"\bnausea\w*\b",
    r"\bdizzy\w*\b",
    r"\bfatigue\w*\b",
    r"\brash\b",
    r"\bcough\w*\b",
    r"\bsymptom\w*\b",
    r"\bhurts?\b",
]


def _matches_any(text: str, patterns: list[str]) -> bool:
    return any(re.search(pattern, text) for pattern in patterns)


def classify_input(message: str) -> InputGuardClass:
    """Classify a user message into one of the five guard classes (Vol 7 §10.2)."""
    text = message.lower()

    if _matches_any(text, _SELF_HARM_PATTERNS):
        return InputGuardClass.EMERGENCY_SELF_HARM
    if _matches_any(text, _MEDICAL_EMERGENCY_PATTERNS):
        return InputGuardClass.EMERGENCY_MEDICAL
    if _matches_any(text, _UNSAFE_REQUEST_PATTERNS):
        return InputGuardClass.UNSAFE_REQUEST
    if _matches_any(text, _SYMPTOM_PATTERNS):
        return InputGuardClass.SYMPTOM_REPORT
    return InputGuardClass.GENERAL_QUERY
