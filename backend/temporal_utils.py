"""Inference for the temporal (LSTM) sign model.

The temporal model is optional: until you've collected data and run
train_temporal.py, is_temporal_available() returns False and the app
falls back to the per-frame CNN.
"""

import json
import os

import numpy as np
from tensorflow.keras.models import load_model

from keypoints import KEYPOINT_DIM, extract_keypoints_from_bytes

BASE = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE, "..", "model", "isl_temporal_model.h5")
LABELS_PATH = os.path.join(BASE, "labels_temporal.json")

SEQ_LEN = 30

_model = None
_labels = None
_checked = False


def _load():
    global _model, _labels, _checked
    if _checked:
        return
    _checked = True
    if os.path.exists(MODEL_PATH) and os.path.exists(LABELS_PATH):
        _model = load_model(MODEL_PATH, compile=False)
        with open(LABELS_PATH, "r") as f:
            _labels = {int(k): v for k, v in json.load(f).items()}
        print(f"Temporal model loaded ({len(_labels)} words).")
    else:
        print("Temporal model not found — /predict-sequence will fall back to per-frame CNN.")


def is_temporal_available() -> bool:
    _load()
    return _model is not None


def predict_sequence(frames_bytes):
    """List of JPEG bytes (one sign attempt) -> (label, confidence).

    Frames are converted to keypoint vectors, padded/truncated to SEQ_LEN,
    and classified by the LSTM in a single forward pass.
    """
    _load()
    if _model is None:
        raise RuntimeError("Temporal model not available")

    seq = np.array([extract_keypoints_from_bytes(b) for b in frames_bytes], dtype=np.float32)

    if seq.shape[0] < SEQ_LEN:
        pad = np.zeros((SEQ_LEN - seq.shape[0], KEYPOINT_DIM), dtype=np.float32)
        seq = np.vstack([seq, pad])
    else:
        # Uniformly subsample longer captures down to SEQ_LEN
        idx = np.linspace(0, seq.shape[0] - 1, SEQ_LEN).astype(int)
        seq = seq[idx]

    preds = _model.predict(np.expand_dims(seq, axis=0), verbose=0)[0]
    i = int(np.argmax(preds))
    return _labels.get(i, f"Class_{i}"), float(preds[i])
