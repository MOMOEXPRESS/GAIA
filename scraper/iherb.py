"""iHerb search scraper stub."""

import httpx
from bs4 import BeautifulSoup


async def search_iherb(query: str, limit: int = 5) -> list[dict]:
    url = f"https://www.iherb.com/search?kw={query.replace(' ', '+')}"
    headers = {"User-Agent": "Mozilla/5.0 (compatible; GaiaHealth/0.1)"}

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
    except httpx.HTTPError:
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    results = []

    for item in soup.select(".product-cell, [data-product-id]")[:limit]:
        name_el = item.select_one(".product-title, h2, a")
        price_el = item.select_one(".price, [class*='price']")
        if name_el:
            results.append(
                {
                    "store": "iHerb",
                    "item_name": name_el.get_text(strip=True)[:120],
                    "price": 0.0,
                    "url": url,
                }
            )
        if price_el and results:
            text = price_el.get_text()
            cleaned = "".join(c for c in text if c.isdigit() or c == ".")
            if cleaned:
                results[-1]["price"] = float(cleaned)

    return results
