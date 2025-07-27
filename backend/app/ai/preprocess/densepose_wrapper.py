"""
DensePose wrapper for IDM-VTON preprocessing
Matches the exact implementation used in the Gradio app
"""

import os
import sys
import numpy as np
from PIL import Image
import torch
import logging

# Add DensePose path to sys.path
DENSEPOSE_PATH = os.path.join(os.path.dirname(__file__), 'humanparsing/mhp_extension/detectron2/projects/DensePose')
sys.path.insert(0, DENSEPOSE_PATH)

try:
    import apply_net
    from detectron2.data.detection_utils import convert_PIL_to_numpy, _apply_exif_orientation
    DENSEPOSE_AVAILABLE = True
except ImportError:
    DENSEPOSE_AVAILABLE = False
    print("⚠️ DensePose not available. Install detectron2 and DensePose dependencies.")

logger = logging.getLogger(__name__)


class DensePoseProcessor:
    """Process human images to generate DensePose representations"""
    
    def __init__(self, device='cuda'):
        self.device = device if torch.cuda.is_available() else 'cpu'
        # Use external hard drive for model storage
        external_model_path = '/Volumes/4TB-Z/AI-Models/virtual-closet/densepose'
        self.config_path = os.path.join(external_model_path, 'densepose_rcnn_R_50_FPN_s1x.yaml')
        self.checkpoint_path = os.path.join(external_model_path, 'model_final_162be9.pkl')
        
        # Fallback to local path if external drive not available
        if not os.path.exists(external_model_path):
            self.config_path = os.path.join(DENSEPOSE_PATH, 'configs/densepose_rcnn_R_50_FPN_s1x.yaml')
            self.checkpoint_path = os.path.join(DENSEPOSE_PATH, 'ckpt/densepose/model_final_162be9.pkl')
        
        self.args = None
        
        if DENSEPOSE_AVAILABLE:
            self._setup_args()
    
    def _setup_args(self):
        """Setup DensePose arguments matching Gradio app"""
        try:
            # Create argument parser and parse args exactly like Gradio app
            parser = apply_net.create_argument_parser()
            args_list = [
                'show',
                self.config_path,
                self.checkpoint_path,
                'dp_segm',
                '-v',
                '--opts',
                'MODEL.DEVICE',
                self.device
            ]
            self.args = parser.parse_args(args_list)
            logger.info(f"✅ DensePose initialized with device: {self.device}")
        except Exception as e:
            logger.error(f"❌ Failed to setup DensePose args: {e}")
            self.args = None
    
    def is_available(self):
        """Check if DensePose is available and initialized"""
        return DENSEPOSE_AVAILABLE and self.args is not None
    
    def process_image(self, pil_image):
        """
        Process PIL image to generate DensePose representation
        
        Args:
            pil_image: PIL Image to process
            
        Returns:
            PIL Image: DensePose visualization
        """
        if not self.is_available():
            logger.warning("DensePose not available, returning original image")
            return pil_image
        
        try:
            # Convert PIL to numpy array with EXIF orientation handling
            human_img_arg = _apply_exif_orientation(convert_PIL_to_numpy(pil_image, format="RGB"))
            
            # Apply DensePose using the configured function
            pose_img = self.args.func(self.args, human_img_arg)
            
            # Convert back to PIL if needed
            if isinstance(pose_img, np.ndarray):
                pose_img = Image.fromarray(pose_img)
            
            logger.info("✅ DensePose processing successful")
            return pose_img
            
        except Exception as e:
            logger.error(f"❌ DensePose processing failed: {e}")
            return pil_image
    
    def __call__(self, pil_image):
        """Allow the processor to be called directly"""
        return self.process_image(pil_image)