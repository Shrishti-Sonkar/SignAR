"""Train the temporal (LSTM) sign model on collected keypoint sequences.

Usage:
    python train_temporal.py                # train on everything in data/
    python train_temporal.py --epochs 200

Reads:   data/<word>/<n>.npy   (frames, 258) from collect_data.py
Writes:  ../model/isl_temporal_model.h5
         labels_temporal.json
"""

import argparse
import json
import os

import numpy as np
from sklearn.model_selection import train_test_split
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input, Masking
from tensorflow.keras.models import Sequential
from tensorflow.keras.utils import to_categorical

from keypoints import KEYPOINT_DIM

BASE = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE, "data")
MODEL_PATH = os.path.join(BASE, "..", "model", "isl_temporal_model.h5")
LABELS_PATH = os.path.join(BASE, "labels_temporal.json")


def load_dataset(seq_len: int):
    words = sorted(
        d for d in os.listdir(DATA_DIR)
        if os.path.isdir(os.path.join(DATA_DIR, d))
    )
    if not words:
        raise SystemExit(f"No data found in {DATA_DIR}. Run collect_data.py first.")

    X, y = [], []
    for label_idx, word in enumerate(words):
        word_dir = os.path.join(DATA_DIR, word)
        for fname in os.listdir(word_dir):
            if not fname.endswith(".npy"):
                continue
            seq = np.load(os.path.join(word_dir, fname))
            # Pad / truncate to a fixed length
            if seq.shape[0] < seq_len:
                pad = np.zeros((seq_len - seq.shape[0], KEYPOINT_DIM), dtype=np.float32)
                seq = np.vstack([seq, pad])
            else:
                seq = seq[:seq_len]
            X.append(seq)
            y.append(label_idx)

    print(f"Loaded {len(X)} sequences across {len(words)} words: {words}")
    return np.array(X, dtype=np.float32), to_categorical(y, num_classes=len(words)), words


def build_model(seq_len: int, num_classes: int):
    model = Sequential([
        Input(shape=(seq_len, KEYPOINT_DIM)),
        Masking(mask_value=0.0),
        LSTM(64, return_sequences=True, activation="tanh"),
        Dropout(0.3),
        LSTM(128, return_sequences=False, activation="tanh"),
        Dropout(0.3),
        Dense(64, activation="relu"),
        Dense(num_classes, activation="softmax"),
    ])
    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
    return model


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=150)
    parser.add_argument("--seq-len", type=int, default=30)
    parser.add_argument("--batch-size", type=int, default=16)
    args = parser.parse_args()

    X, y, words = load_dataset(args.seq_len)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.15, stratify=y.argmax(axis=1), random_state=42
    )

    model = build_model(args.seq_len, len(words))
    model.summary()

    model.fit(
        X_train, y_train,
        validation_data=(X_test, y_test),
        epochs=args.epochs,
        batch_size=args.batch_size,
        callbacks=[
            EarlyStopping(monitor="val_loss", patience=25, restore_best_weights=True),
            ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=10),
        ],
    )

    loss, acc = model.evaluate(X_test, y_test, verbose=0)
    print(f"\nTest accuracy: {acc:.3f}")

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    model.save(MODEL_PATH)
    with open(LABELS_PATH, "w") as f:
        json.dump({str(i): w for i, w in enumerate(words)}, f, indent=2)
    print(f"Saved model  -> {MODEL_PATH}")
    print(f"Saved labels -> {LABELS_PATH}")


if __name__ == "__main__":
    main()
