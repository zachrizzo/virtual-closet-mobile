from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.schemas.recommendation_schemas import (
    RecommendationRequest, 
    RecommendationResponse, 
    RecommendationFeedback,
    VirtualTryOnRequest,
    VirtualTryOnResponse,
    VirtualTryOnFileResponse
)
from app.models.user import User
from app.services.ai_service import AIService
from app.routers.auth import get_current_user
import tempfile
import os
from pathlib import Path
import uuid
import time

router = APIRouter()
ai_service = AIService()

@router.post("/recommendations", response_model=List[RecommendationResponse])
async def get_recommendations(
    request: RecommendationRequest,
    current_user: User = Depends(get_current_user)
):
    return await ai_service.get_outfit_recommendations(current_user, request)

@router.post("/style-advice")
async def get_style_advice(
    outfit_id: str,
    current_user: User = Depends(get_current_user)
):
    return await ai_service.get_style_advice(current_user.id, outfit_id)

@router.post("/occasion-outfits", response_model=List[RecommendationResponse])
async def get_occasion_outfits(
    occasion: str,
    current_user: User = Depends(get_current_user)
):
    return await ai_service.get_occasion_outfits(current_user, occasion)

@router.post("/weather-outfits", response_model=List[RecommendationResponse])
async def get_weather_outfits(
    weather: str,
    temperature: float,
    current_user: User = Depends(get_current_user)
):
    return await ai_service.get_weather_outfits(current_user, weather, temperature)

@router.post("/feedback")
async def submit_feedback(
    feedback: RecommendationFeedback,
    current_user: User = Depends(get_current_user)
):
    return await ai_service.submit_recommendation_feedback(feedback)

