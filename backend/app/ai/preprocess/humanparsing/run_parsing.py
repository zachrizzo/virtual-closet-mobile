import pdb
from pathlib import Path
import sys
import os
import onnxruntime as ort
PROJECT_ROOT = Path(__file__).absolute().parents[0].absolute()
sys.path.insert(0, str(PROJECT_ROOT))
from parsing_api import onnx_inference
import torch


class Parsing:
    def __init__(self, gpu_id: int):
        self.gpu_id = gpu_id
        # Don't set CUDA device on non-CUDA systems
        if torch.cuda.is_available():
            torch.cuda.set_device(gpu_id)
        session_options = ort.SessionOptions()
        session_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        session_options.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
        session_options.add_session_config_entry('gpu_id', str(gpu_id))
        # Try external drive first, then local path
        external_path = Path('/Volumes/4TB-Z/AI-Models/virtual-closet/idm-vton/model_weights/humanparsing')
        local_path = Path(__file__).absolute().parents[2].absolute() / 'ckpt/humanparsing'
        
        atr_path = external_path / 'parsing_atr.onnx' if (external_path / 'parsing_atr.onnx').exists() else local_path / 'parsing_atr.onnx'
        lip_path = external_path / 'parsing_lip.onnx' if (external_path / 'parsing_lip.onnx').exists() else local_path / 'parsing_lip.onnx'
        
        self.session = ort.InferenceSession(str(atr_path),
                                            sess_options=session_options, providers=['CPUExecutionProvider'])
        self.lip_session = ort.InferenceSession(str(lip_path),
                                                sess_options=session_options, providers=['CPUExecutionProvider'])
        

    def __call__(self, input_image):
        # torch.cuda.set_device(self.gpu_id)
        parsed_image, face_mask = onnx_inference(self.session, self.lip_session, input_image)
        return parsed_image, face_mask
