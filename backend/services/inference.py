"""Inference service running ResNet50 deepfake detection."""

import logging
from typing import List, Optional, Tuple
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications.resnet50 import preprocess_input

from backend.config import settings
from backend.schemas.response import FrameAnalysisItem
from backend.services.model_loader import ModelManager

logger = logging.getLogger("deepfake_backend.inference")


class InferenceService:
    def __init__(self, model_manager: ModelManager):
        self.mm = model_manager

    def run_inference(
        self, faces: List[np.ndarray], frame_indices: List[int]
    ) -> Tuple[str, float, float, float, str, List[FrameAnalysisItem]]:
        """
        Run inference using fine-tuned ResNet50.

        Returns:
            prediction: "REAL" or "FAKE"
            real_score: float (mean probability of real)
            fake_score: float (mean probability of fake)
            confidence_score: float (confidence in final prediction)
            summary: str (human-readable summary)
            frame_items: List[FrameAnalysisItem]
        """
        if self.mm.resnet_model is None or not faces:
            raise RuntimeError("ResNet50 model is not loaded or no faces provided.")

        images = np.asarray(faces, dtype=np.float32)
        images = preprocess_input(images)

        with self.mm.inference_lock:
            preds = self.mm.resnet_model.predict(images, verbose=0).reshape(-1)

        real_scores = [float(p) for p in preds]
        mean_real = float(np.mean(real_scores))
        mean_fake = float(1.0 - mean_real)

        threshold = settings.CLASSIFICATION_THRESHOLD
        pred_label = "REAL" if mean_real >= threshold else "FAKE"
        confidence = mean_real if pred_label == "REAL" else mean_fake

        frame_items = [
            FrameAnalysisItem(
                frame_index=f_idx,
                real_score=round(r, 4),
                fake_score=round(1.0 - r, 4),
                prediction="REAL" if r >= threshold else "FAKE",
            )
            for f_idx, r in zip(frame_indices, real_scores)
        ]

        summary = (
            f"ResNet50 classified this video as {pred_label} with {confidence:.1%} confidence "
            f"across {len(faces)} analyzed face crops. "
            f"(Mean REAL score: {mean_real:.1%}, Mean FAKE score: {mean_fake:.1%})."
        )

        return (
            pred_label,
            round(mean_real, 4),
            round(mean_fake, 4),
            round(confidence, 4),
            summary,
            frame_items,
        )
