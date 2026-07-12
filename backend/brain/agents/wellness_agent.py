from typing import Any


class WellnessAgent:
    name = "wellness"

    def respond(self, message: str, context: dict) -> dict[str, Any]:
        profile = context.get("profile", {})
        memories = context.get("memories", [])
        parts = []

        sleep = profile.get("sleep_quality")
        if sleep:
            parts.append(f"Based on your profile, your sleep quality is reported as {sleep}.")

        if memories:
            parts.append(f"Considering what I know about you: {memories[0]}")

        if "sleep" in message.lower() or "tired" in message.lower():
            parts.append(
                "Consistent sleep routines, limiting screens before bed, and maintaining a cool, dark environment "
                "may support better rest. If fatigue persists, consider discussing it with your healthcare provider."
            )
        elif "water" in message.lower() or "hydrat" in message.lower():
            parts.append("Aiming for regular water intake throughout the day supports hydration and overall wellness.")
        else:
            parts.append(
                "I'm here to support your wellness journey with educational guidance. "
                "Small daily habits — movement, hydration, rest, and mindfulness — compound over time."
            )

        return {"text": " ".join(parts)}
