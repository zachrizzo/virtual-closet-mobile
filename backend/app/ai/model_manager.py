"""
Centralized AI Model Manager for Virtual Closet
Handles model loading from external drive with fallbacks
"""

import os
import logging
from pathlib import Path
from typing import Dict, Optional, Any
import torch

from ..config.model_paths import MODEL_PATHS, get_model_path, verify_models

logger = logging.getLogger(__name__)

class ModelManager:
    """Centralized manager for all AI models with external drive support"""
    
    def __init__(self):
        self.loaded_models: Dict[str, Any] = {}
        self.external_drive_available = self._check_external_drive()
        
    def _check_external_drive(self) -> bool:
        """Check if external drive is available"""
        external_path = Path("/Volumes/4TB-Z/AI-Models/virtual-closet")
        available = external_path.exists()
        if available:
            logger.info("✅ External drive available at %s", external_path)
        else:
            logger.warning("⚠️ External drive not available, using local fallbacks")
        return available
    
    def get_model_path(self, model_name: str, component: str) -> Path:
        """Get model path with fallback logic"""
        try:
            return get_model_path(model_name, component)
        except (ValueError, KeyError) as e:
            logger.error("Model path error: %s", e)
            raise
    
    def verify_model_availability(self) -> Dict[str, Dict[str, bool]]:
        """Verify all models are available"""
        return verify_models()
    
    def load_idm_vton_model(self, device: str = "auto") -> Any:
        """Load IDM-VTON model"""
        if "idm_vton" in self.loaded_models:
            return self.loaded_models["idm_vton"]
        
        # Determine best device
        if device == "auto":
            if torch.backends.mps.is_available():
                device = "mps"
            elif torch.cuda.is_available():
                device = "cuda"
            else:
                device = "cpu"
        
        try:
            model_path = str(get_model_path("idm_vton", "base_path"))
            
            # Import here to avoid circular imports
            from .idm_vton_simplified import IDMVTONSimplified
            
            model = IDMVTONSimplified(model_path, device=device)
            model.load_models()
            
            self.loaded_models["idm_vton"] = model
            logger.info("✅ IDM-VTON model loaded successfully")
            return model
            
        except Exception as e:
            logger.error("Failed to load IDM-VTON model: %s", e)
            raise
    
    def load_densepose_model(self, device: str = "auto") -> Any:
        """Load DensePose model"""
        if "densepose" in self.loaded_models:
            return self.loaded_models["densepose"]
        
        # Determine best device
        if device == "auto":
            if torch.cuda.is_available():
                device = "cuda"
            else:
                device = "cpu"
        
        try:
            from .preprocess.densepose_wrapper import DensePoseProcessor
            
            model = DensePoseProcessor(device=device)
            self.loaded_models["densepose"] = model
            logger.info("✅ DensePose model loaded successfully")
            return model
            
        except Exception as e:
            logger.error("Failed to load DensePose model: %s", e)
            raise
    
    def load_background_removal_model(self, model_type: str = "u2net") -> Any:
        """Load background removal model"""
        model_key = f"background_removal_{model_type}"
        if model_key in self.loaded_models:
            return self.loaded_models[model_key]
        
        try:
            from .background_removal import BackgroundRemoval
            
            model = BackgroundRemoval(model_name=model_type)
            self.loaded_models[model_key] = model
            logger.info("✅ Background removal model (%s) loaded successfully", model_type)
            return model
            
        except Exception as e:
            logger.error("Failed to load background removal model: %s", e)
            raise
    
    def unload_model(self, model_name: str):
        """Unload a specific model to free memory"""
        if model_name in self.loaded_models:
            del self.loaded_models[model_name]
            # Force garbage collection
            import gc
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            logger.info("✅ Unloaded model: %s", model_name)
    
    def unload_all_models(self):
        """Unload all models to free memory"""
        self.loaded_models.clear()
        import gc
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        logger.info("✅ Unloaded all models")
    
    def get_model_status(self) -> Dict[str, Any]:
        """Get status of all models"""
        return {
            "external_drive_available": self.external_drive_available,
            "loaded_models": list(self.loaded_models.keys()),
            "model_availability": self.verify_model_availability(),
            "device_info": {
                "cuda_available": torch.cuda.is_available(),
                "mps_available": torch.backends.mps.is_available(),
                "cuda_device_count": torch.cuda.device_count() if torch.cuda.is_available() else 0
            }
        }

# Global model manager instance
model_manager = ModelManager() 