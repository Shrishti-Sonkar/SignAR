import os
import cv2
import numpy as np
import pyttsx3
from tensorflow.keras.models import load_model

# ✅ Suppress TensorFlow warnings & logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# ✅ Load the trained ISL model
MODEL_PATH = "isl_sign_model.h5"  # Change to .keras if saved differently
model = load_model(MODEL_PATH, compile=False)

# ✅ Get input image size from the trained model
input_shape = model.input_shape  # Example: (None, 224, 224, 3)
IMG_SIZE = input_shape[1]        # Dynamically fetch height/width
print(f"✅ Model expects input size: {IMG_SIZE}x{IMG_SIZE}")

# ✅ Automatically generate class labels from the dataset folder
DATASET_PATH = r"C:\Users\HP\OneDrive\Desktop\SignLang\signdata"
if os.path.exists(DATASET_PATH):
    class_labels = {i: label for i, label in enumerate(sorted(os.listdir(DATASET_PATH)))}
else:
    # Fallback: Generate dummy labels if dataset not available locally
    num_classes = model.output_shape[-1]
    class_labels = {i: f"Class_{i}" for i in range(num_classes)}

print("✅ Loaded class labels:", class_labels)

# ✅ Initialize text-to-speech engine
engine = pyttsx3.init()

def speak_text(text):
    """Speak the detected sign using offline TTS."""
    engine.say(text)
    engine.runAndWait()

# ✅ Open webcam
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Error: Cannot access webcam!")
    exit()

print("🎥 Starting ISL sign detection... Press 'q' to exit.")

# ✅ Prediction buffer for building sentences
sentence_buffer = []
last_spoken = ""

while True:
    ret, frame = cap.read()
    if not ret:
        print("❌ Failed to grab frame!")
        break

    # ✅ Preprocess frame for model dynamically
    img = cv2.resize(frame, (IMG_SIZE, IMG_SIZE))  # Auto-match training size
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = img / 255.0
    img = np.expand_dims(img, axis=0)

    # ✅ Predict sign
    preds = model.predict(img, verbose=0)
    pred_index = int(np.argmax(preds))
    confidence = np.max(preds)
    label = class_labels.get(pred_index, f"Unknown_{pred_index}")

    # ✅ Add prediction to sentence buffer if confidence > 90%
    if confidence > 0.90:
        if not sentence_buffer or (sentence_buffer and sentence_buffer[-1] != label):
            sentence_buffer.append(label)

    # ✅ Create a joined sentence from buffer (last 10 signs only)
    sentence = " ".join(sentence_buffer[-10:])

    # ✅ Overlay prediction & sentence on the video feed
    cv2.putText(frame, f"Sign: {label}", (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 3)
    cv2.putText(frame, f"Confidence: {confidence:.2f}", (20, 80),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
    cv2.putText(frame, f"Sentence: {sentence}", (20, 120),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    cv2.imshow("ISL Sign Detection", frame)

    # ✅ Speak detected sign if it's new & confident
    if label != last_spoken and confidence > 0.90:
        speak_text(label)
        last_spoken = label

    # ✅ Press 'q' to quit
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# ✅ Release resources
cap.release()
cv2.destroyAllWindows()
