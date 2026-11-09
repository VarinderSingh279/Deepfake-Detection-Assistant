
from pathlib import Path
from collections import defaultdict, Counter
import random
import shutil

SEED = 42

REAL_DIR = Path("data/faces/real")
FAKE_DIR = Path("data/faces/fake")
OUTPUT_DIR = Path("data/splits")

SPLITS = ("train", "val", "test")
EXTENSIONS = {".jpg", ".jpeg", ".png"}


def video_ids_from_frame(path, label):
    stem = path.stem
    prefix, marker, _ = stem.partition("_frame_")

    if not marker:
        raise ValueError(f"Unexpected filename: {path.name}")

    if label == "real":
        return [prefix]

    # Fake filename example: 033_097_frame_000100
    ids = prefix.split("_")
    if len(ids) != 2:
        raise ValueError(f"Unexpected fake filename: {path.name}")

    return ids


def main():
    random.seed(SEED)

    # Collect face images.
    images = []
    parent = {}

    def find(x):
        parent.setdefault(x, x)
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]

    def union(a, b):
        root_a, root_b = find(a), find(b)
        if root_a != root_b:
            parent[root_b] = root_a

    for label, folder in (("real", REAL_DIR), ("fake", FAKE_DIR)):
        if not folder.exists():
            raise FileNotFoundError(folder)

        for path in sorted(folder.iterdir()):
            if path.suffix.lower() not in EXTENSIONS:
                continue

            ids = video_ids_from_frame(path, label)

            for video_id in ids:
                find(video_id)

            # Related original IDs must stay in the same split.
            if label == "fake":
                union(ids[0], ids[1])

            images.append((path, label, ids))

    # Build connected groups of related source videos.
    components = defaultdict(set)
    for video_id in list(parent):
        components[find(video_id)].add(video_id)

    # Assign whole groups to train, validation, or test.
    groups = list(components.values())
    random.shuffle(groups)

    n = len(groups)
    n_train = int(n * 0.70)
    n_val = int(n * 0.15)

    group_split = {}
    for i, group in enumerate(groups):
        if i < n_train:
            split = "train"
        elif i < n_train + n_val:
            split = "val"
        else:
            split = "test"

        for video_id in group:
            group_split[video_id] = split

    # Remove the previous split output to prevent stale files.
    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)

    counts = Counter()
    videos_by_split = defaultdict(set)

    for path, label, ids in images:
        assigned = {group_split[video_id] for video_id in ids}

        if len(assigned) != 1:
            raise RuntimeError(f"Related IDs crossed splits: {path.name}")

        split = assigned.pop()
        destination = OUTPUT_DIR / split / label
        destination.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, destination / path.name)

        counts[(split, label)] += 1
        videos_by_split[split].update(ids)

    print(f"Related-video groups: {len(groups)}")
    print("\nFace images per split:")
    for split in SPLITS:
        print(
            f"{split.upper():5} | "
            f"real={counts[(split, 'real')]:3} | "
            f"fake={counts[(split, 'fake')]:3} | "
            f"source IDs={len(videos_by_split[split])}"
        )

    # Verify no source ID appears across different splits.
    seen = {}
    for split in SPLITS:
        for video_id in videos_by_split[split]:
            if video_id in seen and seen[video_id] != split:
                raise RuntimeError(
                    f"Source ID {video_id} appears in multiple splits"
                )
            seen[video_id] = split

    print("\nSource-ID leakage check passed.")
    print(f"Updated dataset: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
