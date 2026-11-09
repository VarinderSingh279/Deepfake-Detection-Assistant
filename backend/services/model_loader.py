"""Model loader service managing singleton instance of ResNet50 and face detector."""

import logging
import threading
from pathlib import Path
import cv2
import tensorflow as tf
from backend.config import settings

logger = logging.getLogger("deepfake_backend.model_loader")


class ModelManager:
    _instance = None
    _lock = threading.Lock()

    def __init__(self):
        self.resnet_model = None
        self.face_detector = None
        self.inference_lock = threading.Lock()
        self.gpu_devices = []

    @classmethod
    def get_instance(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls()
            return cls._instance

    def load_all_models(self):
        logger.info("Initializing ResNet50 deepfake detection model and face detector...")

        # Configure GPU
        gpus = tf.config.list_physical_devices("GPU")
        self.gpu_devices = [gpu.name for gpu in gpus]
        for gpu in gpus:
            try:
                tf.config.experimental.set_memory_growth(gpu, True)
            except Exception as e:
                logger.warning(f"Could not enable memory growth on {gpu}: {e}")

        # Load Face Detector
        try:
            cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            self.face_detector = cv2.CascadeClassifier(cascade_path)
            if self.face_detector.empty():
                raise RuntimeError("Failed to load OpenCV haarcascade.")
            logger.info("OpenCV Haar cascade face detector loaded successfully.")
        except Exception as e:
            logger.error(f"Error loading face detector: {e}")
            self.face_detector = None

        # Load ResNet50
        resnet_path = settings.RESNET50_MODEL_PATH
        if not resnet_path.exists():
            resnet_path = settings.RESNET50_ORIGINAL_PATH

        try:
            if resnet_path.exists():
                logger.info(f"Loading ResNet50 checkpoint from {resnet_path}...")
                self.resnet_model = tf.keras.models.load_model(str(resnet_path))
                logger.info("ResNet50 model loaded successfully.")
            else:
                logger.error(f"ResNet50 checkpoint not found at {resnet_path}")
        except Exception as e:
            logger.error(f"Failed to load ResNet50: {e}")
            self.resnet_model = None


def get_model_manager() -> ModelManager:
    return ModelManager.get_instance()
