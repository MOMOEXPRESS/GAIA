"""Fuzzy-match voice transcripts to predefined questionnaire options."""

import re
from difflib import SequenceMatcher


def _normalize(text: str) -> str:
    return re.sub(r"[^a-z0-9\s]", "", text.lower()).strip()


def match_voice_to_options(transcript: str, options: list[str]) -> dict:
    normalized = _normalize(transcript)
    if not options:
        return {"matched": None, "confidence": 0.0, "transcript": transcript}

    best_match = None
    best_score = 0.0

    for option in options:
        opt_norm = _normalize(option.replace("_", " "))
        if opt_norm in normalized or normalized in opt_norm:
            return {"matched": option, "confidence": 0.95, "transcript": transcript}
        score = SequenceMatcher(None, normalized, opt_norm).ratio()
        words = opt_norm.split()
        word_hits = sum(1 for w in words if w in normalized)
        if words:
            score = max(score, word_hits / len(words))
        if score > best_score:
            best_score = score
            best_match = option

    if best_score >= 0.45:
        return {"matched": best_match, "confidence": round(best_score, 2), "transcript": transcript}

    return {"matched": None, "confidence": round(best_score, 2), "transcript": transcript}
