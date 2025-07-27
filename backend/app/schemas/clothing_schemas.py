from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.config.constants import ClothingCategory, Season, Occasion
from app.models.clothing import ColorInfo, ImageInfo

class ClothingItemBase(BaseModel):
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
    tags: List[str] = []
    notes: Optional[str] = None

class ClothingItemCreate(ClothingItemBase):
    pass

class ClothingItemUpdate(BaseModel):
    name: Optional[str] = None
    subcategory: Optional[str] = None
    brand: Optional[str] = None
    color: Optional[ColorInfo] = None
    season: Optional[List[Season]] = None
    occasion: Optional[List[Occasion]] = None
    size: Optional[str] = None
    purchase_date: Optional[datetime] = None
    cost: Optional[float] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    is_favorite: Optional[bool] = None

class ClothingItemResponse(ClothingItemBase):
    id: str
    user_id: str
    images: ImageInfo
    wear_count: int
    last_worn: Optional[datetime] = None
    is_active: bool
    is_favorite: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ClothingItemFilter(BaseModel):
    category: Optional[ClothingCategory] = None
    subcategory: Optional[str] = None
    season: Optional[Season] = None
    occasion: Optional[Occasion] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    tags: Optional[List[str]] = None
    is_favorite: Optional[bool] = None