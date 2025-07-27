from PIL import Image
import time


class SimpleVirtualTryOn:
    """Simple fallback virtual try-on processor for testing purposes."""
    
    def __init__(self):
        self.name = "Simple Virtual Try-On"
    
    def is_available(self) -> bool:
        """Always available as a fallback."""
        return True
    
    def generate_virtual_tryon(self, person_image_path: str, garment_image_path: str, output_path: str, **kwargs) -> dict:
        """Alias for process method to match the expected interface."""
        return self.process(person_image_path, garment_image_path, output_path, **kwargs)
    
    def process(self, person_image_path: str, garment_image_path: str, output_path: str, **kwargs) -> dict:
        """
        Simple overlay try-on with basic compositing.
        """
        start_time = time.time()
        
        try:
            # Open images
            person_image = Image.open(person_image_path).convert('RGBA')
            garment_image = Image.open(garment_image_path).convert('RGBA')
            
            # Resize garment to fit on person (simple heuristic)
            person_width, person_height = person_image.size
            garment_width, garment_height = garment_image.size
            
            # Target garment width as percentage of person width
            target_width = int(person_width * 0.4)
            target_height = int(garment_height * (target_width / garment_width))
            
            garment_resized = garment_image.resize((target_width, target_height), Image.Resampling.LANCZOS)
            
            # Create result image
            result = person_image.copy()
            
            # Position garment on upper body (simple placement)
            x_pos = (person_width - target_width) // 2
            y_pos = int(person_height * 0.2)  # Start at 20% from top
            
            # Paste garment with alpha blending
            result.paste(garment_resized, (x_pos, y_pos), garment_resized)
            
            # Convert back to RGB for JPEG
            result_rgb = Image.new('RGB', result.size, (255, 255, 255))
            result_rgb.paste(result, mask=result.split()[3] if len(result.split()) == 4 else None)
            
            # Save result
            result_rgb.save(output_path, quality=95)
            
            processing_time = time.time() - start_time
            
            return {
                "success": True,
                "output_path": output_path,
                "metadata": {
                    "processing_time": processing_time,
                    "model": "Simple Virtual Try-On (Quick Mode)",
                    "method": "Basic overlay compositing",
                    "garment_position": {"x": x_pos, "y": y_pos, "width": target_width, "height": target_height}
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "metadata": {"processing_time": time.time() - start_time}
            } 