# DensePose Configuration Files

This directory contains configuration files for DensePose models. Most of these are legacy configurations that were copied from the original DensePose repository.

## Recommended Configurations

For the Virtual Closet project, use these configurations:

### Main Configuration
- `densepose_rcnn_R_50_FPN_s1x.yaml` - **RECOMMENDED** - Main configuration for human pose detection

### Quick Testing (if needed)
- `quick_schedules/densepose_rcnn_R_50_FPN_inference_acc_test.yaml` - For inference testing
- `quick_schedules/densepose_rcnn_R_50_FPN_instant_test.yaml` - For quick testing

## Model Storage

All models are stored on external drive at `/Volumes/4TB-Z/AI-Models/virtual-closet/densepose/`
- Model: `model_final_162be9.pkl`
- Config: `densepose_rcnn_R_50_FPN_s1x.yaml`

## Directory Structure

- `cse/` - Continuous Surface Embeddings configurations (mostly unused)
- `evolution/` - Evolution-based configurations (mostly unused)
- `quick_schedules/` - Fast training/testing configurations
- `HRNet/` - High-Resolution Network configurations (unused)

## Notes

Most configuration files in subdirectories are from the original DensePose repository and are not actively used in the Virtual Closet project. They are kept for reference but could be removed in future cleanup. 