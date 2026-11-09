
from pathlib import Path
import json
import numpy as np
import tensorflow as tf

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    roc_auc_score,
)
from tensorflow.keras.applications.resnet50 import preprocess_input

TEST_DIR = Path("data/splits/test")
MODEL_PATH = Path(
    "models/deepfake_resnet50_finetuned.keras"
)
OUTPUT_DIR = Path("outputs")
BATCH_SIZE = 16

CLASS_NAMES = ["fake", "real"]


def main():
    test_ds = tf.keras.utils.image_dataset_from_directory(
        TEST_DIR,
        class_names=CLASS_NAMES,
        image_size=(224, 224),
        batch_size=BATCH_SIZE,
        label_mode="binary",
        shuffle=False,
    )

    test_ds = test_ds.map(
        lambda images, labels: (
            preprocess_input(images),
            labels,
        ),
        num_parallel_calls=tf.data.AUTOTUNE,
    ).prefetch(tf.data.AUTOTUNE)

    model = tf.keras.models.load_model(str(MODEL_PATH))

    # Collect the true labels in dataset order.
    y_true = np.concatenate([
        labels.numpy().reshape(-1)
        for _, labels in test_ds
    ]).astype(int)

    # Predict the probability of REAL (class 1).
    probabilities = model.predict(test_ds, verbose=1).reshape(-1)
    y_pred = (probabilities >= 0.5).astype(int)

    print("\n===== TEST RESULTS =====")
    print(f"Test images: {len(y_true)}")
    print(f"Accuracy:  {accuracy_score(y_true, y_pred):.4f}")
    print(
        f"Precision: {precision_score(y_true, y_pred, zero_division=0):.4f}"
    )
    print(
        f"Recall:    {recall_score(y_true, y_pred, zero_division=0):.4f}"
    )
    print(
        f"F1-score:  {f1_score(y_true, y_pred, zero_division=0):.4f}"
    )
    print(f"ROC-AUC:   {roc_auc_score(y_true, probabilities):.4f}")

    matrix = confusion_matrix(y_true, y_pred, labels=[0, 1])
    print("\nConfusion matrix (rows=true, columns=predicted)")
    print("Class order: [fake, real]")
    print(matrix)

    print("\nClassification report:")
    print(classification_report(
        y_true,
        y_pred,
        labels=[0, 1],
        target_names=CLASS_NAMES,
        zero_division=0,
    ))

    report = classification_report(
        y_true,
        y_pred,
        labels=[0, 1],
        target_names=CLASS_NAMES,
        zero_division=0,
        output_dict=True,
    )

    model_size_mb = MODEL_PATH.stat().st_size / (1024 * 1024)

    results = {
        "model_name": "ResNet50 (Fine-tuned)",
        "test_images": int(len(y_true)),
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision_real": float(
            precision_score(y_true, y_pred, zero_division=0)
        ),
        "recall_real": float(
            recall_score(y_true, y_pred, zero_division=0)
        ),
        "f1_real": float(f1_score(y_true, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_true, probabilities)),
        "confusion_matrix": matrix.tolist(),
        "classification_report": report,
        "model_size_mb": round(model_size_mb, 2),
        "input_size": [224, 224, 3],
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "test_results.json").write_text(json.dumps(results, indent=2))
    (OUTPUT_DIR / "resnet50_results.json").write_text(json.dumps(results, indent=2))

    print(f"\nResults saved to outputs/resnet50_results.json and outputs/test_results.json")


if __name__ == "__main__":
    main()
