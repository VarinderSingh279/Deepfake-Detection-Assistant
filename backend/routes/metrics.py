"""Model evaluation metrics and benchmark route for ResNet50."""

import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from backend.config import settings
from backend.schemas.response import MetricsResponse

router = APIRouter(tags=["Metrics"])

BENCHMARK_PATH = settings.BASE_DIR / "outputs" / "resnet50_benchmark.json"


@router.get("/metrics", response_model=MetricsResponse)
def get_metrics():
    """Return verified FaceForensics++ benchmark results for ResNet50."""
    if not BENCHMARK_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail="ResNet50 benchmark data not found.",
        )

    try:
        with open(BENCHMARK_PATH, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to read metrics: {str(e)}"
        )
