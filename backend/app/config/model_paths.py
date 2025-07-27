import os
from pathlib import Path

# External drive model paths
EXTERNAL_DRIVE_PATH = Path("/Volumes/4TB-Z/AI-Models/virtual-closet")

# Model directories
MODEL_PATHS = {
    "idm_vton": {
        "base_path": EXTERNAL_DRIVE_PATH / "idm-vton",
        "model_weights": EXTERNAL_DRIVE_PATH / "idm-vton" / "model_weights",
        "unet": EXTERNAL_DRIVE_PATH / "idm-vton" / "model_weights" / "unet",
        "unet_encoder": EXTERNAL_DRIVE_PATH / "idm-vton" / "model_weights" / "unet_encoder",
        "vae": EXTERNAL_DRIVE_PATH / "idm-vton" / "model_weights" / "vae",
        "text_encoder": EXTERNAL_DRIVE_PATH / "idm-vton" / "model_weights" / "text_encoder",
        "text_encoder_2": EXTERNAL_DRIVE_PATH / "idm-vton" / "model_weights" / "text_encoder_2",
        "tokenizer": EXTERNAL_DRIVE_PATH / "idm-vton" / "model_weights" / "tokenizer",
        "tokenizer_2": EXTERNAL_DRIVE_PATH / "idm-vton" / "model_weights" / "tokenizer_2",
        "scheduler": EXTERNAL_DRIVE_PATH / "idm-vton" / "model_weights" / "scheduler",
        "image_encoder": EXTERNAL_DRIVE_PATH / "idm-vton" / "model_weights" / "image_encoder",
        "humanparsing": EXTERNAL_DRIVE_PATH / "idm-vton" / "model_weights" / "humanparsing",
        "openpose": EXTERNAL_DRIVE_PATH / "idm-vton" / "model_weights" / "openpose",
        "densepose_model": EXTERNAL_DRIVE_PATH / "idm-vton" / "model_weights" / "densepose"
    },
    "u2net": {
        "base_path": EXTERNAL_DRIVE_PATH / "u2net",
        "model": EXTERNAL_DRIVE_PATH / "u2net" / "u2net.pth",
        "model_portrait": EXTERNAL_DRIVE_PATH / "u2net" / "u2netp.pth",
        "model_human": EXTERNAL_DRIVE_PATH / "u2net" / "u2net_human_seg.pth"
    },
    "densepose": {
        "base_path": EXTERNAL_DRIVE_PATH / "densepose",
        "model": EXTERNAL_DRIVE_PATH / "densepose" / "densepose_rcnn_R_50_FPN_s1x.pkl",
        "config": EXTERNAL_DRIVE_PATH / "densepose" / "config.yaml"
    }
}

# Ensure directories exist
for model_name, paths in MODEL_PATHS.items():
    if "base_path" in paths:
        paths["base_path"].mkdir(parents=True, exist_ok=True)

def get_model_path(model_name: str, file_type: str) -> Path:
    """Get the path for a specific model file"""
    if model_name not in MODEL_PATHS:
        raise ValueError(f"Unknown model: {model_name}")
    
    if file_type not in MODEL_PATHS[model_name]:
        raise ValueError(f"Unknown file type: {file_type} for model: {model_name}")
    
    return MODEL_PATHS[model_name][file_type]

def verify_models() -> dict:
    """Verify that all models exist and return status"""
    status = {}
    
    # Check IDM-VTON components
    idm_vton_components = [
        "unet", "unet_encoder", "vae", "text_encoder", "text_encoder_2",
        "tokenizer", "tokenizer_2", "scheduler", "image_encoder", 
        "humanparsing", "openpose", "densepose_model"
    ]
    
    status["idm_vton"] = {}
    for component in idm_vton_components:
        path = MODEL_PATHS["idm_vton"][component]
        status["idm_vton"][component] = path.exists()
    
    # Check U2-Net models
    status["u2net"] = {}
    for key in ["model", "model_portrait", "model_human"]:
        path = MODEL_PATHS["u2net"][key]
        status["u2net"][key] = path.exists()
    
    # Check DensePose
    status["densepose"] = {}
    status["densepose"]["model"] = MODEL_PATHS["densepose"]["model"].exists()
    
    return status