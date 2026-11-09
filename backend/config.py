"""Backend configuration settings for ResNet50 Deepfake Detection Assistant."""

from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseModel):
    BASE_DIR: Path = BASE_DIR
    PROJECT_NAME: str = "Deepfake Detection Assistant API (ResNet50)"
    VERSION: str = "2.1.0"
    API_PREFIX: str = "/api"

    # ResNet50 Model Paths
    RESNET50_MODEL_PATH: Path = BASE_DIR / "models" / "deepfake_resnet50_finetuned.keras"
    RESNET50_ORIGINAL_PATH: Path = BASE_DIR / "models" / "deepfake_resnet50.keras"

    # Evaluation results paths
    RESNET_RESULTS_PATH: Path = BASE_DIR / "outputs" / "resnet50_results.json"
    BASELINE_RESULTS_PATH: Path = BASE_DIR / "outputs" / "test_results.json"

    # Video processing & Model input settings
    MAX_FRAMES: int = 20
    INPUT_SIZE: tuple = (224, 224)
    CLASSIFICATION_THRESHOLD: float = 0.50

    # File upload settings
    MAX_UPLOAD_SIZE_BYTES: int = 100 * 1024 * 1024  # 100 MB
    ALLOWED_EXTENSIONS: set = {".mp4", ".mov", ".avi", ".mkv"}

    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ]


settings = Settings()
