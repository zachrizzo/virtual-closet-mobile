import os
import json
import uuid
import base64
from datetime import datetime
from typing import List, Optional
from pathlib import Path
from fastapi import HTTPException, status, UploadFile
from app.models.clothing import ClothingItem, ImageInfo
from app.schemas.clothing_schemas import ClothingItemCreate, ClothingItemUpdate, ClothingItemFilter
from app.config import settings
from app.services.image_service import ImageService
from PIL import Image
import io

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
        
        # Convert to base64
        original_base64 = base64.b64encode(contents).decode('utf-8')
        
        # Create data URI with proper MIME type
        mime_type = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg', 
            '.png': 'image/png',
            '.webp': 'image/webp'
        }.get(file_ext, 'image/jpeg')
        
        original_data_uri = f"data:{mime_type};base64,{original_base64}"
        
        # Generate thumbnail
        thumbnail_data_uri = self._generate_thumbnail(contents, mime_type)
        
        # Update clothing item
        clothing = self._load_clothing()
        item_index = next((i for i, c in enumerate(clothing) if c['id'] == item_id and c['user_id'] == user_id), None)
        
        if item_index is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Clothing item not found"
            )
        
        clothing[item_index]['images']['original'] = original_data_uri
        clothing[item_index]['images']['thumbnail'] = thumbnail_data_uri
        clothing[item_index]['updated_at'] = datetime.utcnow().isoformat()
        self._save_clothing(clothing)
        
        return {"message": "Image uploaded successfully", "data_uri": original_data_uri}
    
    def _generate_thumbnail(self, image_bytes: bytes, mime_type: str, size: tuple = (150, 150)) -> str:
        """Generate a thumbnail from image bytes and return as base64 data URI"""
        try:
            # Open image from bytes
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary (for JPEG)
            if image.mode in ('RGBA', 'P'):
                image = image.convert('RGB')
            
            # Generate thumbnail
            image.thumbnail(size, Image.Resampling.LANCZOS)
            
            # Save to bytes
            output = io.BytesIO()
            format_name = 'JPEG' if mime_type == 'image/jpeg' else mime_type.split('/')[-1].upper()
            image.save(output, format=format_name, quality=85)
            
            # Convert to base64
            thumbnail_bytes = output.getvalue()
            thumbnail_base64 = base64.b64encode(thumbnail_bytes).decode('utf-8')
            
            return f"data:{mime_type};base64,{thumbnail_base64}"
        except Exception:
            # If thumbnail generation fails, return None
            return None
    
    async def process_image(self, user_id: str, item_id: str) -> dict:
        item = self.get_clothing_item(user_id, item_id)
        
        if not item.images.original:
            raise HTTPException(
                status_code=400,
                detail="No image to process"
            )
        
        # Convert base64 data URI to bytes for processing
        if item.images.original.startswith('data:'):
            # Extract base64 data from data URI
            header, base64_data = item.images.original.split(',', 1)
            image_bytes = base64.b64decode(base64_data)
            mime_type = header.split(';')[0].split(':')[1]
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid image format"
            )
        
        # Process image (background removal)
        processed_image_bytes = await self.image_service.process_clothing_image_bytes(image_bytes)
        
        # Convert processed image to base64 data URI
        processed_base64 = base64.b64encode(processed_image_bytes).decode('utf-8')
        processed_data_uri = f"data:{mime_type};base64,{processed_base64}"
        
        # Update clothing item with processed image
        clothing = self._load_clothing()
        item_index = next((i for i, c in enumerate(clothing) if c['id'] == item_id), None)
        
        clothing[item_index]['images']['processed'] = processed_data_uri
        clothing[item_index]['updated_at'] = datetime.utcnow().isoformat()
        self._save_clothing(clothing)
        
        return {
            "processed_data_uri": processed_data_uri,
            "message": "Image processed successfully"
        }
    
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