from typing import List, Optional, Dict
from pydantic import BaseModel
from app.models.recommendation import RecommendationContext

class RecommendationRequest(BaseModel):
    context: RecommendationContext
    exclude_items: Optional[List[str]] = None
    style_preferences: Optional[List[str]] = None
    max_results: int = 5

class RecommendationResponse(BaseModel):
    id: str
    outfit_id: Optional[str] = None
    item_ids: List[str]
    items: Optional[List[dict]] = None
    score: float
    reason: str
    styling_tips: Optional[List[str]] = None
    alternatives: Optional[List[Dict]] = None

class RecommendationFeedback(BaseModel):
    recommendation_id: str
    is_accepted: bool
    feedback: Optional[str] = None

class VirtualTryOnRequest(BaseModel):
    user_image: str
    clothing_item_id: str
    pose: Optional[str] = None

class VirtualTryOnResponse(BaseModel):
    original_image: str
    generated_image: str
    processing_time: float

class VirtualTryOnFileResponse(BaseModel):
    success: bool
    generated_image_url: str
    original_image_url: str
    processing_time: float
    metadata: dict