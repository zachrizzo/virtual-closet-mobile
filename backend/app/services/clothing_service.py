import os
import json
import uuid
import shutil
from datetime import datetime
from typing import List, Optional
from pathlib import Path
from fastapi import HTTPException, status, UploadFile
from app.models.clothing import ClothingItem, ImageInfo
from app.schemas.clothing_schemas import ClothingItemCreate, ClothingItemUpdate, ClothingItemFilter
from app.config import settings
from app.services.image_service import ImageService

class ClothingService:
    def __init__(self):
        self.clothing_file = "app/data/mock/clothing.json"
        self.upload_dir = Path(settings.UPLOAD_FOLDER)
        self.image_service = ImageService()
        self._ensure_files_exist()
    
    def _ensure_files_exist(self):
        os.makedirs(os.path.dirname(self.clothing_file), exist_ok=True)
        os.makedirs(self.upload_dir, exist_ok=True)
        if not os.path.exists(self.clothing_file):
            with open(self.clothing_file, 'w') as f:
                json.dump([], f)
    
    def _load_clothing(self) -> list:
        with open(self.clothing_file, 'r') as f:
            return json.load(f)
    
    def _save_clothing(self, clothing: list):
        with open(self.clothing_file, 'w') as f:
            json.dump(clothing, f, indent=2, default=str)
    
    def get_user_clothing(self, user_id: str, filters: Optional[ClothingItemFilter] = None) -> List[ClothingItem]:
        clothing = self._load_clothing()
        user_items = [c for c in clothing if c.get('user_id') == user_id and c.get('is_active', True)]
        
        if filters:
            filter_dict = filters.dict(exclude_unset=True)
            for key, value in filter_dict.items():
                if value is not None:
                    if key == 'tags' and isinstance(value, list):
                        user_items = [item for item in user_items if any(tag in item.get('tags', []) for tag in value)]
                    else:
                        user_items = [item for item in user_items if item.get(key) == value]
        
        return [ClothingItem(**item) for item in user_items]
    
    def create_clothing_item(self, user_id: str, item_data: ClothingItemCreate) -> ClothingItem:
        clothing = self._load_clothing()
        
        item_dict = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            **item_data.dict(),
            "images": {
                "original": None,
                "processed": None,
                "thumbnail": None
            },
            "wear_count": 0,
            "last_worn": None,
            "is_active": True,
            "is_favorite": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        clothing.append(item_dict)
        self._save_clothing(clothing)
        
        return ClothingItem(**item_dict)
    
    def get_clothing_item(self, user_id: str, item_id: str) -> ClothingItem:
        clothing = self._load_clothing()
        item = next((c for c in clothing if c['id'] == item_id and c['user_id'] == user_id), None)
        
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Clothing item not found"
            )
        
        return ClothingItem(**item)
    
    def update_clothing_item(self, user_id: str, item_id: str, update_data: ClothingItemUpdate) -> ClothingItem:
        clothing = self._load_clothing()
        item_index = next((i for i, c in enumerate(clothing) if c['id'] == item_id and c['user_id'] == user_id), None)
        
        if item_index is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Clothing item not found"
            )
        
        update_dict = update_data.dict(exclude_unset=True)
        for key, value in update_dict.items():
            clothing[item_index][key] = value
        
        clothing[item_index]['updated_at'] = datetime.utcnow().isoformat()
        self._save_clothing(clothing)
        
        return ClothingItem(**clothing[item_index])
    
    def delete_clothing_item(self, user_id: str, item_id: str):
        clothing = self._load_clothing()
        item_index = next((i for i, c in enumerate(clothing) if c['id'] == item_id and c['user_id'] == user_id), None)
        
        if item_index is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Clothing item not found"
            )
        
        # Soft delete
        clothing[item_index]['is_active'] = False
        clothing[item_index]['updated_at'] = datetime.utcnow().isoformat()
        self._save_clothing(clothing)
    
    async def upload_image(self, user_id: str, item_id: str, file: UploadFile) -> dict:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {settings.ALLOWED_EXTENSIONS}"
            )
        
        # Check file size
        contents = await file.read()
        if len(contents) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=400, detail="File too large")
        
        # Create user directory
        user_dir = self.upload_dir / user_id / item_id
        user_dir.mkdir(parents=True, exist_ok=True)
        
        # Save original file
        original_filename = f"original{file_ext}"
        original_path = user_dir / original_filename
        
        with open(original_path, "wb") as f:
            f.write(contents)
        
        # Update clothing item
        clothing = self._load_clothing()
        item_index = next((i for i, c in enumerate(clothing) if c['id'] == item_id and c['user_id'] == user_id), None)
        
        if item_index is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Clothing item not found"
            )
        
        clothing[item_index]['images']['original'] = str(original_path)
        clothing[item_index]['updated_at'] = datetime.utcnow().isoformat()
        self._save_clothing(clothing)
        
        return {"message": "Image uploaded successfully", "path": str(original_path)}
    
    async def process_image(self, user_id: str, item_id: str) -> dict:
        item = self.get_clothing_item(user_id, item_id)
        
        if not item.images.original:
            raise HTTPException(
                status_code=400,
                detail="No image to process"
            )
        
        # Process image (background removal, thumbnail generation)
        result = await self.image_service.process_clothing_image(item.images.original)
        
        # Update clothing item with processed images
        clothing = self._load_clothing()
        item_index = next((i for i, c in enumerate(clothing) if c['id'] == item_id), None)
        
        clothing[item_index]['images']['processed'] = result['processed_path']
        clothing[item_index]['images']['thumbnail'] = result['thumbnail_path']
        clothing[item_index]['updated_at'] = datetime.utcnow().isoformat()
        self._save_clothing(clothing)
        
        return result
    
    def mark_as_worn(self, user_id: str, item_id: str) -> ClothingItem:
        clothing = self._load_clothing()
        item_index = next((i for i, c in enumerate(clothing) if c['id'] == item_id and c['user_id'] == user_id), None)
        
        if item_index is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Clothing item not found"
            )
        
        clothing[item_index]['wear_count'] += 1
        clothing[item_index]['last_worn'] = datetime.utcnow().isoformat()
        clothing[item_index]['updated_at'] = datetime.utcnow().isoformat()
        self._save_clothing(clothing)
        
        return ClothingItem(**clothing[item_index])