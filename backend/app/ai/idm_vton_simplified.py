"""
Simplified IDM-VTON Implementation
Core IDM-VTON without DensePose dependency for immediate testing
"""

import sys
import os
sys.path.append('/Users/zachrizzo/Desktop/programming/virtual-closet/virtual-closet-backend/app/ai/')
sys.path.append('/Users/zachrizzo/Desktop/programming/virtual-closet/virtual-closet-backend/app/ai/idm_vton_custom/')

from PIL import Image
from app.ai.idm_vton_custom.tryon_pipeline import StableDiffusionXLInpaintPipeline as TryonPipeline
from app.ai.idm_vton_custom.unet_hacked_garmnet import UNet2DConditionModel as UNet2DConditionModel_ref
from app.ai.idm_vton_custom.unet_hacked_tryon import UNet2DConditionModel
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
            
            # Load custom UNets
            unet = UNet2DConditionModel.from_pretrained(
                self.model_path,
                subfolder="unet",
                torch_dtype=self.dtype,
            )
            unet.requires_grad_(False)
            
            unet_encoder = UNet2DConditionModel_ref.from_pretrained(
                self.model_path,
                subfolder="unet_encoder", 
                torch_dtype=self.dtype,
            )
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
            
            # Move pipeline to device
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
        
        # Move models to device
        self.openpose_model.preprocessor.body_estimation.model.to(self.device)
        self.pipe.to(self.device)
        self.pipe.unet_encoder.to(self.device)
        
        # Resize inputs
        garm_img = garment_image.convert("RGB").resize((768, 1024))
        human_img_orig = person_image.convert("RGB")
        
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
            human_img = cropped_img.resize((768, 1024))
        else:
            human_img = human_img_orig.resize((768, 1024))
        
        # Generate or process mask
        if auto_mask:
            keypoints = self.openpose_model(human_img.resize((384, 512)))
            model_parse, _ = self.parsing_model(human_img.resize((384, 512)))
            mask, mask_gray = get_mask_location('hd', "upper_body", model_parse, keypoints)
            mask = mask.resize((768, 1024))
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
            logger.warning("DensePose not available, using human image as fallback")
            pose_img = human_img.resize((768, 1024))
        
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
                images = self.pipe(
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
                )[0]
        
        # Handle cropping output
        if auto_crop:
            out_img = images[0].resize(crop_size)
            human_img_orig.paste(out_img, (int(left), int(top)))
            return human_img_orig, mask_gray
        else:
            return images[0], mask_gray