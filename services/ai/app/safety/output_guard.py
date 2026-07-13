"""Output Guard: diagnosis-language prevention (Blueprint Vol 7 §10.3).

The Clinical Boundary Model (Vol 7 §10.1): the AI never diagnoses, never
prescribes, never delays emergency care. This guard scans candidate responses
for definitive diagnosis language ("You have...", "This is definitely...").
Blocked responses must be regenerated with stronger constraints.
"""
from __future__ import annotations

import re

_DIAGNOSIS_PATTERNS = [
    r"\byou (definitely |certainly |clearly )?have [a-z]",
    r"\bthis is (definitely|certainly|clearly)\b",
    r"\byou are (definitely |certainly )?suffering from\b",
    r"\bi (can |hereby )?diagnose\b",
    r"\byour diagnosis is\b",
    r"\byou should (start|stop) taking \d",
]


def violates_clinical_boundary(response_text: str) -> bool:
    """Returns True when the response crosses the diagnosis boundary."""
    text = response_text.lower()
    return any(re.search(pattern, text) for pattern in _DIAGNOSIS_PATTERNS)
