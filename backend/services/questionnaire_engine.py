import json
from pathlib import Path
from typing import Any

DATA_PATH = Path(__file__).parent.parent / "data" / "questionnaire.json"

_questions: dict | None = None


def load_questionnaire() -> dict:
    global _questions
    if _questions is None:
        with open(DATA_PATH, encoding="utf-8") as f:
            _questions = json.load(f)
    return _questions


def get_question(question_id: str) -> dict | None:
    data = load_questionnaire()
    return data["questions"].get(question_id)


def get_next_question_id(current_id: str, answer: Any) -> str | None:
    q = get_question(current_id)
    if not q:
        return None
    next_map = q.get("next", {})
    if current_id == "complete":
        return None
    answer_key = str(answer) if not isinstance(answer, list) else "*"
    if answer_key in next_map:
        return next_map[answer_key]
    return next_map.get("*", "complete")


def apply_answer_to_profile_field(field: str, answer: Any, profile_data: dict) -> dict:
    if field == "shift_work":
        profile_data[field] = answer == "yes"
    elif field in ("past_illnesses", "current_medications", "allergies", "family_history"):
        if isinstance(answer, list):
            profile_data[field] = [a for a in answer if a != "none"]
        else:
            profile_data[field] = answer
    elif field == "country_code":
        profile_data["country_code"] = answer
        from services.location_intelligence import get_country_by_code
        country = get_country_by_code(answer)
        if country:
            profile_data["country"] = country["name"]
    else:
        profile_data[field] = answer
    return profile_data


def count_progress(answers: dict) -> tuple[int, int]:
    data = load_questionnaire()
    total = data.get("total_questions", 24)
    answered = len([k for k in answers if k != "complete"])
    return answered, total
