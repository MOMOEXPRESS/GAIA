"""Emergency red-flag detection — hard-coded triggers for MVP."""

RED_FLAG_PATTERNS: dict[str, list[str]] = {
    "chest_pain_crushing": [
        "crushing chest pain",
        "chest pain radiating",
        "chest pressure",
        "heart attack",
    ],
    "blood_vomit": [
        "vomiting blood",
        "blood in vomit",
        "hematemesis",
        "coughing blood",
        "blood in stool",
        "black tarry stool",
    ],
    "severe_breathing": [
        "can't breathe",
        "cannot breathe",
        "difficulty breathing",
        "shortness of breath severe",
        "gasping for air",
    ],
    "stroke_signs": [
        "face drooping",
        "slurred speech",
        "sudden numbness",
        "sudden confusion",
        "worst headache of my life",
    ],
    "suicidal_ideation": [
        "want to die",
        "kill myself",
        "suicidal",
        "end my life",
    ],
    "severe_allergic": [
        "throat closing",
        "anaphylaxis",
        "tongue swelling",
        "can't swallow",
    ],
}


def check_red_flags(text: str) -> list[str]:
    lowered = text.lower()
    matched = []
    for flag_id, phrases in RED_FLAG_PATTERNS.items():
        if any(phrase in lowered for phrase in phrases):
            matched.append(flag_id)
    return matched