@router.post("/virtual-tryon", response_model=VirtualTryOnResponse)
async def virtual_tryon(
    request: VirtualTryOnRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Virtual try-on endpoint that accepts base64 or URLs.
    This endpoint is used by the mobile app.
    """
    # Extract image from request
    if hasattr(request, 'user_image'):
        user_image = request.user_image
    else:
        user_image = request.dict().get('user_image')
    
    # Get clothing item from database
    from app.services.clothing_service import ClothingService
    clothing_service = ClothingService()
    
    # Handle mock clothing item IDs for testing
    if request.clothing_item_id in ["1", "2", "3", "4", "5"]:
        # Use the first real clothing item for testing
        user_clothing = clothing_service.get_user_clothing(current_user.id)
        if user_clothing:
            clothing_item = user_clothing[0]
            print(f"📱 Using first clothing item for mock ID: {clothing_item.id}")
        else:
            raise HTTPException(status_code=404, detail="No clothing items found for testing")
    else:
        clothing_item = clothing_service.get_clothing_item(current_user.id, request.clothing_item_id)
        
        if not clothing_item:
            raise HTTPException(status_code=404, detail="Clothing item not found")
    
    # Create upload directory
    upload_dir = Path("app/data/uploads") / current_user.id / "virtual_tryon"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filenames
    session_id = str(uuid.uuid4())
    person_filename = f"person_{session_id}.jpg"
    result_filename = f"result_{session_id}.jpg"
    
    person_path = upload_dir / person_filename
    result_path = upload_dir / result_filename
    
    try:
        # Handle user image (could be base64, data URI, URL, or file path)
        if user_image.startswith('data:'):
            # Handle data URI
            import base64
            header, data = user_image.split(',', 1)
            with open(person_path, 'wb') as f:
                f.write(base64.b64decode(data))
        elif user_image.startswith('http://') or user_image.startswith('https://'):
            # Handle URL
            import requests
            response = requests.get(user_image)
            with open(person_path, 'wb') as f:
                f.write(response.content)
        elif user_image.startswith('/') or user_image.startswith('file://'):
            # Handle file path
            import shutil
            source_path = user_image.replace('file://', '')
            shutil.copy(source_path, person_path)
        else:
            # Assume it's a local path
            import shutil
            shutil.copy(user_image, person_path)
        
        # Get garment image (base64 data URI)
        garment_data = clothing_item.images.processed or clothing_item.images.original
        if not garment_data:
            raise HTTPException(status_code=400, detail="Clothing item has no image")
        
        # Handle garment image (base64 data URI)
        garment_local_path = upload_dir / f"garment_{session_id}.jpg"
        if garment_data.startswith('data:'):
            # Handle base64 data URI
            import base64
            header, data = garment_data.split(',', 1)
            with open(garment_local_path, 'wb') as f:
                f.write(base64.b64decode(data))
            garment_path_str = str(garment_local_path)
        elif garment_data.startswith('http'):
            # Handle legacy URL (for backward compatibility)
            import requests
            response = requests.get(garment_data)
            with open(garment_local_path, 'wb') as f:
                f.write(response.content)
            garment_path_str = str(garment_local_path)
        else:
            # Handle legacy file path (for backward compatibility)
            garment_path_str = str(garment_data)
        
        # Process virtual try-on with real AI
        result = await ai_service.generate_virtual_tryon_from_files(
            person_image_path=str(person_path),
            garment_image_path=garment_path_str,
            output_path=str(result_path),
            user_id=current_user.id
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=f"Virtual try-on failed: {result.get('error', 'Unknown error')}")
        
        # Return response with URL
        return VirtualTryOnResponse(
            original_image=f"/uploads/{current_user.id}/virtual_tryon/{person_filename}",
            generated_image=f"/uploads/{current_user.id}/virtual_tryon/{result_filename}",
            processing_time=result["metadata"].get("processing_time", 0)
        )
        
    except Exception as e:
        # Clean up on error
        for path in [person_path, result_path]:
            if path.exists():
                path.unlink()
        # Also clean up garment image if downloaded
        if 'garment_local_path' in locals() and garment_local_path.exists():
            garment_local_path.unlink()
        raise HTTPException(status_code=500, detail=f"Virtual try-on failed: {str(e)}")

@router.post("/virtual-tryon/upload", response_model=VirtualTryOnFileResponse)
async def virtual_tryon_upload(
    person_image: UploadFile = File(..., description="Person image file"),
    garment_image: UploadFile = File(..., description="Garment/clothing image file"),
    current_user: User = Depends(get_current_user)
):
    """
    Virtual try-on endpoint that accepts image file uploads.
    
    Upload a person image and a garment image to generate a virtual try-on result.
    """
    start_time = time.time()
    
    # Validate file types
    allowed_types = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
    if person_image.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Person image must be JPEG, PNG, or WebP")
    if garment_image.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Garment image must be JPEG, PNG, or WebP")
    
    # Create upload directory if it doesn't exist
    upload_dir = Path("app/data/uploads") / current_user.id / "virtual_tryon"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        # Generate unique filenames
        session_id = str(uuid.uuid4())
        person_filename = f"person_{session_id}.jpg"
        garment_filename = f"garment_{session_id}.jpg"
        result_filename = f"result_{session_id}.jpg"
        
        # Save uploaded files
        person_path = upload_dir / person_filename
        garment_path = upload_dir / garment_filename
        result_path = upload_dir / result_filename
        
        # Write uploaded files
        with open(person_path, "wb") as f:
            content = await person_image.read()
            f.write(content)
            
        with open(garment_path, "wb") as f:
            content = await garment_image.read()
            f.write(content)
        
        # Process virtual try-on
        result = await ai_service.generate_virtual_tryon_from_files(
            person_image_path=str(person_path),
            garment_image_path=str(garment_path),
            output_path=str(result_path),
            user_id=current_user.id
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=f"Virtual try-on failed: {result.get('error', 'Unknown error')}")
        
        processing_time = time.time() - start_time
        
        # Return URLs to the generated images
        return VirtualTryOnFileResponse(
            success=True,
            generated_image_url=f"/uploads/{current_user.id}/virtual_tryon/{result_filename}",
            original_image_url=f"/uploads/{current_user.id}/virtual_tryon/{person_filename}",
            processing_time=processing_time,
            metadata=result.get("metadata", {})
        )
        
    except Exception as e:
        # Clean up uploaded files on error
        for path in [person_path, garment_path, result_path]:
            if path.exists():
                path.unlink()
        
        raise HTTPException(status_code=500, detail=f"Virtual try-on failed: {str(e)}")