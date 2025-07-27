#!/usr/bin/env python3
"""
Download DensePose model files for IDM-VTON
"""

import os
import requests
from tqdm import tqdm

def download_file(url, dest_path):
    """Download a file with progress bar"""
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    with open(dest_path, 'wb') as file:
        with tqdm(total=total_size, unit='B', unit_scale=True, desc=os.path.basename(dest_path)) as pbar:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
                pbar.update(len(chunk))

def main():
    # Use external hard drive for model storage
    external_model_path = '/Volumes/4TB-Z/AI-Models/virtual-closet/densepose'
    
    # Create directory on external drive
    os.makedirs(external_model_path, exist_ok=True)
    
    # Download configuration file
    config_url = "https://raw.githubusercontent.com/facebookresearch/detectron2/main/projects/DensePose/configs/densepose_rcnn_R_50_FPN_s1x.yaml"
    config_path = os.path.join(external_model_path, 'densepose_rcnn_R_50_FPN_s1x.yaml')
    
    if not os.path.exists(config_path):
        print("Downloading DensePose config...")
        download_file(config_url, config_path)
    else:
        print("✅ Config already exists")
    
    # Download model checkpoint
    model_url = "https://dl.fbaipublicfiles.com/densepose/densepose_rcnn_R_50_FPN_s1x/165712039/model_final_162be9.pkl"
    model_path = os.path.join(external_model_path, 'model_final_162be9.pkl')
    
    if not os.path.exists(model_path):
        print("Downloading DensePose model (this may take a while)...")
        download_file(model_url, model_path)
    else:
        print("✅ Model already exists")
    
    print("\n✅ DensePose files downloaded successfully!")
    print(f"Config: {config_path}")
    print(f"Model: {model_path}")

if __name__ == "__main__":
    main()