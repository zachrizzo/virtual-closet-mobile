from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserPreferences, SizingInfo

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image: Optional[str] = None

class UserPreferencesUpdate(BaseModel):
    style_personality: Optional[List[str]] = None
    favorite_colors: Optional[List[str]] = None
    sizing_info: Optional[SizingInfo] = None
    occasion_preferences: Optional[List[str]] = None

class UserResponse(UserBase):
    id: str
    profile_image: Optional[str] = None
    preferences: UserPreferences
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserAnalytics(BaseModel):
    total_items: int
    total_outfits: int
    most_worn_items: List[dict]
    least_worn_items: List[dict]
    cost_per_wear: dict
    favorite_colors: List[dict]
    wardrobe_value: float