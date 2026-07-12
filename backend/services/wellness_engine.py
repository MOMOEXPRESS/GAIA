"""Educational wellness snapshot — not a medical diagnosis."""

from typing import Any


def _bmi_category(bmi: float) -> str:
    if bmi < 18.5:
        return "underweight"
    if bmi < 25:
        return "normal"
    if bmi < 30:
        return "overweight"
    return "obese"


def _bmi_score(bmi: float) -> float:
    if 18.5 <= bmi <= 24.9:
        return 90
    if 17 <= bmi < 18.5 or 25 <= bmi < 27:
        return 70
    if 16 <= bmi < 17 or 27 <= bmi < 30:
        return 50
    return 35


def compute_wellness_snapshot(profile: dict, health_events: list | None = None) -> dict[str, Any]:
    health_events = health_events or []
    height = profile.get("height_cm") or 0
    weight = profile.get("weight_kg") or 0
    bmi = None
    bmi_cat = "unknown"
    physical = 50.0

    if height > 0 and weight > 0:
        bmi = round(weight / ((height / 100) ** 2), 1)
        bmi_cat = _bmi_category(bmi)
        physical = _bmi_score(bmi)

    sedentary = profile.get("sedentary_hours") or 8
    lifestyle = max(20, 100 - sedentary * 8)
    if profile.get("shift_work"):
        lifestyle -= 10
    meditation = profile.get("meditation_minutes") or 0
    nature = profile.get("time_in_nature_minutes") or 0
    lifestyle = min(100, lifestyle + meditation * 0.5 + nature * 0.3)

    financial = profile.get("financial_stress") or 5
    social = profile.get("social_support_index") or 5
    mood_map = {"rarely": 90, "sometimes": 70, "often": 45, "daily": 25}
    sleep_map = {"excellent": 95, "good": 80, "fair": 55, "poor": 30}
    anxiety_map = {"rarely": 90, "sometimes": 65, "often": 40, "daily": 20}

    mental = (
        (10 - financial) * 8
        + social * 6
        + mood_map.get(profile.get("mood_frequency", "sometimes"), 60)
        + sleep_map.get(profile.get("sleep_quality", "fair"), 55)
        + anxiety_map.get(profile.get("anxiety_frequency", "sometimes"), 60)
    ) / 4

    environmental = profile.get("location_context", {}).get("environmental_score", 65)
    if isinstance(environmental, dict):
        environmental = environmental.get("score", 65)

    history_penalty = min(30, len(health_events) * 3)
    physical = max(10, physical - history_penalty * 0.3)

    overall = round((physical + mental + lifestyle + environmental) / 4)

    insights = []
    if bmi:
        insights.append(f"BMI is {bmi} ({bmi_cat.replace('_', ' ')}) — informational only.")
    if sedentary >= 8:
        insights.append("High sedentary hours may affect energy and circulation.")
    if financial >= 7:
        insights.append("Elevated financial stress can impact sleep and mood.")
    if meditation < 5 and nature < 15:
        insights.append("More time in nature or mindfulness may support resilience.")
    if profile.get("sleep_quality") in ("poor", "fair"):
        insights.append("Sleep quality is a key pillar of holistic wellness.")
    if not insights:
        insights.append("Profile looks balanced — keep tracking your wellness journey.")

    return {
        "bmi": bmi,
        "bmi_category": bmi_cat,
        "overall_score": overall,
        "dimensions": {
            "physical": round(physical),
            "mental": round(mental),
            "lifestyle": round(lifestyle),
            "environmental": round(environmental),
        },
        "insights": insights,
        "disclaimer": "Educational estimate only — not a medical assessment",
    }
