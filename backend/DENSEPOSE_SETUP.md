# DensePose Setup for IDM-VTON

## Overview
To match the Gradio app's image quality, we've implemented DensePose preprocessing exactly as used in the official IDM-VTON Gradio app.

## Setup Instructions

### 1. Install Dependencies
```bash
# Install detectron2 (required for DensePose)
pip install detectron2 -f https://dl.fbaipublicfiles.com/detectron2/wheels/cpu/torch2.0/index.html

# Install other dependencies
pip install opencv-python-headless
```

### 2. Download DensePose Model Files
Run the download script to get the required model files:
```bash
cd /Users/zachrizzo/Desktop/programming/virtual-closet/virtual-closet-backend
python app/ai/preprocess/download_densepose.py
```

This will download:
- Configuration: `densepose_rcnn_R_50_FPN_s1x.yaml`
- Model weights: `model_final_162be9.pkl` (~250MB)

### 3. Update Model Paths for External Drive
Since models should be on your external hard drive, update the paths in:

1. `app/ai/preprocess/densepose_wrapper.py`:
   - Update `self.config_path` to point to external drive
   - Update `self.checkpoint_path` to point to external drive

2. Move the downloaded files to your external drive:
```bash
# Example paths (adjust to your setup)
mv app/ai/preprocess/humanparsing/mhp_extension/detectron2/projects/DensePose/configs/densepose_rcnn_R_50_FPN_s1x.yaml /Volumes/4TB-Z/AI-Models/virtual-closet/densepose/
mv app/ai/preprocess/humanparsing/mhp_extension/detectron2/projects/DensePose/ckpt/densepose/model_final_162be9.pkl /Volumes/4TB-Z/AI-Models/virtual-closet/densepose/
```

## Implementation Details

### What Changed:
1. **DensePose Wrapper** (`densepose_wrapper.py`):
   - Matches exact Gradio app configuration
   - Uses same model: `densepose_rcnn_R_50_FPN_s1x`
   - Same parameters: `dp_segm` mode, verbose output

2. **Updated IDMVTONSimplified**:
   - Now includes DensePose preprocessing
   - Falls back gracefully if DensePose unavailable
   - Logs DensePose usage

3. **New IDMVTONOfficial**:
   - Exact match of Gradio app implementation
   - Requires DensePose (no fallback)
   - Use this for production quality

### Processing Flow (Matching Gradio):
1. Resize human image to 768x1024
2. Generate keypoints with OpenPose (384x512)
3. Generate parsing mask with Human Parsing (384x512)
4. Generate DensePose representation
5. Create mask using `get_mask_location()`
6. Run diffusion model with all inputs

## Testing

### Quick Test:
```python
from app.ai.preprocess.densepose_wrapper import DensePoseProcessor
from PIL import Image

# Test DensePose
processor = DensePoseProcessor(device='cuda')
if processor.is_available():
    test_img = Image.open('path/to/person.jpg')
    pose_img = processor.process_image(test_img)
    pose_img.save('densepose_output.png')
    print("✅ DensePose working!")
else:
    print("❌ DensePose not available")
```

### Full Pipeline Test:
The AI service will automatically use the official implementation if DensePose is available.

## Troubleshooting

### DensePose Not Available:
- Check detectron2 installation
- Verify model files exist
- Check CUDA availability (CPU fallback is slower)

### Out of Memory:
- DensePose uses significant GPU memory
- Try reducing batch size or use CPU mode

### Model Path Issues:
- Ensure paths in `densepose_wrapper.py` match your external drive setup
- Check file permissions