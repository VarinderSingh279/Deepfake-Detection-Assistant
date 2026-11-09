"""Integration and unit tests for ResNet50 FastAPI backend."""

from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from backend.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["active_model"] == "ResNet50 (Fine-Tuned)"
    assert data["api_prefix"] == "/api"


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["resnet50_loaded"] is True
    assert data["face_detector_loaded"] is True
    assert "ResNet50" in data["model_name"]


def test_metrics_endpoint(client):
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "baseline_resnet50" in data
    assert "finetuned_resnet50" in data
    assert "improvement_summary" in data
    assert data["test_samples"] == 200
    assert data["finetuned_resnet50"]["accuracy"] == 0.685
    assert data["finetuned_resnet50"]["roc_auc"] == 0.7853


def test_unsupported_file_extension(client):
    response = client.post(
        "/api/analyze",
        files={"file": ("fake_document.txt", b"This is a text file", "text/plain")},
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_corrupted_video_file(client):
    response = client.post(
        "/api/analyze",
        files={"file": ("corrupt.mp4", b"corrupted non-video header data", "video/mp4")},
    )
    assert response.status_code == 422
    assert "Unable to process or decode video" in response.json()["detail"]


def test_real_video_inference(client):
    raw_videos = list(Path("data/raw").glob("**/*.mp4"))
    if not raw_videos:
        pytest.skip("No sample raw MP4 video available for end-to-end test.")

    test_video = raw_videos[0]
    with open(test_video, "rb") as f:
        video_bytes = f.read()

    response = client.post(
        "/api/analyze",
        files={"file": (test_video.name, video_bytes, "video/mp4")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["frames_processed"] > 0
    if data["faces_detected"] > 0:
        assert data["prediction"] in ["REAL", "FAKE"]
        assert 0.0 <= data["real_score"] <= 1.0
        assert 0.0 <= data["fake_score"] <= 1.0
        assert 0.0 <= data["confidence_score"] <= 1.0
        assert len(data["frame_analysis"]) == data["faces_detected"]
        assert "ResNet50" in data["summary"]
