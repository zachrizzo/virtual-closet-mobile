"""
Stable Diffusion-based Virtual Try-On Implementation
Uses inpainting to blend garments onto person images
"""

import torch
import numpy as np
from PIL import Image
from typing import Tuple, Optional
import time
from diffusers import StableDiffusionInpaintPipeline, DPMSolverMultistepScheduler
from app.ai.background_removal import BackgroundRemoval
from app.config.model_paths import get_model_path


class StableDiffusionTryOn:
    """Virtual try-on using Stable Diffusion inpainting."""
    
    def __init__(self, device: str = None):
        """Initialize the Stable Diffusion try-on processor."""
        if device is None:
            if torch.backends.mps.is_available():
                device = "mps"
            elif torch.cuda.is_available():
                device = "cuda"
            else:
                device = "cpu"
        
        self.device = device
        self.pipe = None
        self.bg_remover = None
        self.is_loaded = False
        
    def load_models(self):
        """Load required models."""
        if self.is_loaded:
            return True
            
        try:
            print("Loading Stable Diffusion Inpainting model...")
            
            # Use a smaller model that works well for clothing
            model_id = "runwayml/stable-diffusion-inpainting"
            
            # Load the pipeline
            self.pipe = StableDiffusionInpaintPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.float32 if self.device == "mps" else torch.float16,
                safety_checker=None,
                requires_safety_checker=False
            )
            
            # Use DPM solver for faster inference
            self.pipe.scheduler = DPMSolverMultistepScheduler.from_config(
                self.pipe.scheduler.config
            )
            
            self.pipe = self.pipe.to(self.device)
            
            # Enable memory efficient attention for MPS
            if self.device == "mps":
                self.pipe.enable_attention_slicing()
            
            # Load background remover
            try:
                self.bg_remover = BackgroundRemoval(model_name="u2net")
                print("✅ Background removal model loaded")
            except:
                print("⚠️ Background removal not available")
                self.bg_remover = None
            
            self.is_loaded = True
            print("✅ Stable Diffusion Try-On models loaded successfully")
            return True
            
        except Exception as e:
            print(f"❌ Failed to load Stable Diffusion models: {e}")
            self.is_loaded = False
            return False
    
    def create_garment_mask(self, person_image: Image.Image, garment_region: str = "upper") -> Image.Image:
        """Create a mask for the garment region on the person."""
        width, height = person_image.size
        mask = Image.new('L', (width, height), 0)
        
        # Simple region-based masking
        if garment_region == "upper":
            # Upper body region (rough estimate)
            y_start = int(height * 0.15)  # Start below head
            y_end = int(height * 0.65)    # End at waist
            x_start = int(width * 0.2)
            x_end = int(width * 0.8)
        else:
            # Lower body region
            y_start = int(height * 0.55)
            y_end = int(height * 0.95)
            x_start = int(width * 0.25)
            x_end = int(width * 0.75)
        
        # Draw white rectangle in mask area
        from PIL import ImageDraw
        draw = ImageDraw.Draw(mask)
        draw.rectangle([x_start, y_start, x_end, y_end], fill=255)
        
        # Blur the mask edges for smoother blending
        from PIL import ImageFilter
        mask = mask.filter(ImageFilter.BLUR).filter(ImageFilter.BLUR)
        
        return mask
    
    def prepare_garment(self, garment_image: Image.Image, target_size: Tuple[int, int]) -> Image.Image:
        """Prepare garment image for try-on."""
        # Remove background if possible
        if self.bg_remover:
            garment_image, _ = self.bg_remover.remove_background(garment_image)
        
        # Resize garment to fit the target area
        garment_image.thumbnail(target_size, Image.Resampling.LANCZOS)
        
        return garment_image
    
    def generate_virtual_tryon(
        self,
        person_image: Image.Image,
        garment_image: Image.Image,
        garment_description: str = "a clothing item",
        garment_region: str = "upper",
        num_inference_steps: int = 30,
        guidance_scale: float = 7.5,
        seed: int = None
    ) -> Tuple[Image.Image, Image.Image]:
        """Generate virtual try-on using Stable Diffusion inpainting."""
        
        if not self.is_loaded:
            if not self.load_models():
                raise RuntimeError("Failed to load models")
        
        # Set seed for reproducibility
        if seed is not None:
            generator = torch.Generator(device=self.device).manual_seed(seed)
        else:
            generator = None
        
        # Resize images to standard size
        target_size = (512, 512)
        person_image = person_image.resize(target_size, Image.Resampling.LANCZOS)
        
        # Create mask for the garment region
        mask = self.create_garment_mask(person_image, garment_region)
        
        # Prepare garment
        garment_size = (300, 300) if garment_region == "upper" else (250, 350)
        garment_prepared = self.prepare_garment(garment_image, garment_size)
        
        # Create prompt
        prompt = f"person wearing {garment_description}, high quality, professional photo"
        negative_prompt = "deformed, distorted, disfigured, poor quality, bad anatomy"
        
        # Run inpainting
        with torch.no_grad():
            result = self.pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                image=person_image,
                mask_image=mask,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale,
                generator=generator,
            ).images[0]
        
        return result, mask
    
    def process(self, person_image_path: str, garment_image_path: str, output_path: str, **kwargs) -> dict:
        """Process virtual try-on from file paths."""
        start_time = time.time()
        
        try:
            # Load images
            person_image = Image.open(person_image_path).convert('RGB')
            garment_image = Image.open(garment_image_path).convert('RGB')
            
            # Detect garment type (simple heuristic based on aspect ratio)
            garment_aspect = garment_image.width / garment_image.height
            garment_region = "upper" if garment_aspect > 0.8 else "lower"
            
            # Generate try-on
            result_image, mask = self.generate_virtual_tryon(
                person_image=person_image,
                garment_image=garment_image,
                garment_description=kwargs.get('garment_description', 'stylish clothing'),
                garment_region=garment_region,
                num_inference_steps=kwargs.get('num_inference_steps', 20),
                guidance_scale=kwargs.get('guidance_scale', 7.5),
                seed=kwargs.get('seed', 42)
            )
            
            # Save result
            result_image.save(output_path, quality=95)
            
            processing_time = time.time() - start_time
            
            return {
                "success": True,
                "output_path": output_path,
                "metadata": {
                    "processing_time": processing_time,
                    "model": "Stable Diffusion Inpainting",
                    "method": "AI-based virtual try-on",
                    "garment_region": garment_region,
                    "device": self.device
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "metadata": {"processing_time": time.time() - start_time}
            }