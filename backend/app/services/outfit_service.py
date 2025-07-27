import os
import json
import uuid
from datetime import datetime
from typing import List, Optional
from pathlib import Path
from fastapi import HTTPException, status
from app.models.outfit import Outfit
from app.schemas.outfit_schemas import OutfitCreate, OutfitUpdate, OutfitFilter
from app.services.clothing_service import ClothingService
from app.services.image_service import ImageService
from app.config import settings

class OutfitService:
    def __init__(self):
        self.outfits_file = "app/data/mock/outfits.json"
        self.clothing_service = ClothingService()
        self.image_service = ImageService()
        self._ensure_files_exist()
    
    def _ensure_files_exist(self):
        os.makedirs(os.path.dirname(self.outfits_file), exist_ok=True)
        if not os.path.exists(self.outfits_file):
            with open(self.outfits_file, 'w') as f:
                json.dump([], f)
    
    def _load_outfits(self) -> list:
        with open(self.outfits_file, 'r') as f:
            return json.load(f)
    
    def _save_outfits(self, outfits: list):
        with open(self.outfits_file, 'w') as f:
            json.dump(outfits, f, indent=2, default=str)
    
    def get_user_outfits(self, user_id: str, filters: Optional[OutfitFilter] = None) -> List[Outfit]:
        outfits = self._load_outfits()
        user_outfits = [o for o in outfits if o.get('user_id') == user_id]
        
        if filters:
            filter_dict = filters.dict(exclude_unset=True)
            for key, value in filter_dict.items():
                if value is not None:
                    if key == 'rating_min':
                        user_outfits = [o for o in user_outfits if o.get('rating', 0) >= value]
                    else:
                        user_outfits = [o for o in user_outfits if o.get(key) == value]
        
        # Attach clothing items
        for outfit in user_outfits:
            outfit['items'] = []
            for item_id in outfit.get('item_ids', []):
                try:
                    item = self.clothing_service.get_clothing_item(user_id, item_id)
                    outfit['items'].append(item.dict())
                except:
                    pass
        
        return [Outfit(**outfit) for outfit in user_outfits]
    
    def create_outfit(self, user_id: str, outfit_data: OutfitCreate) -> Outfit:
        outfits = self._load_outfits()
        
        # Validate that all items belong to user
        for item_id in outfit_data.item_ids:
            try:
                self.clothing_service.get_clothing_item(user_id, item_id)
            except:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Clothing item {item_id} not found or does not belong to user"
                )
        
        outfit_dict = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            **outfit_data.dict(),
            "rating": None,
            "image": None,
            "wear_count": 0,
            "last_worn": None,
            "is_ai_generated": False,
            "is_favorite": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        outfits.append(outfit_dict)
        self._save_outfits(outfits)
        
        return Outfit(**outfit_dict)
    
    def get_outfit(self, user_id: str, outfit_id: str) -> Outfit:
        outfits = self._load_outfits()
        outfit = next((o for o in outfits if o['id'] == outfit_id and o['user_id'] == user_id), None)
        
        if not outfit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Outfit not found"
            )
        
        # Attach clothing items
        outfit['items'] = []
        for item_id in outfit.get('item_ids', []):
            try:
                item = self.clothing_service.get_clothing_item(user_id, item_id)
                outfit['items'].append(item.dict())
            except:
                pass
        
        return Outfit(**outfit)
    
    def update_outfit(self, user_id: str, outfit_id: str, update_data: OutfitUpdate) -> Outfit:
        outfits = self._load_outfits()
        outfit_index = next((i for i, o in enumerate(outfits) if o['id'] == outfit_id and o['user_id'] == user_id), None)
        
        if outfit_index is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Outfit not found"
            )
        
        # Validate new items if provided
        if update_data.item_ids:
            for item_id in update_data.item_ids:
                try:
                    self.clothing_service.get_clothing_item(user_id, item_id)
                except:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Clothing item {item_id} not found"
                    )
        
        update_dict = update_data.dict(exclude_unset=True)
        for key, value in update_dict.items():
            outfits[outfit_index][key] = value
        
        outfits[outfit_index]['updated_at'] = datetime.utcnow().isoformat()
        self._save_outfits(outfits)
        
        return self.get_outfit(user_id, outfit_id)
    
    def delete_outfit(self, user_id: str, outfit_id: str):
        outfits = self._load_outfits()
        original_length = len(outfits)
        outfits = [o for o in outfits if not (o['id'] == outfit_id and o['user_id'] == user_id)]
        
        if len(outfits) == original_length:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Outfit not found"
            )
        
        self._save_outfits(outfits)
    
    def mark_as_worn(self, user_id: str, outfit_id: str) -> Outfit:
        outfits = self._load_outfits()
        outfit_index = next((i for i, o in enumerate(outfits) if o['id'] == outfit_id and o['user_id'] == user_id), None)
        
        if outfit_index is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Outfit not found"
            )
        
        outfits[outfit_index]['wear_count'] += 1
        outfits[outfit_index]['last_worn'] = datetime.utcnow().isoformat()
        outfits[outfit_index]['updated_at'] = datetime.utcnow().isoformat()
        
        # Also mark individual items as worn
        for item_id in outfits[outfit_index]['item_ids']:
            try:
                self.clothing_service.mark_as_worn(user_id, item_id)
            except:
                pass
        
        self._save_outfits(outfits)
        
        return self.get_outfit(user_id, outfit_id)
    
    async def generate_outfit_image(self, user_id: str, outfit_id: str) -> dict:
        outfit = self.get_outfit(user_id, outfit_id)
        
        # Collect item images
        item_images = []
        for item in outfit.items or []:
            if item.get('images', {}).get('processed'):
                item_images.append(item['images']['processed'])
            elif item.get('images', {}).get('original'):
                item_images.append(item['images']['original'])
        
        if not item_images:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No images available for outfit items"
            )
        
        # Generate collage
        output_dir = Path(settings.UPLOAD_FOLDER) / user_id / "outfits" / outfit_id
        output_dir.mkdir(parents=True, exist_ok=True)
        
        collage_path = output_dir / "outfit_collage.png"
        self.image_service.create_outfit_collage(item_images, str(collage_path))
        
        # Update outfit with image
        outfits = self._load_outfits()
        outfit_index = next((i for i, o in enumerate(outfits) if o['id'] == outfit_id), None)
        outfits[outfit_index]['image'] = str(collage_path)
        outfits[outfit_index]['updated_at'] = datetime.utcnow().isoformat()
        self._save_outfits(outfits)
        
        return {"message": "Outfit image generated", "image_path": str(collage_path)}