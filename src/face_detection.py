
import cv2
from pathlib import Path
from tqdm import tqdm

# Input folders containing extracted frames
REAL_FRAMES = Path("data/processed/frames/real")
FAKE_FRAMES = Path("data/processed/frames/fake")

# Output folders for cropped faces
REAL_FACES = Path("data/faces/real")
FAKE_FACES = Path("data/faces/fake")

# Load the pretrained face detector
cascade_path = (
    Path(cv2.data.haarcascades)
    / "haarcascade_frontalface_default.xml"
)
face_detector = cv2.CascadeClassifier(str(cascade_path))

IMAGE_SIZE = (224, 224)


def process_frames(input_dir, output_dir, label):
    output_dir.mkdir(parents=True, exist_ok=True)

    image_paths = sorted(input_dir.glob("*.jpg"))
    saved = 0
    no_face = 0

    print(f"\nProcessing {label} frames: {len(image_paths)}")

    for image_path in tqdm(image_paths):
        image = cv2.imread(str(image_path))

        if image is None:
            continue

        # Convert the image to grayscale for face detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Detect faces
        faces = face_detector.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(40, 40)
        )

        if len(faces) == 0:
            no_face += 1
            continue

        # Select the largest detected face
        x, y, width, height = max(
            faces, key=lambda face: face[2] * face[3]
        )

        # Crop the face from the original color image
        face = image[y:y + height, x:x + width]

        # Resize to the input size required by our model
        face = cv2.resize(face, IMAGE_SIZE)

        # Preserve the source video/frame ID
        output_path = output_dir / image_path.name
        cv2.imwrite(str(output_path), face)

        saved += 1

    print(f"{label} faces saved: {saved}")
    print(f"{label} frames with no detected face: {no_face}")


def main():
    if face_detector.empty():
        raise RuntimeError("Could not load Haar Cascade face detector.")

    process_frames(REAL_FRAMES, REAL_FACES, "REAL")
    process_frames(FAKE_FRAMES, FAKE_FACES, "FAKE")

    print("\nFace detection and cropping completed!")


if __name__ == "__main__":
    main()
