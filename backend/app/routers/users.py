from fastapi import APIRouter, Depends
from app.schemas.user_schemas import UserResponse, UserUpdate, UserPreferencesUpdate, UserAnalytics
from app.models.user import User
from app.services.user_service import UserService
from app.routers.auth import get_current_user

router = APIRouter()
user_service = UserService()

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    return user_service.update_user(current_user.id, user_update)

@router.post("/preferences", response_model=UserResponse)
async def update_preferences(
    preferences: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user)
):
    return user_service.update_preferences(current_user.id, preferences)

@router.get("/analytics", response_model=UserAnalytics)
async def get_analytics(current_user: User = Depends(get_current_user)):
    return user_service.get_user_analytics(current_user.id)