"""Rule-based pattern matching against curated knowledge base."""

import json
from pathlib import Path
from typing import Any

from services.nlp import extract_symptom_tokens

KB_PATH = Path(__file__).parent.parent / "data" / "knowledge_base.json"

_patterns: list[dict[str, Any]] | None = None


def load_patterns() -> list[dict[str, Any]]:
    global _patterns
    if _patterns is None:
        with open(KB_PATH, encoding="utf-8") as f:
            _patterns = json.load(f)["patterns"]
    return _patterns


def score_pattern(pattern: dict[str, Any], tokens: set[str], text: str) -> float:
    symptoms = pattern.get("symptoms", {})
    required = symptoms.get("required", [])
    supporting = symptoms.get("supporting", [])

    required_hits = sum(
        1 for s in required if s in tokens or s.replace("_", " ") in text
    )
    supporting_hits = sum(
        1 for s in supporting if s in tokens or s.replace("_", " ") in text
    )

    if required and required_hits == 0:
        return 0.0

    required_score = (required_hits / len(required)) * 0.7 if required else 0.3
    supporting_score = (
        (supporting_hits / len(supporting)) * 0.3 if supporting else 0.0
    )
    return min(required_score + supporting_score, 1.0)


def match_patterns(symptom_texts: list[str]) -> tuple[dict[str, Any] | None, float]:
    text = " ".join(symptom_texts).lower()
    tokens = extract_symptom_tokens(text)
    patterns = load_patterns()

    best_pattern = None
    best_score = 0.0

    for pattern in patterns:
        score = score_pattern(pattern, tokens, text)
        if score > best_score:
            best_score = score
            best_pattern = pattern

    return best_pattern, best_score


def generate_protocol(symptom_texts: list[str]) -> dict[str, Any]:
    pattern, score = match_patterns(symptom_texts)

    if not pattern or score < 0.2:
        return {
            "based_on_imbalance": "general_wellness_support",
            "score": score,
            "herbs": [],
            "nutrition": [
                {
                    "meal_type": "general",
                    "foods": ["whole foods", "leafy greens", "hydration"],
                    "avoid": ["processed sugar", "excess caffeine"],
                }
            ],
            "lifestyle": [
                {
                    "activity": "rest and observe",
                    "duration": "24-48 hours",
                    "time_of_day": "as needed",
                }
            ],
            "exercise": [],
            "mind_body": {
                "meditation": "10 minutes mindful breathing",
                "breathwork": "4-7-8 breathing, 3 rounds",
                "journaling_prompts": [
                    "What changed before this symptom appeared?",
                    "What helps even a little?",
                ],
            },
        }

    proto = pattern.get("natural_protocol", {})
    return {
        "based_on_imbalance": pattern["pattern_id"],
        "score": score,
        "herbs": proto.get("herbs", []),
        "nutrition": proto.get("nutrition", []),
        "lifestyle": proto.get("lifestyle", []),
        "exercise": proto.get("exercise", []),
        "mind_body": proto.get("mind_body", {}),
    }
