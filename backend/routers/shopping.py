from fastapi import APIRouter

from schemas.shopping import PriceSearchRequest, PriceSearchResponse
from services.price_hunter import search_prices

router = APIRouter(prefix="/shopping", tags=["shopping"])


@router.post("/search", response_model=PriceSearchResponse)
async def price_search(request: PriceSearchRequest):
    results = await search_prices(request.items)
    return PriceSearchResponse(results=results)
