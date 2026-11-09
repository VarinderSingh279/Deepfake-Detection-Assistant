"""Video analysis route accepting multipart video uploads and running ResNet50 inference."""

import os
import tempfile
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException

from backend.config import settings
from backend.schemas.response import VideoAnalysisResponse
from backend.services.model_loader import get_model_manager
from backend.services.video_processor import VideoProcessor
from backend.services.inference import InferenceService
from backend.utils.file_validation import validate_video_file

router = APIRouter(tags=["Analysis"])


@router.post("/analyze", response_model=VideoAnalysisResponse)
async def analyze_video(file: UploadFile = File(...)):
    """Analyze an uploaded video using the fine-tuned ResNet50 deepfake detection model."""
    ext = validate_video_file(file)

    mm = get_model_manager()
    if mm.face_detector is None:
        raise HTTPException(status_code=503, detail="Face detector is not loaded.")
    if mm.resnet_model is None:
        raise HTTPException(
            status_code=503,
            detail="ResNet50 deepfake detection model is not loaded.",
        )

    temp_path = None
    try:
        # Create a temporary file with the original extension
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            temp_path = Path(tmp.name)
            total_size = 0
            chunk_size = 1024 * 1024  # 1MB chunks

            while chunk := await file.read(chunk_size):
                total_size += len(chunk)
                if total_size > settings.MAX_UPLOAD_SIZE_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"Video exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)}MB.",
                    )
                tmp.write(chunk)

        # Process video: extract frames & detect faces
        processor = VideoProcessor(mm.face_detector)
        try:
            (
                frames_processed,
                faces_detected,
                frame_indices,
                resnet_faces,
            ) = processor.process_video(temp_path)
        except ValueError as e:
            raise HTTPException(
                status_code=422,
                detail=f"Unable to process or decode video: {str(e)}",
            )

        # If no faces were detected in sampled frames
        if faces_detected == 0:
            return VideoAnalysisResponse(
                success=True,
                video_name=file.filename or "uploaded_video",
                frames_processed=frames_processed,
                faces_detected=0,
                prediction=None,
                real_score=None,
                fake_score=None,
                confidence_score=None,
                threshold=settings.CLASSIFICATION_THRESHOLD,
                summary="No faces were detected in the sampled frames.",
                frame_analysis=[],
                message="No faces detected in the sampled frames. Authentic face analysis requires a clearly visible human face.",
            )

        # Run inference through fine-tuned ResNet50
        inference_service = InferenceService(mm)
        (
            prediction,
            real_score,
            fake_score,
            confidence_score,
            summary,
            frame_analysis,
        ) = inference_service.run_inference(resnet_faces, frame_indices)

        return VideoAnalysisResponse(
            success=True,
            video_name=file.filename or "uploaded_video",
            frames_processed=frames_processed,
            faces_detected=faces_detected,
            prediction=prediction,
            real_score=real_score,
            fake_score=fake_score,
            confidence_score=confidence_score,
            threshold=settings.CLASSIFICATION_THRESHOLD,
            summary=summary,
            frame_analysis=frame_analysis,
            message=None,
        )

    finally:
        # Guarantee cleanup of temporary uploaded file
        if temp_path and temp_path.exists():
            try:
                os.unlink(temp_path)
            except OSError:
                pass
