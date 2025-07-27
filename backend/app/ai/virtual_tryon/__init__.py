"""Virtual Try-On Module

Provides access to different virtual try-on implementations.
"""

from .simple_tryon import SimpleVirtualTryOn
from .gradio_idm_vton_processor import GradioIDMVTONProcessor

__all__ = ['SimpleVirtualTryOn', 'GradioIDMVTONProcessor']
