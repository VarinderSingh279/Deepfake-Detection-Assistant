"""Pydantic schemas for ResNet50 Deepfake Detection API responses."""

from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


class FrameAnalysisItem(BaseModel):
    frame_index: int
    real_score: float
    fake_score: float
    prediction: str


class VideoAnalysisResponse(BaseModel):
    success: bool
    video_name: str
    frames_processed: int
    faces_detected: int
    prediction: Optional[str] = None  # "REAL" or "FAKE"
    real_score: Optional[float] = None
    fake_score: Optional[float] = None
    confidence_score: Optional[float] = None
    threshold: Optional[float] = None
    summary: Optional[str] = None
    frame_analysis: List[FrameAnalysisItem] = Field(default_factory=list)
    message: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    resnet50_loaded: bool
    face_detector_loaded: bool
    gpu_available: bool
    gpu_devices: List[str]
    model_name: str
    model_version: str


class MetricsResponse(BaseModel):
    dataset: str
    test_samples: int
    split_strategy: str
    baseline_resnet50: Dict[str, Any]
    finetuned_resnet50: Dict[str, Any]
    improvement_summary: Dict[str, Any]
