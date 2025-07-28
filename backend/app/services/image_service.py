import os
import asyncio
from pathlib import Path
from typing import Dict, Optional
from PIL import Image
import numpy as np
from app.config.model_paths import get_model_path, verify_models

class ImageService:
    def __init__(self):
        self.thumbnail_size = (300, 300)
        self.max_image_size = (1200, 1200)
        models_status = verify_models()
        self.u2net_available = models_status.get("u2net", {}).get("model", False)
        
        if self.u2net_available:
            self._load_u2net_model()
    
    def _load_u2net_model(self):
        """Load U-2-Net model if available"""
        try:
            from app.ai.background_removal import BackgroundRemoval
            
            # Try portrait model first (smaller, faster)
            try:
                self.bg_remover = BackgroundRemoval(model_name="u2netp")
                if self.bg_remover.processor and self.bg_remover.processor.model is not None:
                    self.u2net_available = True
                    print("✅ U-2-Net Portrait model loaded successfully")
                    return
            except:
                pass
            
            # Fall back to full model
            try:
                self.bg_remover = BackgroundRemoval(model_name="u2net")
                if self.bg_remover.processor and self.bg_remover.processor.model is not None:
                    self.u2net_available = True
                    print("✅ U-2-Net full model loaded successfully")
                    return
            except:
                pass
            
            # If no model loaded
            self.u2net_available = False
            self.bg_remover = None
            print("⚠️ U-2-Net models not available")
            
        except Exception as e:
            print(f"Failed to load U-2-Net model: {e}")
            self.u2net_available = False
            self.bg_remover = None
    
    async def process_clothing_image(self, image_path: str) -> Dict[str, str]:
        """Process clothing image: background removal and thumbnail generation"""
        image_path = Path(image_path)
        
        if not image_path.exists():
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        # Open and process image
        with Image.open(image_path) as img:
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize if too large
            img.thumbnail(self.max_image_size, Image.Resampling.LANCZOS)
            
            # Save resized original
            resized_path = image_path.parent / f"resized_{image_path.name}"
            img.save(resized_path, quality=95)
            
            # Generate thumbnail
            thumbnail = img.copy()
            thumbnail.thumbnail(self.thumbnail_size, Image.Resampling.LANCZOS)
            thumbnail_path = image_path.parent / f"thumbnail_{image_path.name}"
            thumbnail.save(thumbnail_path, quality=85)
            
            # Remove background if model is available
            if self.u2net_available and hasattr(self, 'bg_remover') and self.bg_remover:
                processed_path = await self._remove_background(resized_path)
            else:
                # If no model, just use resized image
                processed_path = resized_path
        
        return {
            "processed_path": str(processed_path),
            "thumbnail_path": str(thumbnail_path),
            "original_path": str(image_path)
        }
    
    async def _remove_background(self, image_path: Path) -> Path:
        """Remove background using U-2-Net model"""
        try:
            if not self.bg_remover:
                return image_path
            
            # Load image
            img = Image.open(image_path).convert('RGB')
            
            # Remove background
            result_image, mask = self.bg_remover.remove_background(img)
            
            # Save processed image
            processed_path = image_path.parent / f"nobg_{image_path.name.replace('.jpg', '.png').replace('.jpeg', '.png')}"
            result_image.save(processed_path)
            
            return processed_path
            
        except Exception as e:
            print(f"Background removal failed: {e}")
            return image_path
    
    def extract_dominant_colors(self, image_path: str, n_colors: int = 5) -> list:
        """Extract dominant colors from image"""
        from sklearn.cluster import KMeans
        
        with Image.open(image_path) as img:
            # Resize for faster processing
            img.thumbnail((150, 150))
            img = img.convert('RGB')
            
            # Convert to numpy array
            pixels = np.array(img).reshape(-1, 3)
            
            # Use KMeans to find dominant colors
            kmeans = KMeans(n_clusters=n_colors, random_state=42)
            kmeans.fit(pixels)
            
            # Get colors as hex
            colors = []
            for color in kmeans.cluster_centers_:
                hex_color = '#{:02x}{:02x}{:02x}'.format(
                    int(color[0]), int(color[1]), int(color[2])
                )
                colors.append(hex_color)
            
            return colors
    
    def create_outfit_collage(self, item_paths: list, output_path: str) -> str:
        """Create a collage from multiple clothing items"""
        images = []
        for path in item_paths:
            with Image.open(path) as img:
                img.thumbnail((400, 400))
                images.append(img.copy())
        
        # Calculate collage size
        n_items = len(images)
        cols = min(3, n_items)
        rows = (n_items + cols - 1) // cols
        
        collage_width = cols * 400 + (cols - 1) * 20
        collage_height = rows * 400 + (rows - 1) * 20
        
        # Create collage
        collage = Image.new('RGBA', (collage_width, collage_height), (255, 255, 255, 0))
        
        for idx, img in enumerate(images):
            row = idx // cols
            col = idx % cols
            x = col * (400 + 20)
            y = row * (400 + 20)
            
            # Center image in its space
            x_offset = (400 - img.width) // 2
            y_offset = (400 - img.height) // 2
            
            collage.paste(img, (x + x_offset, y + y_offset))
        
        # Save collage
        collage.save(output_path, 'PNG')
        return output_path