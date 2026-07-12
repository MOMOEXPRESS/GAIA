from fastapi import APIRouter

router = APIRouter(prefix="/profile", tags=["users"])


@router.get("")
async def get_profile():
    return {
        "message": "Connect Supabase — profile endpoint stub",
        "role": "user",
    }


@router.put("")
async def update_profile(data: dict):
    return {"message": "Profile updated (stub)", "data": data}
