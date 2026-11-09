
from pathlib import Path
import argparse

import cv2
import numpy as np
import tensorflow as tf

from tensorflow.keras.applications.resnet50 import preprocess_input


# Project configuration
IMAGE_SIZE = (224, 224)
MAX_FRAMES = 20

MODEL_PATH = Path("models/deepfake_resnet50_finetuned.keras")
# Baseline model available at Path("models/deepfake_resnet50.keras")

CLASS_NAMES = ["fake", "real"]


def load_face_detector():
    cascade_path = (
        cv2.data.haarcascades
        + "haarcascade_frontalface_default.xml"
    )

    detector = cv2.CascadeClassifier(cascade_path)

    if detector.empty():
        raise RuntimeError("Could not load Haar face detector.")

    return detector


def extract_face_images(video_path, detector):
    cap = cv2.VideoCapture(str(video_path))

    if not cap.isOpened():
        raise ValueError(f"Could not open video: {video_path}")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if total_frames <= 0:
        cap.release()
        raise ValueError("Video contains no readable frames.")

    # Sample frames across the complete video.
    frame_indices = np.linspace(
        0,
        total_frames - 1,
        num=min(MAX_FRAMES, total_frames),
        dtype=int,
    )

    faces = []
    processed_frames = 0

    for frame_index in np.unique(frame_indices):
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(frame_index))
        success, frame = cap.read()

        if not success:
            continue

        processed_frames += 1

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        detected_faces = detector.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(60, 60),
        )

        if len(detected_faces) == 0:
            continue

        # Select the largest detected face.
        x, y, w, h = max(
            detected_faces,
            key=lambda box: box[2] * box[3],
        )

        face = frame[y:y + h, x:x + w]

        # ResNet50 expects RGB images, not OpenCV's BGR order.
        face = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
        face = cv2.resize(face, IMAGE_SIZE)

        faces.append(face)

    cap.release()

    print(f"Frames processed: {processed_frames}")
    print(f"Faces detected: {len(faces)}")

    return faces


def predict_video(video_path, model, detector):
    faces = extract_face_images(video_path, detector)

    if not faces:
        print(
            "No faces detected. Cannot reliably classify this video."
        )
        return

    # Convert face images into a model input batch.
    images = np.asarray(faces, dtype=np.float32)
    images = preprocess_input(images)

    # Model output is the probability of REAL (label 1).
    probabilities_real = model.predict(
        images,
        verbose=0,
    ).reshape(-1)

    probabilities_fake = 1.0 - probabilities_real

    mean_real = float(np.mean(probabilities_real))
    mean_fake = float(np.mean(probabilities_fake))

    print("\n===== VIDEO PREDICTION =====")
    print(f"Video: {video_path}")
    print(f"Faces classified: {len(faces)}")
    print(f"Mean REAL score: {mean_real:.4f}")
    print(f"Mean FAKE score: {mean_fake:.4f}")

    if mean_real >= 0.5:
        print("Prediction: REAL")
    else:
        print("Prediction: FAKE")

    print(
        "\nNote: This is a prototype estimate based on sampled "
        "face images, not a guarantee of authenticity."
    )


def main():
    parser = argparse.ArgumentParser(
        description="Classify a video using the ResNet50 model."
    )
    parser.add_argument(
        "video",
        type=Path,
        help="Path to the input video",
    )
    args = parser.parse_args()

    if not args.video.is_file():
        raise FileNotFoundError(
            f"Video file not found: {args.video}"
        )

    if not MODEL_PATH.is_file():
        raise FileNotFoundError(
            f"Model not found: {MODEL_PATH}"
        )

    print(f"Loading model: {MODEL_PATH}")

    model = tf.keras.models.load_model(str(MODEL_PATH))
    detector = load_face_detector()

    predict_video(args.video, model, detector)


if __name__ == "__main__":
    main()
