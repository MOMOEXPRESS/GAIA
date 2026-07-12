"""Location-linked wellness context — weather + curated regional factors."""

import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

import httpx

DATA_DIR = Path(__file__).parent.parent / "data"
_cache: dict[str, tuple[datetime, dict]] = {}
CACHE_TTL = timedelta(hours=24)


def _load_countries() -> list[dict]:
    with open(DATA_DIR / "countries.json", encoding="utf-8") as f:
        return json.load(f)["countries"]


def _load_regional() -> dict:
    with open(DATA_DIR / "regional_health.json", encoding="utf-8") as f:
        return json.load(f)


def list_countries() -> list[dict]:
    return _load_countries()


def get_country_by_code(code: str) -> dict | None:
    for c in _load_countries():
        if c["code"] == code:
            return c
    return None


def get_cities_for_country(code: str) -> list[str]:
    country = get_country_by_code(code)
    return country.get("cities", []) if country else []


async def fetch_weather(lat: float, lon: float) -> dict:
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,uv_index,weather_code",
        "timezone": "auto",
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, params=params)
            res.raise_for_status()
            data = res.json()
            current = data.get("current", {})
            return {
                "temperature_c": current.get("temperature_2m"),
                "humidity_pct": current.get("relative_humidity_2m"),
                "uv_index": current.get("uv_index"),
                "weather_code": current.get("weather_code"),
            }
    except httpx.HTTPError:
        return {}


def _climate_zone(lat: float) -> str:
    if abs(lat) < 23.5:
        return "tropical"
    if abs(lat) < 40:
        return "subtropical"
    if abs(lat) < 60:
        return "temperate"
    return "polar"


async def build_location_context(country_code: str, city: str = "") -> dict[str, Any]:
    cache_key = f"{country_code}:{city}"
    if cache_key in _cache:
        cached_at, data = _cache[cache_key]
        if datetime.utcnow() - cached_at < CACHE_TTL:
            return data

    country = get_country_by_code(country_code)
    if not country:
        return {"error": "Country not found"}

    regional = _load_regional()
    region_data = regional.get(country_code, regional.get("default", {}))

    lat, lon = country["lat"], country["lon"]
    weather = await fetch_weather(lat, lon)
    climate = _climate_zone(lat)

    mental_factors = region_data.get("mental_health_factors", [])
    wellness_tips = region_data.get("wellness_considerations", [])
    if weather.get("temperature_c", 20) > 30:
        wellness_tips = list(wellness_tips) + ["Stay hydrated in high heat conditions."]
    if abs(lat) > 50:
        mental_factors = list(mental_factors) + ["Higher latitude — monitor seasonal mood changes."]

    env_score = region_data.get("environmental_score", 65)

    context = {
        "country": country["name"],
        "country_code": country_code,
        "city": city or country.get("capital", ""),
        "climate_zone": climate,
        "latitude": lat,
        "longitude": lon,
        "weather": weather,
        "environmental_score": env_score,
        "pollution_tier": region_data.get("pollution_tier", "moderate"),
        "common_deficiencies": region_data.get("common_deficiencies", []),
        "seasonal_patterns": region_data.get("seasonal_patterns", []),
        "wellness_considerations": wellness_tips[:6],
        "mental_health_factors": mental_factors[:5],
        "health_links": [
            {
                "title": f"WHO health profile — {country['name']}",
                "url": f"https://www.who.int/countries/{country_code.lower()}",
            },
            {
                "title": "World Bank health indicators",
                "url": f"https://data.worldbank.org/country/{country_code.lower()}",
            },
        ],
        "disclaimer": "General regional wellness factors — not epidemiological predictions",
        "refreshed_at": datetime.utcnow().isoformat(),
    }
    _cache[cache_key] = (datetime.utcnow(), context)
    return context
