import os, json
import numpy as np
import cv2
from tensorflow.keras.models import load_model

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model", "isl_sign_model.h5")
model = None
IMG_SIZE = None
labels = None

def load_assets():
    global model, IMG_SIZE, labels
    if model is None:
        model = load_model(MODEL_PATH, compile=False)
        IMG_SIZE = model.input_shape[1]
        # load labels.json if available
        labels_path = os.path.join(os.path.dirname(__file__), "labels.json")
        if os.path.exists(labels_path):
            with open(labels_path, "r") as f:
                labels = {int(k): v for k, v in json.load(f).items()}
        else:
            labels = {i: f"Class_{i}" for i in range(model.output_shape[-1])}

def preprocess(img_bytes):
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = img.astype("float32") / 255.0
    img = np.expand_dims(img, axis=0)
    return img

def predict(img_bytes):
    load_assets()
    x = preprocess(img_bytes)
    preds = model.predict(x, verbose=0)[0]
    idx = int(np.argmax(preds))
    conf = float(np.max(preds))
    label = labels.get(idx, f"Class_{idx}")
    return label, conf
