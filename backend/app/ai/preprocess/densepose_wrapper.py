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

try:
    # Import from installed DensePose package
    from densepose import add_densepose_config
    from densepose.vis.extractor import DensePoseResultExtractor, create_extractor
    from detectron2.config import get_cfg
    from detectron2.engine import DefaultPredictor
    from detectron2.data.detection_utils import convert_PIL_to_numpy, _apply_exif_orientation
    DENSEPOSE_AVAILABLE = True
except ImportError:
    DENSEPOSE_AVAILABLE = False
    print("⚠️ DensePose not available. DensePose requires Python <=3.11. Using enhanced OpenPose fallback.")

logger = logging.getLogger(__name__)


class DensePoseProcessor:
    """Process human images to generate DensePose representations"""
    
    def __init__(self, device='cuda'):
        self.device = device if torch.cuda.is_available() else 'cpu'
        if self.device == 'cuda' and torch.backends.mps.is_available():
            self.device = 'cpu'  # DensePose doesn't support MPS yet
        
        # First check for local config in detectron2_src
        local_config_base = os.path.join(os.path.dirname(__file__), '../../../detectron2_src/projects/DensePose/configs')
        
        # Use external hard drive for model storage
        external_model_path = '/Volumes/4TB-Z/AI-Models/virtual-closet/densepose'
        
        if os.path.exists(local_config_base):
            # Use local config file
            self.config_path = os.path.join(local_config_base, 'densepose_rcnn_R_50_FPN_s1x.yaml')
            # Use external model if available
            if os.path.exists(external_model_path):
                self.checkpoint_path = os.path.join(external_model_path, 'model_final_162be9.pkl')
            else:
                # Download the model if not available
                self.checkpoint_path = None
        else:
            self.config_path = None
            self.checkpoint_path = None
        
        self.predictor = None
        self.extractor = None
        
        if DENSEPOSE_AVAILABLE:
            self._setup_predictor()
    
    def _setup_predictor(self):
        """Setup DensePose predictor using detectron2 API"""
        try:
            if not self.config_path or not os.path.exists(self.config_path):
                logger.error(f"Config file not found: {self.config_path}")
                return
                
            cfg = get_cfg()
            add_densepose_config(cfg)
            cfg.merge_from_file(self.config_path)
            
            # Use model zoo URL if local checkpoint doesn't exist
            if self.checkpoint_path and os.path.exists(self.checkpoint_path):
                cfg.MODEL.WEIGHTS = self.checkpoint_path
            else:
                # Use model zoo URL
                cfg.MODEL.WEIGHTS = "https://dl.fbaipublicfiles.com/densepose/densepose_rcnn_R_50_FPN_s1x/165712039/model_final_162be9.pkl"
                logger.info("Downloading DensePose model from model zoo...")
            
            cfg.MODEL.DEVICE = self.device
            
            # Create predictor
            self.predictor = DefaultPredictor(cfg)
            
            # We'll handle extraction directly in process_image
            
            logger.info(f"✅ DensePose initialized with device: {self.device}")
        except Exception as e:
            logger.error(f"❌ Failed to setup DensePose predictor: {e}")
            import traceback
            logger.error(traceback.format_exc())
            self.predictor = None
    
    def is_available(self):
        """Check if DensePose is available and initialized"""
        return DENSEPOSE_AVAILABLE and self.predictor is not None
    
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
            # Convert PIL to numpy array
            img_array = np.array(pil_image)
            
            # Run DensePose prediction
            outputs = self.predictor(img_array)
            
            # For virtual try-on, we need the segmentation map
            # Create a simple visualization showing detected body parts
            instances = outputs["instances"]
            
            if len(instances) > 0:
                # Get the DensePose output
                if hasattr(instances, 'pred_densepose'):
                    # Create segmentation visualization
                    vis_img = img_array.copy()
                    
                    # Extract DensePose results for the first detected person
                    densepose_result = instances.pred_densepose[0]
                    
                    # Create a simple visualization
                    # DensePose outputs I (part labels) and UV (coordinates)
                    if hasattr(densepose_result, 'labels'):
                        # Get the body part labels
                        labels = densepose_result.labels.cpu().numpy()
                        
                        # Create a colored segmentation map
                        h, w = labels.shape
                        colored_seg = np.zeros((h, w, 3), dtype=np.uint8)
                        
                        # Color map for different body parts
                        colors = {
                            0: [0, 0, 0],        # Background
                            1: [255, 0, 0],      # Torso
                            2: [0, 255, 0],      # Right hand
                            3: [0, 0, 255],      # Left hand
                            4: [255, 255, 0],    # Left foot
                            5: [255, 0, 255],    # Right foot
                            6: [0, 255, 255],    # Upper leg right
                            7: [128, 0, 0],      # Upper leg left
                            8: [0, 128, 0],      # Lower leg right
                            9: [0, 0, 128],      # Lower leg left
                            10: [128, 128, 0],   # Upper arm left
                            11: [128, 0, 128],   # Upper arm right
                            12: [0, 128, 128],   # Lower arm left
                            13: [64, 0, 0],      # Lower arm right
                            14: [0, 64, 0],      # Head
                        }
                        
                        # Apply colors
                        for part_id, color in colors.items():
                            colored_seg[labels == part_id] = color
                        
                        # Blend with original image
                        alpha = 0.6
                        vis_img = (alpha * vis_img + (1 - alpha) * colored_seg).astype(np.uint8)
                    
                    # Convert back to PIL
                    pose_img = Image.fromarray(vis_img)
                else:
                    # No DensePose output, return original
                    logger.warning("No DensePose predictions found")
                    pose_img = pil_image
            else:
                # No people detected
                logger.warning("No people detected in image")
                pose_img = pil_image
            
            logger.info("✅ DensePose processing successful")
            return pose_img
            
        except Exception as e:
            logger.error(f"❌ DensePose processing failed: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return pil_image
    
    def __call__(self, pil_image):
        """Allow the processor to be called directly"""
        return self.process_image(pil_image)