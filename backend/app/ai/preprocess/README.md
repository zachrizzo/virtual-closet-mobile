# AI Preprocessing Modules

This directory contains preprocessing modules for the Virtual Closet AI pipeline.

## Directory Structure

### Core Modules
- `densepose_wrapper.py` - **PRIMARY** - DensePose human pose detection wrapper
- `download_densepose.py` - Script to download DensePose models to external drive

### Human Parsing (`humanparsing/`)
This module contains the Self-Correction for Human Parsing (SCHP) implementation.

**Main Components:**
- `run_parsing.py` - **PRIMARY** - Main interface for human parsing
- `parsing_api.py` - API wrapper for parsing functionality
- `networks/` - Neural network architectures
- `utils/` - Utility functions for parsing

**Note:** Most subdirectories contain research/experimental code from the original SCHP repository and are not actively used in production.

### OpenPose (`openpose/`)
Human pose estimation using OpenPose.

**Main Components:**
- `run_openpose.py` - **PRIMARY** - Main OpenPose interface
- `annotator/openpose/` - Core OpenPose implementation

## Model Storage

All models are stored on external drive at `/Volumes/4TB-Z/AI-Models/virtual-closet/`:
- DensePose models: `densepose/`
- Human parsing models: `humanparsing/`
- OpenPose models: `openpose/`

## Usage

### DensePose
```python
from app.ai.preprocess.densepose_wrapper import DensePoseProcessor

processor = DensePoseProcessor(device='cuda')
densepose_result = processor.process_image(image_path)
```

### Human Parsing
```python
from app.ai.preprocess.humanparsing.run_parsing import Parsing

parser = Parsing(device=0)  # GPU device ID
parsing_result = parser.process(image_path, output_path)
```

### OpenPose
```python
from app.ai.preprocess.openpose.run_openpose import OpenPose

openpose = OpenPose(device=0)
pose_result = openpose.process(image_path)
```

## Notes

- The `humanparsing/mhp_extension/` directory contains extensive research code from the original SCHP repository
- Most of this code is not used in the current Virtual Closet implementation
- For production use, focus on the main wrapper files listed above
- All models automatically fall back to local storage if external drive is unavailable 