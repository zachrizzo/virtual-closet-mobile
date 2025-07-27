from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel
from app.config.constants import Occasion, Season, WeatherCondition

class RecommendationContext(BaseModel):
    occasion: Optional[Occasion] = None
    season: Optional[Season] = None
    weather: Optional[WeatherCondition] = None
    temperature: Optional[float] = None
    event_type: Optional[str] = None
    time_of_day: Optional[str] = None

class Recommendation(BaseModel):
    id: str
    user_id: str
    outfit_id: Optional[str] = None
    item_ids: List[str]
    context: RecommendationContext
    score: float
    reason: str
    styling_tips: Optional[List[str]] = None
    alternatives: Optional[List[Dict]] = None
    is_accepted: Optional[bool] = None
    user_feedback: Optional[str] = None
    created_at: datetime = datetime.utcnow()