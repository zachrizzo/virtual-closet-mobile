"""
Enhanced pose estimation using OpenPose with body segmentation
This provides better pose estimation when DensePose is not available
"""

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import cv2
from app.ai.preprocess.openpose.run_openpose import OpenPose
from app.ai.preprocess.humanparsing.run_parsing import Parsing
import logging

logger = logging.getLogger(__name__)

class EnhancedPoseEstimator:
    """Enhanced pose estimation combining OpenPose and Human Parsing"""
    
    def __init__(self, device='cpu'):
        self.device = device
        self.openpose_model = OpenPose(0)
        self.parsing_model = Parsing(0)
        
    def create_pose_map(self, image, enhance=True):
        """
        Create a pose map suitable for virtual try-on
        
        Args:
            image: PIL Image
            enhance: Whether to enhance the pose map with segmentation
            
        Returns:
            PIL Image: Pose visualization
        """
        # Resize for processing
        img_resized = image.resize((384, 512))
        
        # Get pose keypoints
        try:
            pose_data = self.openpose_model(img_resized)
            has_pose = True
        except Exception as e:
            logger.warning(f"OpenPose failed: {e}")
            pose_data = None
            has_pose = False
        
        # Get human parsing
        try:
            parse_result, _ = self.parsing_model(img_resized)
            has_parsing = True
        except Exception as e:
            logger.warning(f"Human parsing failed: {e}")
            parse_result = None
            has_parsing = False
        
        # Create the pose map
        pose_map = np.zeros((512, 384, 3), dtype=np.uint8)
        
        if enhance and has_parsing and parse_result is not None:
            # Create segmentation-based pose map
            parse_array = np.array(parse_result)
            
            # Define body part colors (matching DensePose style)
            body_parts = {
                # Upper body
                5: (255, 0, 0),      # Upper clothes
                6: (0, 255, 0),      # Dress  
                7: (0, 0, 255),      # Coat
                10: (255, 255, 0),   # Jumpsuits
                
                # Arms
                14: (255, 128, 0),   # Left arm
                15: (0, 255, 128),   # Right arm
                
                # Head/neck
                1: (128, 128, 255),  # Head
                2: (255, 128, 128),  # Hair
                13: (128, 255, 128), # Face
                
                # Lower body (for context)
                9: (128, 0, 128),    # Pants
                12: (0, 128, 128),   # Skirt
                16: (64, 64, 64),    # Left leg
                17: (192, 192, 192), # Right leg
            }
            
            # Apply colors based on parsing
            for part_id, color in body_parts.items():
                mask = parse_array == part_id
                pose_map[mask] = color
            
            # Add pose skeleton on top if available
            if has_pose and pose_data:
                pose_map = self._draw_pose_skeleton(pose_map, pose_data)
        
        elif has_pose and pose_data:
            # Fallback to skeleton-only visualization
            pose_map = self._draw_pose_skeleton(pose_map, pose_data)
        
        else:
            # No pose data available - create a default pose
            # Draw a simple human silhouette
            h, w = pose_map.shape[:2]
            cv2.ellipse(pose_map, (w//2, h//4), (w//6, h//6), 0, 0, 360, (255, 255, 255), -1)  # Head
            cv2.rectangle(pose_map, (w//3, h//4), (2*w//3, 2*h//3), (128, 128, 255), -1)  # Body
            cv2.rectangle(pose_map, (w//4, h//3), (w//3, 2*h//3), (255, 128, 0), -1)  # Left arm
            cv2.rectangle(pose_map, (2*w//3, h//3), (3*w//4, 2*h//3), (0, 255, 128), -1)  # Right arm
        
        # Convert to PIL and resize to target size
        pose_img = Image.fromarray(pose_map)
        pose_img = pose_img.resize((768, 1024), Image.Resampling.LANCZOS)
        
        # Apply smoothing to make it more DensePose-like
        if enhance:
            pose_img = pose_img.filter(ImageFilter.GaussianBlur(radius=2))
        
        return pose_img
    
    def _draw_pose_skeleton(self, image, pose_data):
        """Draw OpenPose skeleton on image"""
        img = image.copy()
        
        # Define skeleton connections (COCO format)
        skeleton = [
            [16, 14], [14, 12], [17, 15], [15, 13], [12, 13],
            [6, 12], [7, 13], [6, 7], [6, 8], [7, 9],
            [8, 10], [9, 11], [2, 3], [1, 2], [1, 3],
            [2, 4], [3, 5], [4, 6], [5, 7]
        ]
        
        # Get keypoints
        if 'pose_keypoints_2d' in pose_data:
            keypoints = pose_data['pose_keypoints_2d']
        elif 'bodies' in pose_data and 'candidate' in pose_data['bodies']:
            keypoints = pose_data['bodies']['candidate']
        else:
            return img
        
        # Draw skeleton
        h, w = img.shape[:2]
        for connection in skeleton:
            try:
                if connection[0]-1 < len(keypoints) and connection[1]-1 < len(keypoints):
                    pt1 = keypoints[connection[0]-1]
                    pt2 = keypoints[connection[1]-1]
                    if len(pt1) >= 2 and len(pt2) >= 2 and pt1[0] > 0 and pt1[1] > 0 and pt2[0] > 0 and pt2[1] > 0:
                        x1, y1 = int(pt1[0] * w / 384), int(pt1[1] * h / 512)
                        x2, y2 = int(pt2[0] * w / 384), int(pt2[1] * h / 512)
                        cv2.line(img, (x1, y1), (x2, y2), (255, 255, 255), 3)
            except:
                continue
        
        # Draw keypoints
        for i, point in enumerate(keypoints[:18]):
            if len(point) >= 2 and point[0] > 0 and point[1] > 0:
                x, y = int(point[0] * w / 384), int(point[1] * h / 512)
                cv2.circle(img, (x, y), 5, (0, 255, 0), -1)
                cv2.circle(img, (x, y), 7, (255, 255, 255), 2)
        
        return img
    
    def process_image(self, pil_image):
        """Process image to generate pose representation"""
        return self.create_pose_map(pil_image, enhance=True)