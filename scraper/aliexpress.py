"""AliExpress price scraper — deploy on Oracle Cloud Always Free VM."""

import httpx
from bs4 import BeautifulSoup


async def search_aliexpress(query: str, limit: int = 5) -> list[dict]:
    url = f"https://www.aliexpress.com/wholesale?SearchText={query.replace(' ', '+')}"
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
    }

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
    except httpx.HTTPError:
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    results = []

    for card in soup.select("[class*='product'], [class*='item']")[:limit]:
        title_el = card.select_one("[class*='title'], h3, a")
        price_el = card.select_one("[class*='price']")
        link_el = card.select_one("a[href]")

        if not title_el:
            continue

        results.append(
            {
                "store": "AliExpress",
                "item_name": title_el.get_text(strip=True)[:120],
                "price": _parse_price(price_el.get_text() if price_el else "0"),
                "url": link_el["href"] if link_el else url,
            }
        )

    return results


def _parse_price(text: str) -> float:
    cleaned = "".join(c for c in text if c.isdigit() or c == ".")
    try:
        return float(cleaned) if cleaned else 0.0
    except ValueError:
        return 0.0
