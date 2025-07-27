from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel
from app.config.constants import ClothingCategory, Season, Occasion

class ColorInfo(BaseModel):
    primary: str
    secondary: Optional[List[str]] = None

class ImageInfo(BaseModel):
    original: str
    processed: Optional[str] = None
    thumbnail: Optional[str] = None

class ClothingItem(BaseModel):
    id: str
    user_id: str
    name: str
    category: ClothingCategory
    subcategory: Optional[str] = None
    brand: Optional[str] = None
    color: ColorInfo
    season: List[Season] = []
    occasion: List[Occasion] = []
    size: Optional[str] = None
    purchase_date: Optional[datetime] = None
    cost: Optional[float] = None
    images: ImageInfo
    tags: List[str] = []
    wear_count: int = 0
    last_worn: Optional[datetime] = None
    is_active: bool = True
    is_favorite: bool = False
    notes: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()