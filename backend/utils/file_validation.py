"""File validation utilities for video uploads."""

from pathlib import Path
from fastapi import HTTPException, UploadFile
from backend.config import settings


def validate_video_file(file: UploadFile):
    """Validate file extension and basic content characteristics."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must have a filename.")

    ext = Path(file.filename).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        allowed = ", ".join(sorted(settings.ALLOWED_EXTENSIONS))
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {allowed}",
        )

    return ext

