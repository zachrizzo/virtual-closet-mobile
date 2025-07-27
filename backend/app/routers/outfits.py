from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from app.schemas.outfit_schemas import OutfitResponse, OutfitCreate, OutfitUpdate, OutfitFilter
from app.models.user import User
from app.services.outfit_service import OutfitService
from app.routers.auth import get_current_user

router = APIRouter()
outfit_service = OutfitService()

@router.get("", response_model=List[OutfitResponse])
async def list_outfits(
    occasion: Optional[str] = Query(None),
    season: Optional[str] = Query(None),
    is_favorite: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user)
):
    filters = OutfitFilter(
        occasion=occasion,
        season=season,
        is_favorite=is_favorite
    )
    return outfit_service.get_user_outfits(current_user.id, filters)

@router.post("", response_model=OutfitResponse)
async def create_outfit(
    outfit: OutfitCreate,
    current_user: User = Depends(get_current_user)
):
    return outfit_service.create_outfit(current_user.id, outfit)

@router.get("/{outfit_id}", response_model=OutfitResponse)
async def get_outfit(
    outfit_id: str,
    current_user: User = Depends(get_current_user)
):
    return outfit_service.get_outfit(current_user.id, outfit_id)

@router.put("/{outfit_id}", response_model=OutfitResponse)
async def update_outfit(
    outfit_id: str,
    outfit_update: OutfitUpdate,
    current_user: User = Depends(get_current_user)
):
    return outfit_service.update_outfit(current_user.id, outfit_id, outfit_update)

@router.delete("/{outfit_id}")
async def delete_outfit(
    outfit_id: str,
    current_user: User = Depends(get_current_user)
):
    outfit_service.delete_outfit(current_user.id, outfit_id)
    return {"message": "Outfit deleted successfully"}

@router.post("/{outfit_id}/wear")
async def mark_outfit_worn(
    outfit_id: str,
    current_user: User = Depends(get_current_user)
):
    return outfit_service.mark_as_worn(current_user.id, outfit_id)

@router.post("/{outfit_id}/generate-image")
async def generate_outfit_image(
    outfit_id: str,
    current_user: User = Depends(get_current_user)
):
    return await outfit_service.generate_outfit_image(current_user.id, outfit_id)