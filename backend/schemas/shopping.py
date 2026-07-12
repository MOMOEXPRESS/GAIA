from pydantic import BaseModel


class PriceSearchRequest(BaseModel):
    items: list[str]


class PriceResult(BaseModel):
    item_name: str
    store: str
    price: float
    currency: str = "USD"
    url: str
    rating: float | None = None
    diy_alternative: str | None = None


class PriceSearchResponse(BaseModel):
    results: list[PriceResult]
