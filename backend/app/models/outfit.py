from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.config.constants import Occasion, Season, WeatherCondition

class Outfit(BaseModel):
    id: str
    user_id: str
    name: str
    item_ids: List[str]
    occasion: Optional[Occasion] = None
    season: Optional[Season] = None
    weather: Optional[WeatherCondition] = None
    rating: Optional[float] = None
    notes: Optional[str] = None
    image: Optional[str] = None
    wear_count: int = 0
    last_worn: Optional[datetime] = None
    is_ai_generated: bool = False
    is_favorite: bool = False
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()