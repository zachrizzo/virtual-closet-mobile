"""Background removal module using U-2-Net model."""

import os
from pathlib import Path
from typing import Optional, Tuple
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F
from ..config.model_paths import get_model_path


class U2NetBackgroundRemover:
    """U-2-Net based background removal for clothing items."""
    
    def __init__(self, model_path: str = None, device: str = "cpu"):
        """
        Initialize U-2-Net background remover.
        
        Args:
            model_path: Path to U-2-Net model weights (optional, uses external drive if None)
            device: Device to run model on (cpu/cuda/mps)
        """
        self.device = device
        # Use external drive model path if not provided
        if model_path is None:
            try:
                self.model_path = str(get_model_path("u2net", "model"))
            except (ValueError, KeyError):
                # Fallback to parameter if external path not available
                raise ValueError("Model path must be provided when external drive is not available")
        else:
            self.model_path = model_path
        self.model = None
        
    def load_model(self):
        """Load U-2-Net model."""
        if self.model is not None:
            return
            
        try:
            from .models.u2net import U2NET, U2NETP
            
            # Check if model file exists
            if not Path(self.model_path).exists():
                print(f"U-2-Net model file not found at {self.model_path}")
                self.model = None
                return
            
            # Determine which model to use based on filename
            if "u2netp" in self.model_path.lower():
                print("Loading U2NETP (lightweight) model...")
                self.model = U2NETP(3, 1)
            else:
                print("Loading U2NET (full) model...")
                self.model = U2NET(3, 1)
            
            # Load state dict with proper device mapping
            if self.device == "cpu":
                state_dict = torch.load(self.model_path, map_location='cpu')
            elif self.device == "mps":
                # For MPS (Apple Silicon), first load to CPU then move to MPS
                state_dict = torch.load(self.model_path, map_location='cpu')
            else:
                state_dict = torch.load(self.model_path, map_location=self.device)
            
            self.model.load_state_dict(state_dict)
            self.model.to(self.device)
            self.model.eval()
            
            print(f"✅ U-2-Net model loaded successfully on {self.device}")
                
        except Exception as e:
            print(f"Failed to load U-2-Net model: {e}")
            self.model = None
            
    def remove_background(self, image: Image.Image) -> Tuple[Image.Image, Image.Image]:
        """
        Remove background from image.
        
        Args:
            image: Input PIL Image
            
        Returns:
            Tuple of (image with transparent background, binary mask)
        """
        # Load model if not already loaded
        self.load_model()
        
        if self.model is None:
            # Return original image if model not available
            mask = Image.new('L', image.size, 255)
            return image, mask
            
        # Preprocess image
        original_size = image.size
        image_tensor = self._preprocess_image(image)
        
        # Generate mask
        with torch.no_grad():
            d1, _, _, _, _, _, _ = self.model(image_tensor)
            pred = d1[:, 0, :, :]
            pred = torch.sigmoid(pred)
            
        # Convert to PIL mask
        mask = self._postprocess_mask(pred, original_size)
        
        # Apply mask to create transparent image
        image_rgba = image.convert("RGBA")
        image_rgba.putalpha(mask)
        
        return image_rgba, mask
        
    def _preprocess_image(self, image: Image.Image) -> torch.Tensor:
        """Preprocess image for U-2-Net."""
        # Resize to 320x320
        image = image.resize((320, 320), Image.Resampling.LANCZOS)
        
        # Convert to tensor
        image_np = np.array(image).astype(np.float32) / 255.0
        if len(image_np.shape) == 2:
            image_np = np.stack([image_np] * 3, axis=-1)
        
        # Normalize
        mean = np.array([0.485, 0.456, 0.406])
        std = np.array([0.229, 0.224, 0.225])
        image_np = (image_np - mean) / std
        
        # Convert to tensor
        image_tensor = torch.from_numpy(image_np.transpose(2, 0, 1)).float()
        image_tensor = image_tensor.unsqueeze(0).to(self.device)
        
        return image_tensor
        
    def _postprocess_mask(self, pred: torch.Tensor, original_size: Tuple[int, int]) -> Image.Image:
        """Postprocess U-2-Net prediction to PIL mask."""
        # Convert to numpy
        pred = pred.squeeze().cpu().numpy()
        
        # Normalize to 0-255
        pred = (pred * 255).astype(np.uint8)
        
        # Convert to PIL and resize
        mask = Image.fromarray(pred, mode='L')
        mask = mask.resize(original_size, Image.Resampling.LANCZOS)
        
        # Apply threshold
        mask_np = np.array(mask)
        mask_np = np.where(mask_np > 128, 255, 0).astype(np.uint8)
        mask = Image.fromarray(mask_np, mode='L')
        
        return mask


class BackgroundRemoval:
    """Convenience class for background removal with U-2-Net."""
    
    def __init__(self, model_name: str = "u2net", device: str = None):
        """
        Initialize background removal with specified model.
        
        Args:
            model_name: Model to use ('u2net', 'u2netp', 'u2net_human')
            device: Device to run on (None for auto-detect)
        """
        if device is None:
            if torch.backends.mps.is_available():
                device = "mps"
            elif torch.cuda.is_available():
                device = "cuda"
            else:
                device = "cpu"
        
        self.device = device
        
        # Get model path based on model name
        model_map = {
            "u2net": "model",
            "u2netp": "model_portrait",
            "u2net_human": "model_human"
        }
        
        if model_name not in model_map:
            raise ValueError(f"Unknown model: {model_name}. Choose from: {list(model_map.keys())}")
        
        try:
            model_path = str(get_model_path("u2net", model_map[model_name]))
            self.processor = U2NetBackgroundRemover(model_path=model_path, device=device)
            self.processor.load_model()
        except Exception as e:
            print(f"Failed to initialize background removal: {e}")
            self.processor = None
    
    def remove_background(self, image: Image.Image) -> Tuple[Image.Image, Image.Image]:
        """Remove background from image."""
        if self.processor is None:
            # Return original if processor not available
            mask = Image.new('L', image.size, 255)
            return image, mask
        
        return self.processor.remove_background(image)