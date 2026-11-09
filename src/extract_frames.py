import cv2
import numpy as np
from pathlib import Path
from tqdm import tqdm


# Number of frames to extract from each video
FRAMES_PER_VIDEO = 10

# Input folders
REAL_DIR = Path("data/raw/original_sequences/youtube/c23/videos")
FAKE_DIR = Path("data/raw/manipulated_sequences/Deepfakes/c23/videos")

# Output folders
REAL_OUTPUT = Path("data/processed/frames/real")
FAKE_OUTPUT = Path("data/processed/frames/fake")


def extract_frames(video_path, output_dir):
    """
    Extract evenly spaced frames from one video.
    """

    cap = cv2.VideoCapture(str(video_path))

    if not cap.isOpened():
        print(f"Could not open: {video_path}")
        return 0

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if total_frames <= 0:
        cap.release()
        return 0

    # Select 10 frames evenly throughout the video
    frame_indices = np.linspace(
        0,
        total_frames - 1,
        FRAMES_PER_VIDEO,
        dtype=int
    )

    saved = 0

    for frame_index in frame_indices:

        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index)

        success, frame = cap.read()

        if not success:
            continue

        output_name = (
            f"{video_path.stem}_frame_{frame_index:06d}.jpg"
        )

        output_path = output_dir / output_name

        cv2.imwrite(str(output_path), frame)

        saved += 1

    cap.release()

    return saved


def process_dataset(video_dir, output_dir, label):

    output_dir.mkdir(parents=True, exist_ok=True)

    videos = sorted(video_dir.glob("*.mp4"))

    print(f"\nProcessing {label} videos...")
    print(f"Videos found: {len(videos)}")

    total_saved = 0

    for video_path in tqdm(videos):

        total_saved += extract_frames(
            video_path,
            output_dir
        )

    print(f"{label} frames saved: {total_saved}")


def main():

    process_dataset(
        REAL_DIR,
        REAL_OUTPUT,
        "REAL"
    )

    process_dataset(
        FAKE_DIR,
        FAKE_OUTPUT,
        "DEEPFAKE"
    )

    print("\nFrame extraction completed!")


if __name__ == "__main__":
    main()