"""Amazon Product Advertising API — requires affiliate account."""

import os

import httpx


async def search_amazon(query: str, limit: int = 5) -> list[dict]:
    access_key = os.getenv("AMAZON_PA_ACCESS_KEY")
    if not access_key:
        return []

    # Full PA-API v5 signing implementation goes here in Week 5
    return [
        {
            "store": "Amazon",
            "item_name": query,
            "price": 0.0,
            "url": f"https://www.amazon.com/s?k={query.replace(' ', '+')}",
        }
    ]
