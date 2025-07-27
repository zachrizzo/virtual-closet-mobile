from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, EmailStr
from app.config.constants import StylePersonality

class SizingInfo(BaseModel):
    top_size: Optional[str] = None
    bottom_size: Optional[str] = None
    dress_size: Optional[str] = None
    shoe_size: Optional[str] = None
    measurements: Optional[Dict[str, float]] = None

class UserPreferences(BaseModel):
    style_personality: List[StylePersonality] = []
    favorite_colors: List[str] = []
    sizing_info: SizingInfo = SizingInfo()
    occasion_preferences: List[str] = []

class User(BaseModel):
    id: str
    email: EmailStr
    first_name: str
    last_name: str
    hashed_password: str
    profile_image: Optional[str] = None
    preferences: UserPreferences = UserPreferences()
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()