"""Scraper scheduler — run via Celery or cron on Oracle VM."""

import asyncio

from aliexpress import search_aliexpress
from amazon import search_amazon
from iherb import search_iherb

SCRAPERS = {
    "aliexpress": search_aliexpress,
    "amazon": search_amazon,
    "iherb": search_iherb,
}


async def run_price_search(items: list[str]) -> list[dict]:
    all_results: list[dict] = []
    for item in items:
        for name, scraper in SCRAPERS.items():
            try:
                results = await scraper(item)
                all_results.extend(results)
            except Exception as exc:
                print(f"[scraper] {name} failed for {item}: {exc}")
    return sorted(all_results, key=lambda r: r.get("price", 999))


if __name__ == "__main__":
    import sys

    queries = sys.argv[1:] or ["milk thistle"]
    output = asyncio.run(run_price_search(queries))
    for row in output:
        print(f"{row['store']}: {row['item_name']} — ${row['price']}")
