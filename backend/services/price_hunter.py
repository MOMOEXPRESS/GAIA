"""Price hunting — stub with mock data; replace with scraper on Oracle VM."""

from schemas.shopping import PriceResult

MOCK_STORES = ["AliExpress", "Amazon", "iHerb", "eBay"]


async def search_prices(items: list[str]) -> list[PriceResult]:
    results: list[PriceResult] = []
    for item in items:
        for i, store in enumerate(MOCK_STORES):
            base_price = 8.0 + i * 3.5 + len(item) * 0.1
            results.append(
                PriceResult(
                    item_name=item,
                    store=store,
                    price=round(base_price, 2),
                    url=f"https://example.com/search?q={item.replace(' ', '+')}&store={store.lower()}",
                    rating=4.0 + i * 0.2,
                    diy_alternative=(
                        f"Buy bulk {item} powder — often 40-60% cheaper than capsules"
                        if i == 0
                        else None
                    ),
                )
            )
    return sorted(results, key=lambda r: r.price)
