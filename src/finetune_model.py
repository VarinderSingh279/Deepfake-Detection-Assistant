
from pathlib import Path
import tensorflow as tf

from tensorflow.keras import layers
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.callbacks import (
    EarlyStopping,
    ModelCheckpoint,
    ReduceLROnPlateau,
)

tf.keras.utils.set_random_seed(42)

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 8

DATA_DIR = Path("data/splits")
MODEL_PATH = Path("models/deepfake_resnet50.keras")
BEST_PATH = Path("models/deepfake_resnet50_finetuned.keras")

CLASS_NAMES = ["fake", "real"]


def load_dataset(split, training=False):
    ds = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR / split,
        class_names=CLASS_NAMES,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="binary",
        shuffle=training,
        seed=42,
    )

    augmentation = tf.keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.04),
        layers.RandomZoom(0.08),
    ])

    if training:
        ds = ds.map(
            lambda x, y: (
                preprocess_input(
                    augmentation(x, training=True)
                ),
                y,
            ),
            num_parallel_calls=tf.data.AUTOTUNE,
        )
    else:
        ds = ds.map(
            lambda x, y: (preprocess_input(x), y),
            num_parallel_calls=tf.data.AUTOTUNE,
        )

    return ds.prefetch(tf.data.AUTOTUNE)


def main():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(MODEL_PATH)

    train_ds = load_dataset("train", training=True)
    val_ds = load_dataset("val")

    # Load the best model from our first experiment.
    model = tf.keras.models.load_model(str(MODEL_PATH))

    # Locate the pretrained ResNet50 backbone.
    base_model = model.get_layer("resnet50")
    base_model.trainable = True

    # Fine-tune only the final 30 backbone layers.
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    # Keep Batch Normalization statistics stable for this small dataset.
    for layer in base_model.layers:
        if isinstance(layer, layers.BatchNormalization):
            layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss="binary_crossentropy",
        metrics=[
            "accuracy",
            tf.keras.metrics.Precision(name="precision"),
            tf.keras.metrics.Recall(name="recall"),
        ],
    )

    model.summary()

    callbacks = [
        ModelCheckpoint(
            str(BEST_PATH),
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
            min_lr=1e-7,
            verbose=1,
        ),
    ]

    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=callbacks,
    )

    print("\nFine-tuning completed.")
    print("Fine-tuned model:", BEST_PATH)


if __name__ == "__main__":
    main()
