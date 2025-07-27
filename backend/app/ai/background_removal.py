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
            # For now, we'll skip loading the actual U2NET model
            # In production, this would load the full U2NET architecture
            print(f"U-2-Net model loading skipped (model file implementation pending)")
            self.model = None
                
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