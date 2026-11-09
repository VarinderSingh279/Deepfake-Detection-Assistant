"""Health check and model status route."""

from fastapi import APIRouter
from backend.schemas.response import HealthResponse
from backend.services.model_loader import get_model_manager

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def get_health():
    mm = get_model_manager()
    resnet_loaded = mm.resnet_model is not None
    detector_loaded = mm.face_detector is not None

    status = "healthy" if (resnet_loaded and detector_loaded) else "degraded"

    return HealthResponse(
        status=status,
        resnet50_loaded=resnet_loaded,
        face_detector_loaded=detector_loaded,
        gpu_available=len(mm.gpu_devices) > 0,
        gpu_devices=mm.gpu_devices,
        model_name="ResNet50 (Fine-Tuned)",
        model_version="Transfer Learning on FaceForensics++",
    )
