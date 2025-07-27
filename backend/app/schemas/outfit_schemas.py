from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.config.constants import Occasion, Season, WeatherCondition

class OutfitBase(BaseModel):
    name: str
    item_ids: List[str]
    occasion: Optional[Occasion] = None
    season: Optional[Season] = None
    weather: Optional[WeatherCondition] = None
    notes: Optional[str] = None

class OutfitCreate(OutfitBase):
    pass

class OutfitUpdate(BaseModel):
    name: Optional[str] = None
    item_ids: Optional[List[str]] = None
    occasion: Optional[Occasion] = None
    season: Optional[Season] = None
    weather: Optional[WeatherCondition] = None
    rating: Optional[float] = None
    notes: Optional[str] = None
    is_favorite: Optional[bool] = None

class OutfitResponse(OutfitBase):
    id: str
    user_id: str
    rating: Optional[float] = None
    image: Optional[str] = None
    wear_count: int
    last_worn: Optional[datetime] = None
    is_ai_generated: bool
    is_favorite: bool
    created_at: datetime
    updated_at: datetime
    items: Optional[List[dict]] = None

    class Config:
        from_attributes = True

class OutfitFilter(BaseModel):
    occasion: Optional[Occasion] = None
    season: Optional[Season] = None
    weather: Optional[WeatherCondition] = None
    is_ai_generated: Optional[bool] = None
    is_favorite: Optional[bool] = None
    rating_min: Optional[float] = None