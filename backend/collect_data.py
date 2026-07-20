"""Record keypoint sequences for a sign word from the webcam.

Usage (run once per word you want the model to know):
    python collect_data.py --word Hello
    python collect_data.py --word "Thank You" --sequences 30 --frames 30

Each run stores sequences as .npy files under:
    data/<word>/<seq_num>.npy   with shape (frames, 258)

Controls while recording:
    - A countdown is shown between sequences; get into position and sign.
    - Press 'q' to quit early (already-saved sequences are kept).

Collect at least ~30 sequences per word, ideally with varied lighting,
distance and clothing, and from every person who will use the app.
"""

import argparse
import os
import time

import cv2
import numpy as np

from keypoints import extract_keypoints_from_bgr

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def collect(word: str, num_sequences: int, frames_per_seq: int, camera: int):
    word_dir = os.path.join(DATA_DIR, word)
    os.makedirs(word_dir, exist_ok=True)

    # Continue numbering after any existing sequences
    existing = [f for f in os.listdir(word_dir) if f.endswith(".npy")]
    start_idx = len(existing)
    print(f"'{word}': {start_idx} sequences already recorded, adding {num_sequences} more.")

    cap = cv2.VideoCapture(camera)
    if not cap.isOpened():
        raise SystemExit("Could not open webcam.")

    try:
        for seq in range(start_idx, start_idx + num_sequences):
            # --- Countdown so the signer can get ready ---
            for remaining in (3, 2, 1):
                ok, frame = cap.read()
                if not ok:
                    continue
                cv2.putText(frame, f"'{word}'  seq {seq + 1}  in {remaining}...",
                            (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)
                cv2.imshow("SignLang data collection", frame)
                cv2.waitKey(700)

            # --- Record one sequence ---
            sequence = []
            while len(sequence) < frames_per_seq:
                ok, frame = cap.read()
                if not ok:
                    continue
                keypoints = extract_keypoints_from_bgr(frame)
                sequence.append(keypoints)

                cv2.putText(frame, f"RECORDING '{word}' {len(sequence)}/{frames_per_seq}",
                            (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 3)
                cv2.imshow("SignLang data collection", frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    print("Stopped early.")
                    return

            np.save(os.path.join(word_dir, f"{seq}.npy"), np.array(sequence, dtype=np.float32))
            print(f"  saved sequence {seq + 1}")
    finally:
        cap.release()
        cv2.destroyAllWindows()

    print(f"Done. '{word}' now has {start_idx + num_sequences} sequences in {word_dir}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Collect sign keypoint sequences")
    parser.add_argument("--word", required=True, help="Label to record, e.g. Hello")
    parser.add_argument("--sequences", type=int, default=30, help="Sequences to record")
    parser.add_argument("--frames", type=int, default=30, help="Frames per sequence")
    parser.add_argument("--camera", type=int, default=0, help="Webcam index")
    args = parser.parse_args()

    collect(args.word, args.sequences, args.frames, args.camera)
