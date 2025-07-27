import json
import uuid
import asyncio
from typing import List, Dict, Optional
from datetime import datetime
from app.models.user import User
from app.models.recommendation import Recommendation
from app.schemas.recommendation_schemas import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendationFeedback,
    VirtualTryOnRequest,
    VirtualTryOnResponse
)
from app.services.clothing_service import ClothingService
from app.services.outfit_service import OutfitService
from app.config import settings
from app.config.model_paths import verify_models
from app.ai.virtual_tryon.idm_vton_processor import IDMVTONProcessor
from app.ai.virtual_tryon.gradio_idm_vton_processor import GradioIDMVTONProcessor
import random
from pathlib import Path
import tempfile

class AIService:
    def __init__(self):
        self.clothing_service = ClothingService()
        self.outfit_service = OutfitService()
        self.recommendations_file = "app/data/mock/recommendations.json"
        self.vton_processor = IDMVTONProcessor()
        self.gradio_idm_vton = GradioIDMVTONProcessor()
        # Initialize IDM-VTON implementations lazily
        self.official_idm_vton = None
        self.simplified_idm_vton = None
        self._ensure_files_exist()
    
    def _ensure_files_exist(self):
        import os
        os.makedirs(os.path.dirname(self.recommendations_file), exist_ok=True)
        if not os.path.exists(self.recommendations_file):
            with open(self.recommendations_file, 'w') as f:
                json.dump([], f)
    
    def _load_recommendations(self) -> list:
        with open(self.recommendations_file, 'r') as f:
            return json.load(f)
    
    def _save_recommendations(self, recommendations: list):
        with open(self.recommendations_file, 'w') as f:
            json.dump(recommendations, f, indent=2, default=str)
    
    def _load_idm_vton_implementations(self):
        """Lazily load IDM-VTON implementations when needed"""
        if self.simplified_idm_vton is None:
            try:
                import torch
                device = "mps" if torch.backends.mps.is_available() else "cpu"
                print(f"🔧 Using device: {device}")
                
                from app.ai.idm_vton_simplified import IDMVTONSimplified
                self.simplified_idm_vton = IDMVTONSimplified(
                    model_path="/Volumes/4TB-Z/AI-Models/virtual-closet/idm-vton/model_weights",
                    device=device  # Use MPS on Apple Silicon
                )
                print("✅ Loaded simplified IDM-VTON implementation")
            except Exception as e:
                print(f"⚠️  Failed to load simplified IDM-VTON: {e}")
                self.simplified_idm_vton = False  # Mark as failed
        
        if self.official_idm_vton is None:
            try:
                import torch
                device = "mps" if torch.backends.mps.is_available() else "cpu"
                
                from app.ai.idm_vton_official import IDMVTONOfficial
                self.official_idm_vton = IDMVTONOfficial(
                    model_path="/Volumes/4TB-Z/AI-Models/virtual-closet/idm-vton/model_weights",
                    device=device  # Use MPS on Apple Silicon
                )
                print("✅ Loaded official IDM-VTON implementation")
            except Exception as e:
                print(f"⚠️  Failed to load official IDM-VTON: {e}")
                self.official_idm_vton = False  # Mark as failed
    
    async def get_outfit_recommendations(self, user: User, request: RecommendationRequest) -> List[RecommendationResponse]:
        # Get user's clothing items
        user_clothing = self.clothing_service.get_user_clothing(user.id)
        
        if not user_clothing:
            return []
        
        recommendations = []
        
        # Simple recommendation algorithm based on context
        for _ in range(min(request.max_results, 5)):
            # Select items based on occasion and season
            selected_items = []
            
            # Select a top
            tops = [item for item in user_clothing if item.category == "tops"]
            if request.context.occasion:
                tops = [t for t in tops if request.context.occasion in [o.value for o in t.occasion]]
            if request.context.season:
                tops = [t for t in tops if request.context.season in [s.value for s in t.season]]
            
            if tops:
                selected_items.append(random.choice(tops))
            
            # Select a bottom
            bottoms = [item for item in user_clothing if item.category == "bottoms"]
            if request.context.occasion:
                bottoms = [b for b in bottoms if request.context.occasion in [o.value for o in b.occasion]]
            if request.context.season:
                bottoms = [b for b in bottoms if request.context.season in [s.value for s in b.season]]
            
            if bottoms:
                selected_items.append(random.choice(bottoms))
            
            # Add outerwear if cold weather
            if request.context.weather in ["cold", "snowy"] or (request.context.temperature and request.context.temperature < 60):
                outerwear = [item for item in user_clothing if item.category == "outerwear"]
                if outerwear:
                    selected_items.append(random.choice(outerwear))
            
            if selected_items:
                recommendation = RecommendationResponse(
                    id=str(uuid.uuid4()),
                    item_ids=[item.id for item in selected_items],
                    items=[item.dict() for item in selected_items],
                    score=random.uniform(0.7, 0.95),
                    reason=self._generate_recommendation_reason(request.context),
                    styling_tips=self._generate_styling_tips(selected_items)
                )
                recommendations.append(recommendation)
                
                # Save recommendation
                rec_dict = {
                    "id": recommendation.id,
                    "user_id": user.id,
                    "item_ids": recommendation.item_ids,
                    "context": request.context.dict(),
                    "score": recommendation.score,
                    "reason": recommendation.reason,
                    "styling_tips": recommendation.styling_tips,
                    "created_at": datetime.utcnow().isoformat()
                }
                saved_recs = self._load_recommendations()
                saved_recs.append(rec_dict)
                self._save_recommendations(saved_recs)
        
        return recommendations
    
    def _generate_recommendation_reason(self, context) -> str:
        reasons = []
        if context.occasion:
            reasons.append(f"Perfect for {context.occasion} occasions")
        if context.season:
            reasons.append(f"Great for {context.season} weather")
        if context.weather:
            reasons.append(f"Suitable for {context.weather} conditions")
        
        return ". ".join(reasons) if reasons else "A stylish and versatile outfit combination"
    
    def _generate_styling_tips(self, items) -> List[str]:
        tips = [
            "Consider adding accessories to complete the look",
            "This combination works well with both casual and smart-casual settings",
            "Try different shoe styles to change the vibe of this outfit"
        ]
        
        if any(item.category == "outerwear" for item in items):
            tips.append("Layer with the outerwear for added warmth and style")
        
        return random.sample(tips, min(2, len(tips)))
    
    async def get_style_advice(self, user_id: str, outfit_id: str) -> dict:
        outfit = self.outfit_service.get_outfit(user_id, outfit_id)
        
        # Generate mock style advice
        advice = {
            "overall_rating": random.uniform(7, 9.5),
            "color_coordination": "The colors work well together, creating a balanced look",
            "fit_assessment": "Make sure all pieces fit properly for the best appearance",
            "styling_suggestions": [
                "Consider adding a belt to define the waist",
                "A watch or bracelet would complement this outfit",
                "Try tucking in the top for a more polished look"
            ],
            "occasion_suitability": f"This outfit is well-suited for {outfit.occasion or 'various'} occasions"
        }
        
        return advice
    
    async def get_occasion_outfits(self, user: User, occasion: str) -> List[RecommendationResponse]:
        request = RecommendationRequest(
            context={"occasion": occasion},
            max_results=5
        )
        return await self.get_outfit_recommendations(user, request)
    
    async def get_weather_outfits(self, user: User, weather: str, temperature: float) -> List[RecommendationResponse]:
        request = RecommendationRequest(
            context={"weather": weather, "temperature": temperature},
            max_results=5
        )
        return await self.get_outfit_recommendations(user, request)
    
    def save_recommendation_feedback(self, user_id: str, feedback: RecommendationFeedback) -> dict:
        recommendations = self._load_recommendations()
        
        for rec in recommendations:
            if rec['id'] == feedback.recommendation_id and rec['user_id'] == user_id:
                rec['is_accepted'] = feedback.is_accepted
                rec['user_feedback'] = feedback.feedback
                break
        
        self._save_recommendations(recommendations)
        
        return {"message": "Feedback saved successfully"}
    
    async def generate_virtual_tryon(self, user_id: str, request: VirtualTryOnRequest) -> VirtualTryOnResponse:
        import time
        start_time = time.time()
        
        # Load IDM-VTON implementations lazily
        self._load_idm_vton_implementations()
        
        # Check which processor is available
        # Priority: Simplified IDM-VTON > Official IDM-VTON > Gradio IDM-VTON > Original IDM-VTON
        try:
            # Try simplified IDM-VTON first (no DensePose dependency)
            if self.simplified_idm_vton and self.simplified_idm_vton != False and self.simplified_idm_vton.load_models():
                processor = self.simplified_idm_vton
                print("🎯 Using Simplified IDM-VTON implementation (real AI model - no DensePose)")
            elif self.official_idm_vton and self.official_idm_vton != False and self.official_idm_vton.load_models():
                processor = self.official_idm_vton
                print("🎯 Using Official IDM-VTON implementation (real AI model - Gradio-style)")
            elif self.gradio_idm_vton.is_available():
                processor = self.gradio_idm_vton
                print("✅ Using IDM-VTON Gradio client (real AI model)")
            elif self.vton_processor.is_available():
                processor = self.vton_processor
                print("Using original IDM-VTON processor")
            else:
                raise Exception("No virtual try-on processor available")
        except Exception as e:
            print(f"⚠️  Failed to load IDM-VTON implementations: {e}")
            if self.gradio_idm_vton.is_available():
                processor = self.gradio_idm_vton
                print("✅ Using IDM-VTON Gradio client (real AI model)")
            elif self.vton_processor.is_available():
                processor = self.vton_processor
                print("Using original IDM-VTON processor")
            else:
                raise Exception("No virtual try-on processor available")
        
        try:
            # Get clothing item details
            clothing_item = self.clothing_service.get_clothing_item(user_id, request.clothing_item_id)
            
            # Create temporary directory for processing
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)
                
                # Save user image temporarily
                user_image_path = temp_path / "user_image.jpg"
                # In production, this would decode base64 or download from URL
                # For now, we'll use the path directly
                user_image_path = request.user_image
                
                # Get garment image path
                garment_image_path = clothing_item.images.processed or clothing_item.images.original
                if not garment_image_path:
                    raise ValueError("No garment image available")
                
                # Generate output path
                output_filename = f"vton_{user_id}_{clothing_item.id}_{int(time.time())}.jpg"
                output_path = Path(settings.UPLOAD_FOLDER) / user_id / "virtual_tryon" / output_filename
                output_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Generate virtual try-on
                if hasattr(processor, '__class__') and processor.__class__.__name__ in ['IDMVTONOfficial', 'IDMVTONSimplified']:
                    # Official/Simplified implementations use PIL images directly
                    from PIL import Image
                    person_image = Image.open(user_image_path)
                    garment_image = Image.open(garment_image_path)
                    
                    result_image, mask_image = processor.generate_virtual_tryon(
                        person_image=person_image,
                        garment_image=garment_image,
                        garment_description="a stylish garment",
                        auto_mask=True,
                        denoise_steps=30,
                        seed=42
                    )
                    
                    # Save the result
                    result_image.save(output_path)
                    result = type('obj', (object,), {
                        'success': True, 
                        'processing_time': time.time() - start_time
                    })()
                else:
                    # Other implementations use file paths
                    result = processor.generate_virtual_tryon(
                        person_image_path=str(user_image_path),
                        garment_image_path=str(garment_image_path),
                        output_path=str(output_path)
                    )
                
                if result.success:
                    return VirtualTryOnResponse(
                        original_image=request.user_image,
                        generated_image=str(output_path),
                        processing_time=result.processing_time
                    )
                else:
                    raise Exception(result.error_message)
                    
        except Exception as e:
            # Log error and return fallback
            import traceback
            print(f"Virtual try-on error: {e}")
            print(f"Full traceback: {traceback.format_exc()}")
            processing_time = time.time() - start_time
            
            return VirtualTryOnResponse(
                original_image=request.user_image,
                generated_image=request.user_image,
                processing_time=processing_time
            )

    async def generate_virtual_tryon_from_files(
        self, 
        person_image_path: str, 
        garment_image_path: str, 
        output_path: str,
        user_id: str,
        **kwargs
    ) -> dict:
        """
        Generate virtual try-on from image file paths.
        
        Args:
            person_image_path: Path to person image file
            garment_image_path: Path to garment image file  
            output_path: Path to save the generated image
            user_id: User ID for logging
            **kwargs: Additional parameters for the model
            
        Returns:
            Dictionary with processing results and metadata
        """
        import time
        start_time = time.time()
        
        try:
            print(f"🎯 Starting virtual try-on for user {user_id}")
            print(f"📸 Person image: {person_image_path}")
            print(f"👕 Garment image: {garment_image_path}")
            
            # Load IDM-VTON implementations lazily
            self._load_idm_vton_implementations()
            
            # Try to use the IDM-VTON implementations first
            try:
                # Try simplified IDM-VTON first
                if self.simplified_idm_vton and self.simplified_idm_vton != False and self.simplified_idm_vton.load_models():
                    print("🎯 Using Simplified IDM-VTON implementation")
                    from PIL import Image
                    
                    person_image = Image.open(person_image_path)
                    garment_image = Image.open(garment_image_path)
                    
                    result_image, mask_image = self.simplified_idm_vton.generate_virtual_tryon(
                        person_image=person_image,
                        garment_image=garment_image,
                        garment_description="a stylish garment",
                        auto_mask=True,
                        denoise_steps=30,
                        seed=42
                    )
                    
                    # Save the result
                    result_image.save(output_path)
                    
                    result = {
                        "success": True,
                        "output_path": output_path,
                        "metadata": {
                            "processing_time": time.time() - start_time,
                            "model_used": "IDM-VTON Simplified",
                            "inference_steps": 30
                        }
                    }
                elif self.official_idm_vton and self.official_idm_vton != False and self.official_idm_vton.load_models():
                    print("🎯 Using Official IDM-VTON implementation")
                    from PIL import Image
                    
                    person_image = Image.open(person_image_path)
                    garment_image = Image.open(garment_image_path)
                    
                    result_image, mask_image = self.official_idm_vton.generate_virtual_tryon(
                        person_image=person_image,
                        garment_image=garment_image,
                        garment_description="a stylish garment",
                        auto_mask=True,
                        denoise_steps=30,
                        seed=42
                    )
                    
                    # Save the result
                    result_image.save(output_path)
                    
                    result = {
                        "success": True,
                        "output_path": output_path,
                        "metadata": {
                            "processing_time": time.time() - start_time,
                            "model_used": "IDM-VTON Official",
                            "inference_steps": 30
                        }
                    }
                else:
                    raise Exception("IDM-VTON implementations not available")
                    
            except Exception as e:
                print(f"⚠️  IDM-VTON implementations failed: {e}, falling back to original processor")
                
                # Initialize the IDM-VTON processor
                processor = IDMVTONProcessor()
                
                # Check if the processor is available
                if not processor.is_available():
                    return {
                        "success": False,
                        "error": "IDM-VTON model is not available. Please check model installation.",
                        "metadata": {"processing_time": time.time() - start_time}
                    }
                
                # Process the virtual try-on
                result = processor.process(
                    person_image_path=person_image_path,
                    garment_image_path=garment_image_path,
                    output_path=output_path,
                    **kwargs
                )
            
            # Add total processing time
            result["metadata"]["total_processing_time"] = time.time() - start_time
            
            if result["success"]:
                print(f"✅ Virtual try-on completed successfully in {result['metadata']['total_processing_time']:.2f}s")
            else:
                print(f"❌ Virtual try-on failed: {result.get('error', 'Unknown error')}")
            
            return result
            
        except Exception as e:
            error_msg = f"Error in virtual try-on processing: {str(e)}"
            print(f"❌ {error_msg}")
            return {
                "success": False,
                "error": error_msg,
                "metadata": {"processing_time": time.time() - start_time}
            }