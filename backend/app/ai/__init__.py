"""AI Module for Virtual Closet

Provides AI-powered functionality including:
- Virtual try-on using IDM-VTON
- Background removal
- Human pose detection with DensePose
- Human parsing and segmentation

All models are stored on external drive for efficient storage management.
"""

from .model_manager import ModelManager, model_manager
from .background_removal import U2NetBackgroundRemover
from .virtual_tryon import SimpleVirtualTryOn, GradioIDMVTONProcessor

__all__ = [
    'ModelManager',
    'model_manager',
    'U2NetBackgroundRemover', 
    'SimpleVirtualTryOn',
    'GradioIDMVTONProcessor'
]
