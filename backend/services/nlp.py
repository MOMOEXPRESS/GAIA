"""NLP preprocessing — spaCy when available, keyword fallback otherwise."""

import re

SYNONYM_MAP: dict[str, list[str]] = {
    "irritability": ["irritable", "angry", "frustrated", "short tempered"],
    "emotional_stress_trigger": ["stress", "anxious", "overwhelmed", "worried"],
    "rib_side_distension": ["rib pain", "side ache", "hypochondriac", "flank"],
    "headache_temporal": ["headache", "temple pain", "migraine"],
    "digestive_upset": ["bloating", "nausea", "indigestion", "stomach upset"],
    "fatigue": ["tired", "exhausted", "low energy", "worn out"],
    "insomnia": ["can't sleep", "poor sleep", "wakeful", "insomnia"],
    "PMS": ["pms", "premenstrual", "before period"],
    "sighing": ["sigh", "sighing frequently"],
    "cold_extremities": ["cold hands", "cold feet", "always cold"],
    "brain_fog": ["foggy", "brain fog", "can't focus", "mental clarity"],
    "muscle_tension": ["tense muscles", "tight shoulders", "neck tension"],
}


def _keyword_tokens(text: str) -> set[str]:
    tokens: set[str] = set()
    lowered = text.lower()

    for concept, synonyms in SYNONYM_MAP.items():
        if concept.replace("_", " ") in lowered:
            tokens.add(concept)
        for syn in synonyms:
            if syn in lowered:
                tokens.add(concept)

    words = set(re.findall(r"[a-z_]+", lowered))
    tokens.update(words)
    return tokens


def extract_symptom_tokens(text: str) -> set[str]:
    try:
        import spacy

        nlp = spacy.load("en_core_web_sm")
        doc = nlp(text.lower())
        spacy_tokens = {t.lemma_ for t in doc if not t.is_stop and t.is_alpha}
        return spacy_tokens | _keyword_tokens(text)
    except (ImportError, OSError):
        return _keyword_tokens(text)
