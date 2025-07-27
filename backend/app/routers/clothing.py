from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException
from app.schemas.clothing_schemas import ClothingItemResponse, ClothingItemCreate, ClothingItemUpdate, ClothingItemFilter
from app.models.user import User
from app.services.clothing_service import ClothingService
from app.routers.auth import get_current_user

router = APIRouter()
clothing_service = ClothingService()

@router.get("", response_model=List[ClothingItemResponse])
async def list_clothing(
    category: Optional[str] = Query(None),
    season: Optional[str] = Query(None),
    occasion: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    filters = ClothingItemFilter(
        category=category,
        season=season,
        occasion=occasion
    )
    return clothing_service.get_user_clothing(current_user.id, filters)

@router.post("", response_model=ClothingItemResponse)
async def add_clothing(
    item: ClothingItemCreate,
    current_user: User = Depends(get_current_user)
):
    return clothing_service.create_clothing_item(current_user.id, item)

@router.get("/{item_id}", response_model=ClothingItemResponse)
async def get_clothing_item(
    item_id: str,
    current_user: User = Depends(get_current_user)
):
    return clothing_service.get_clothing_item(current_user.id, item_id)

@router.put("/{item_id}", response_model=ClothingItemResponse)
async def update_clothing_item(
    item_id: str,
    item_update: ClothingItemUpdate,
    current_user: User = Depends(get_current_user)
):
    return clothing_service.update_clothing_item(current_user.id, item_id, item_update)

@router.delete("/{item_id}")
async def delete_clothing_item(
    item_id: str,
    current_user: User = Depends(get_current_user)
):
    clothing_service.delete_clothing_item(current_user.id, item_id)
    return {"message": "Item deleted successfully"}

@router.post("/{item_id}/upload-image")
async def upload_clothing_image(
    item_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    return await clothing_service.upload_image(current_user.id, item_id, file)

@router.post("/{item_id}/process-image")
async def process_clothing_image(
    item_id: str,
    current_user: User = Depends(get_current_user)
):
    return await clothing_service.process_image(current_user.id, item_id)

@router.post("/{item_id}/wear")
async def mark_as_worn(
    item_id: str,
    current_user: User = Depends(get_current_user)
):
    return clothing_service.mark_as_worn(current_user.id, item_id)