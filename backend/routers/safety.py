from fastapi import APIRouter

from schemas.safety import SafetyCheckRequest, SafetyCheckResponse
from services.safety_checker import check_red_flags

router = APIRouter(prefix="/safety", tags=["safety"])


@router.post("/check", response_model=SafetyCheckResponse)
async def safety_check(request: SafetyCheckRequest):
    flags = check_red_flags(request.text)
    return SafetyCheckResponse(has_red_flags=len(flags) > 0, flags=flags)
