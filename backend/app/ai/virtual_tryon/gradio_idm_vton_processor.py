import time


class GradioIDMVTONProcessor:
    """Gradio-based IDM-VTON processor - placeholder for now."""
    
    def __init__(self):
        self.name = "Gradio IDM-VTON"
    
    def is_available(self) -> bool:
        """Not available in this implementation."""
        return False
    
    def process(self, person_image_path: str, garment_image_path: str, output_path: str, **kwargs) -> dict:
        """Placeholder implementation."""
        return {
            "success": False,
            "error": "Gradio IDM-VTON processor not implemented",
            "metadata": {"processing_time": 0}
        } 