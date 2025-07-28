"""
Simplified IDM-VTON Implementation
Core IDM-VTON without DensePose dependency for immediate testing
"""

from pathlib import Path

from PIL import Image, ImageDraw
from app.ai.idm_vton_custom.tryon_pipeline import StableDiffusionXLInpaintPipeline as TryonPipeline
from transformers import (
    CLIPImageProcessor,
    CLIPVisionModelWithProjection,
    CLIPTextModel,
    CLIPTextModelWithProjection,
    AutoTokenizer,
)
from diffusers import DDPMScheduler, AutoencoderKL
from typing import List
import torch
import numpy as np
from app.ai.utils_mask import get_mask_location
from torchvision import transforms
from app.ai.preprocess.humanparsing.run_parsing import Parsing
from app.ai.preprocess.openpose.run_openpose import OpenPose
from app.ai.preprocess.densepose_wrapper import DensePoseProcessor
from torchvision.transforms.functional import to_pil_image
from app.config.model_paths import get_model_path
import logging

logger = logging.getLogger(__name__)

class IDMVTONSimplified:
    """IDM-VTON implementation with DensePose support (matching Gradio app)"""
    
    def __init__(self, model_path: str = None, device: str = "mps"):
        self.device = device if torch.backends.mps.is_available() else "cpu"
        # Use external drive model path if not provided
        if model_path is None:
            try:
                self.model_path = str(get_model_path("idm_vton", "base_path"))
            except (ValueError, KeyError):
                # Fallback to parameter if external path not available
                raise ValueError("Model path must be provided when external drive is not available")
        else:
            self.model_path = model_path
        self.pipe = None
        self.parsing_model = None
        self.openpose_model = None
        self.densepose_processor = None
        # Use float32 for MPS compatibility
        self.dtype = torch.float32 if self.device == "mps" else torch.float16
        self.tensor_transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize([0.5], [0.5]),
        ])
        
    def load_models(self):
        """Load all required models including DensePose"""
        try:
            logger.info("Loading IDM-VTON models with DensePose support...")
            
            # Load custom UNet with config modifications
            import json
            unet_config_path = Path(self.model_path) / "unet" / "config.json"
            with open(unet_config_path, 'r') as f:
                unet_config = json.load(f)
            
            # Don't remove encoder_hid_dim_type, just load as is
            from app.ai.idm_vton_custom.unet_hacked_tryon import UNet2DConditionModel as CustomUNet
            unet = CustomUNet.from_config(unet_config)
            
            # Load the state dict
            unet_path = Path(self.model_path) / "unet" / "diffusion_pytorch_model.bin"
            if not unet_path.exists():
                unet_path = Path(self.model_path) / "unet" / "diffusion_pytorch_model.safetensors"
                from safetensors import safe_open
                with safe_open(unet_path, framework="pt", device="cpu") as f:
                    unet_state_dict = {k: f.get_tensor(k) for k in f.keys()}
            else:
                unet_state_dict = torch.load(unet_path, map_location='cpu')
            unet.load_state_dict(unet_state_dict, strict=False)
            unet = unet.to(dtype=self.dtype)
            unet.requires_grad_(False)
            
            # Load encoder UNet
            unet_encoder_config_path = Path(self.model_path) / "unet_encoder" / "config.json"
            with open(unet_encoder_config_path, 'r') as f:
                unet_encoder_config = json.load(f)
            
            from app.ai.idm_vton_custom.unet_hacked_garmnet import UNet2DConditionModel as EncoderUNet
            unet_encoder = EncoderUNet.from_config(unet_encoder_config)
            
            unet_encoder_path = Path(self.model_path) / "unet_encoder" / "diffusion_pytorch_model.bin"
            if not unet_encoder_path.exists():
                unet_encoder_path = Path(self.model_path) / "unet_encoder" / "diffusion_pytorch_model.safetensors"
                from safetensors import safe_open
                with safe_open(unet_encoder_path, framework="pt", device="cpu") as f:
                    unet_encoder_state_dict = {k: f.get_tensor(k) for k in f.keys()}
            else:
                unet_encoder_state_dict = torch.load(unet_encoder_path, map_location='cpu')
            unet_encoder.load_state_dict(unet_encoder_state_dict, strict=False)
            unet_encoder = unet_encoder.to(dtype=self.dtype)
            unet_encoder.requires_grad_(False)
            
            # Load tokenizers
            tokenizer_one = AutoTokenizer.from_pretrained(
                self.model_path,
                subfolder="tokenizer",
                revision=None,
                use_fast=False,
            )
            tokenizer_two = AutoTokenizer.from_pretrained(
                self.model_path,
                subfolder="tokenizer_2",
                revision=None,
                use_fast=False,
            )
            
            # Load scheduler
            noise_scheduler = DDPMScheduler.from_pretrained(
                self.model_path, 
                subfolder="scheduler"
            )
            
            # Load text encoders
            text_encoder_one = CLIPTextModel.from_pretrained(
                self.model_path,
                subfolder="text_encoder",
                torch_dtype=self.dtype,
            )
            text_encoder_two = CLIPTextModelWithProjection.from_pretrained(
                self.model_path,
                subfolder="text_encoder_2", 
                torch_dtype=self.dtype,
            )
            
            # Load image encoder
            image_encoder = CLIPVisionModelWithProjection.from_pretrained(
                self.model_path,
                subfolder="image_encoder",
                torch_dtype=self.dtype,
            )
            
            # Load VAE
            vae = AutoencoderKL.from_pretrained(
                self.model_path,
                subfolder="vae",
                torch_dtype=self.dtype,
            )
            
            # Set requires_grad to False
            image_encoder.requires_grad_(False)
            vae.requires_grad_(False)
            text_encoder_one.requires_grad_(False)
            text_encoder_two.requires_grad_(False)
            
            # Create the custom pipeline
            self.pipe = TryonPipeline.from_pretrained(
                self.model_path,
                unet=unet,
                vae=vae,
                feature_extractor=CLIPImageProcessor(),
                text_encoder=text_encoder_one,
                text_encoder_2=text_encoder_two,
                tokenizer=tokenizer_one,
                tokenizer_2=tokenizer_two,
                scheduler=noise_scheduler,
                image_encoder=image_encoder,
                torch_dtype=self.dtype,
            )
            
            # Attach the encoder UNet (crucial for IDM-VTON)
            self.pipe.unet_encoder = unet_encoder
            
            # Move pipeline to device (handle MPS properly)
            if self.device == "mps":
                # For MPS, move components individually
                self.pipe.vae = self.pipe.vae.to(self.device)
                self.pipe.text_encoder = self.pipe.text_encoder.to(self.device)
                self.pipe.text_encoder_2 = self.pipe.text_encoder_2.to(self.device)
                self.pipe.unet = self.pipe.unet.to(self.device)
                self.pipe.image_encoder = self.pipe.image_encoder.to(self.device)
            else:
                self.pipe.to(self.device)
            
            # Load preprocessing models  
            self.parsing_model = Parsing(0)
            self.openpose_model = OpenPose(0)
            
            # Initialize DensePose processor
            self.densepose_processor = DensePoseProcessor(device=self.device)
            if self.densepose_processor.is_available():
                logger.info("✅ DensePose processor initialized successfully")
            else:
                logger.warning("⚠️ DensePose not available, will use fallback")
            
            logger.info(f"✅ IDM-VTON models loaded successfully on {self.device}!")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load IDM-VTON models: {e}")
            return False
    
    def _create_pose_visualization(self, human_img, keypoints):
        """Create a pose visualization from OpenPose keypoints"""
        import cv2
        import numpy as np
        
        # Create a blank canvas
        h, w = 1024, 768
        pose_img = np.zeros((h, w, 3), dtype=np.uint8)
        
        # Define skeleton connections (COCO format)
        skeleton = [
            [16, 14], [14, 12], [17, 15], [15, 13], [12, 13],
            [6, 12], [7, 13], [6, 7], [6, 8], [7, 9],
            [8, 10], [9, 11], [2, 3], [1, 2], [1, 3],
            [2, 4], [3, 5], [4, 6], [5, 7]
        ]
        
        # Get keypoints
        points = keypoints.get("pose_keypoints_2d", [])
        if len(points) >= 18:
            # Draw skeleton
            for connection in skeleton:
                if connection[0]-1 < len(points) and connection[1]-1 < len(points):
                    pt1 = points[connection[0]-1]
                    pt2 = points[connection[1]-1]
                    if pt1[0] > 0 and pt1[1] > 0 and pt2[0] > 0 and pt2[1] > 0:
                        # Scale to image size
                        x1, y1 = int(pt1[0] * w / 384), int(pt1[1] * h / 512)
                        x2, y2 = int(pt2[0] * w / 384), int(pt2[1] * h / 512)
                        cv2.line(pose_img, (x1, y1), (x2, y2), (255, 255, 255), 3)
            
            # Draw keypoints
            for i, point in enumerate(points[:18]):
                if point[0] > 0 and point[1] > 0:
                    x, y = int(point[0] * w / 384), int(point[1] * h / 512)
                    cv2.circle(pose_img, (x, y), 5, (0, 255, 0), -1)
        
        # Convert to PIL and resize
        pose_pil = Image.fromarray(pose_img)
        return pose_pil.resize((768, 1024))
    
    def pil_to_binary_mask(self, pil_image, threshold=0):
        """Convert PIL image to binary mask"""
        np_image = np.array(pil_image)
        grayscale_image = Image.fromarray(np_image).convert("L")
        binary_mask = np.array(grayscale_image) > threshold
        mask = np.zeros(binary_mask.shape, dtype=np.uint8)
        for i in range(binary_mask.shape[0]):
            for j in range(binary_mask.shape[1]):
                if binary_mask[i, j] == True:
                    mask[i, j] = 1
        mask = (mask * 255).astype(np.uint8)
        output_mask = Image.fromarray(mask)
        return output_mask
    
    def generate_virtual_tryon(
        self,
        person_image: Image.Image,
        garment_image: Image.Image,
        garment_description: str,
        mask_image: Image.Image = None,
        auto_mask: bool = True,
        auto_crop: bool = False,
        denoise_steps: int = 30,
        seed: int = 42
    ) -> tuple[Image.Image, Image.Image]:
        """
        Generate virtual try-on (simplified - without DensePose)
        
        Returns:
            tuple: (result_image, mask_gray_image)
        """
        if not self.pipe:
            raise RuntimeError("Models not loaded. Call load_models() first.")
        
        # Move models to device (ensure all components are on the correct device)
        try:
            self.openpose_model.preprocessor.body_estimation.model.to(self.device)
        except:
            # OpenPose might not support MPS
            pass
        
        # Ensure pipeline components are on device
        if self.device == "mps":
            # Already moved in load_models
            pass
        else:
            self.pipe.to(self.device)
        
        # Move encoder UNet
        self.pipe.unet_encoder = self.pipe.unet_encoder.to(self.device)
        
        # Resize inputs with aspect ratio preservation
        def resize_preserve_aspect(img, target_size=(768, 1024)):
            """Resize image preserving aspect ratio and pad to target size"""
            target_w, target_h = target_size
            
            # Calculate scaling factor to fit within target size
            scale = min(target_w / img.width, target_h / img.height)
            new_w = int(img.width * scale)
            new_h = int(img.height * scale)
            
            # Resize with aspect ratio preserved
            resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            # Create new image with target size and paste resized image centered
            result = Image.new('RGB', target_size, color='white')
            paste_x = (target_w - new_w) // 2
            paste_y = (target_h - new_h) // 2
            result.paste(resized, (paste_x, paste_y))
            
            return result, (new_w, new_h), (paste_x, paste_y)
        
        garm_img, _, _ = resize_preserve_aspect(garment_image.convert("RGB"))
        human_img_orig = person_image.convert("RGB")
        
        # Store original size and processing info
        original_size = human_img_orig.size
        
        # Handle cropping
        if auto_crop:
            width, height = human_img_orig.size
            target_width = int(min(width, height * (3 / 4)))
            target_height = int(min(height, width * (4 / 3)))
            left = (width - target_width) / 2
            top = (height - target_height) / 2
            right = (width + target_width) / 2
            bottom = (height + target_height) / 2
            cropped_img = human_img_orig.crop((left, top, right, bottom))
            crop_size = cropped_img.size
            human_img, resize_info, paste_info = resize_preserve_aspect(cropped_img)
        else:
            human_img, resize_info, paste_info = resize_preserve_aspect(human_img_orig)
        
        # Generate or process mask
        if auto_mask:
            try:
                keypoints = self.openpose_model(human_img.resize((384, 512)))
                model_parse, _ = self.parsing_model(human_img.resize((384, 512)))
                mask, mask_gray = get_mask_location('hd', "upper_body", model_parse, keypoints)
                mask = mask.resize((768, 1024))
            except Exception as e:
                logger.warning(f"Auto mask generation failed: {e}, using default mask")
                # Create default upper body mask
                mask = Image.new('L', (768, 1024), 0)
                draw = ImageDraw.Draw(mask)
                # Draw a simple upper body mask
                draw.rectangle([200, 100, 568, 600], fill=255)
        else:
            if mask_image:
                mask = self.pil_to_binary_mask(mask_image.convert("RGB").resize((768, 1024)))
            else:
                # Create default mask
                mask = Image.new('L', (768, 1024), 255)
        
        # Process mask gray
        mask_gray = (1 - transforms.ToTensor()(mask)) * self.tensor_transform(human_img)
        mask_gray = to_pil_image((mask_gray + 1.0) / 2.0)
        
        # Generate DensePose image (matching Gradio app)
        if self.densepose_processor and self.densepose_processor.is_available():
            logger.info("Using DensePose for pose estimation")
            pose_img = self.densepose_processor.process_image(human_img)
            pose_img = pose_img.resize((768, 1024))
        else:
            # For IDM-VTON, we need proper pose estimation, not fallbacks
            logger.error("DensePose not available - this will significantly impact quality")
            # Use the human image but note this is not ideal
            pose_img = human_img.resize((768, 1024))
            # TODO: Install detectron2 and DensePose for better results
        
        # Generate virtual try-on
        with torch.no_grad():
            with torch.inference_mode():
                # Encode prompts for human
                prompt = f"model is wearing {garment_description}"
                negative_prompt = "monochrome, lowres, bad anatomy, worst quality, low quality"
                
                (
                    prompt_embeds,
                    negative_prompt_embeds,
                    pooled_prompt_embeds,
                    negative_pooled_prompt_embeds,
                ) = self.pipe.encode_prompt(
                    prompt,
                    num_images_per_prompt=1,
                    do_classifier_free_guidance=True,
                    negative_prompt=negative_prompt,
                )
                
                # Encode prompts for garment
                prompt_cloth = f"a photo of {garment_description}"
                negative_prompt_cloth = "monochrome, lowres, bad anatomy, worst quality, low quality"
                
                if not isinstance(prompt_cloth, List):
                    prompt_cloth = [prompt_cloth] * 1
                if not isinstance(negative_prompt_cloth, List):
                    negative_prompt_cloth = [negative_prompt_cloth] * 1
                    
                (
                    prompt_embeds_c,
                    _,
                    _,
                    _,
                ) = self.pipe.encode_prompt(
                    prompt_cloth,
                    num_images_per_prompt=1,
                    do_classifier_free_guidance=False,
                    negative_prompt=negative_prompt_cloth,
                )
                
                # Prepare tensors
                pose_img_tensor = self.tensor_transform(pose_img).unsqueeze(0).to(self.device, self.dtype)
                garm_tensor = self.tensor_transform(garm_img).unsqueeze(0).to(self.device, self.dtype)
                generator = torch.Generator(self.device).manual_seed(seed) if seed is not None else None
                
                # Generate!
                result = self.pipe(
                    prompt_embeds=prompt_embeds.to(self.device, self.dtype),
                    negative_prompt_embeds=negative_prompt_embeds.to(self.device, self.dtype),
                    pooled_prompt_embeds=pooled_prompt_embeds.to(self.device, self.dtype),
                    negative_pooled_prompt_embeds=negative_pooled_prompt_embeds.to(self.device, self.dtype),
                    num_inference_steps=denoise_steps,
                    generator=generator,
                    strength=1.0,
                    pose_img=pose_img_tensor.to(self.device, self.dtype),
                    text_embeds_cloth=prompt_embeds_c.to(self.device, self.dtype),
                    cloth=garm_tensor.to(self.device, self.dtype),
                    mask_image=mask,
                    image=human_img,
                    height=1024,
                    width=768,
                    ip_adapter_image=garm_img.resize((768, 1024)),
                    guidance_scale=2.0,
                )
                
                # Extract images from result
                if hasattr(result, 'images'):
                    images = result.images
                elif isinstance(result, tuple):
                    # Pipeline returns (image,) as a single-element tuple
                    images = result
                elif isinstance(result, list):
                    images = result
                else:
                    # Single image result
                    images = [result]
        
        # Handle cropping output
        # Extract the actual image from potentially nested lists/tuples
        if isinstance(images, (list, tuple)):
            out_img = images[0]
            # Handle nested lists/tuples
            while isinstance(out_img, (list, tuple)) and len(out_img) > 0:
                out_img = out_img[0]
        else:
            out_img = images
            
        # Ensure we have a PIL Image
        if not isinstance(out_img, Image.Image):
            raise ValueError(f"Expected PIL Image, got {type(out_img)}")
            
        if auto_crop:
            # Extract the region and resize to original crop size
            extracted = out_img.crop((paste_info[0], paste_info[1], 
                                     paste_info[0] + resize_info[0], 
                                     paste_info[1] + resize_info[1]))
            out_img = extracted.resize(crop_size, Image.Resampling.LANCZOS)
            human_img_orig.paste(out_img, (int(left), int(top)))
            return human_img_orig, mask_gray
        else:
            # Extract the actual content region and resize to original size
            extracted = out_img.crop((paste_info[0], paste_info[1], 
                                     paste_info[0] + resize_info[0], 
                                     paste_info[1] + resize_info[1]))
            final_img = extracted.resize(original_size, Image.Resampling.LANCZOS)
            return final_img, mask_gray