
import tensorflow as tf
from pathlib import Path

from tensorflow.keras import layers, models
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.callbacks import (
    EarlyStopping,
    ModelCheckpoint,
    ReduceLROnPlateau,
)

# Reproducibility
tf.keras.utils.set_random_seed(42)

# Configuration
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 12

DATA_DIR = Path("data/splits")
OUTPUT_DIR = Path("outputs")
MODEL_DIR = Path("models")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Keep label order consistent:
# fake = 0, real = 1
CLASS_NAMES = ["fake", "real"]


def load_dataset(split, shuffle=False):
    dataset = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR / split,
        class_names=CLASS_NAMES,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="binary",
        shuffle=shuffle,
        seed=42,
    )

    # ResNet50 expects its application-specific preprocessing.
    dataset = dataset.map(
        lambda images, labels: (
            preprocess_input(images),
            labels,
        ),
        num_parallel_calls=tf.data.AUTOTUNE,
    )

    return dataset.prefetch(tf.data.AUTOTUNE)


def build_model():
    base_model = ResNet50(
        weights="imagenet",
        include_top=False,
        input_shape=(224, 224, 3),
    )

    # First experiment: freeze pretrained feature extractor.
    base_model.trainable = False

    inputs = layers.Input(shape=(224, 224, 3))
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.4)(x)
    outputs = layers.Dense(1, activation="sigmoid")(x)

    model = models.Model(inputs, outputs)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="binary_crossentropy",
        metrics=[
            "accuracy",
            tf.keras.metrics.Precision(name="precision"),
            tf.keras.metrics.Recall(name="recall"),
        ],
    )

    return model


def main():
    print("TensorFlow version:", tf.__version__)
    print("Available GPUs:", tf.config.list_physical_devices("GPU"))

    train_ds = load_dataset("train", shuffle=True)
    val_ds = load_dataset("val")

    model = build_model()
    model.summary()

    best_model_path = MODEL_DIR / "deepfake_resnet50.keras"

    callbacks = [
        ModelCheckpoint(
            filepath=str(best_model_path),
            monitor="val_loss",
            save_best_only=True,
            verbose=1,
        ),
        EarlyStopping(
            monitor="val_loss",
            patience=3,
            restore_best_weights=True,
            verbose=1,
        ),
        ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=2,
            min_lr=1e-6,
            verbose=1,
        ),
    ]

    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=callbacks,
    )

    # Save training history for later analysis.
    import json

    history_path = OUTPUT_DIR / "training_history.json"
    with history_path.open("w") as file:
        json.dump(
            {
                key: [float(value) for value in values]
                for key, values in history.history.items()
            },
            file,
            indent=2,
        )

    print("\nTraining completed.")
    print("Best model saved to:", best_model_path)
    print("Training history saved to:", history_path)


if __name__ == "__main__":
    main()
