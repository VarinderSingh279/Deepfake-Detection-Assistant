"""Video processing service: frame extraction, face detection, and ResNet50 input preparation."""

import logging
from pathlib import Path
from typing import List, Tuple
import cv2
import numpy as np

from backend.config import settings

logger = logging.getLogger("deepfake_backend.video_processor")


class VideoProcessor:
    def __init__(self, face_detector):
        self.face_detector = face_detector

    def process_video(
        self, video_path: Path
    ) -> Tuple[int, int, List[int], List[np.ndarray]]:
        """
        Process uploaded video:
        1. Open and validate readability.
        2. Uniformly sample up to MAX_FRAMES across duration.
        3. Detect faces, select largest face per frame.
        4. Crop, convert BGR to RGB, and resize to (224, 224).

        Returns:
            frames_processed: int
            faces_detected: int
            sampled_indices: List[int]
            resnet_faces: List[np.ndarray] (224x224 RGB)
        """
        if self.face_detector is None:
            raise RuntimeError("Face detector is not initialized.")

        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            raise ValueError(f"Could not open or decode video file: {video_path.name}")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0:
            cap.release()
            raise ValueError("Video contains 0 readable frames or is corrupted.")

        sample_count = min(settings.MAX_FRAMES, total_frames)
        frame_indices = np.linspace(0, total_frames - 1, num=sample_count, dtype=int)
        unique_indices = np.unique(frame_indices)

        resnet_faces = []
        face_frame_indices = []
        processed_frames = 0

        for idx in unique_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
            success, frame = cap.read()
            if not success or frame is None:
                continue

            processed_frames += 1

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            detected_faces = self.face_detector.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(60, 60),
            )

            if len(detected_faces) == 0:
                continue

            # Select largest detected face box
            x, y, w, h = max(detected_faces, key=lambda b: b[2] * b[3])

            face_bgr = frame[y : y + h, x : x + w]
            if face_bgr.size == 0:
                continue

            face_rgb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB)
            face_resized = cv2.resize(face_rgb, settings.INPUT_SIZE)

            resnet_faces.append(face_resized)
            face_frame_indices.append(int(idx))

        cap.release()
        logger.info(
            f"Processed {processed_frames} frames from '{video_path.name}', "
            f"detected {len(resnet_faces)} faces."
        )

        return (
            processed_frames,
            len(resnet_faces),
            face_frame_indices,
            resnet_faces,
        )
