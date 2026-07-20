"""MediaPipe Holistic keypoint extraction for temporal sign recognition.

Each frame is reduced to a 258-dim vector:
  pose:       33 landmarks x (x, y, z, visibility) = 132
  left hand:  21 landmarks x (x, y, z)             =  63
  right hand: 21 landmarks x (x, y, z)             =  63
Missing parts (hand out of frame etc.) are zero-filled, so the vector
length is constant. Face landmarks are deliberately excluded — hands and
pose carry almost all the signal for ISL words and keep the model small.
"""

import cv2
import numpy as np
import mediapipe as mp

KEYPOINT_DIM = 132 + 63 + 63  # 258

mp_holistic = mp.solutions.holistic

_holistic = None


def _get_holistic():
    global _holistic
    if _holistic is None:
        _holistic = mp_holistic.Holistic(
            static_image_mode=False,
            model_complexity=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )
    return _holistic


def extract_keypoints_from_bgr(frame_bgr):
    """Run MediaPipe Holistic on a BGR frame -> (258,) float32 vector."""
    holistic = _get_holistic()
    rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    rgb.flags.writeable = False
    results = holistic.process(rgb)

    if results.pose_landmarks:
        pose = np.array(
            [[lm.x, lm.y, lm.z, lm.visibility] for lm in results.pose_landmarks.landmark],
            dtype=np.float32,
        ).flatten()
    else:
        pose = np.zeros(33 * 4, dtype=np.float32)

    if results.left_hand_landmarks:
        lh = np.array(
            [[lm.x, lm.y, lm.z] for lm in results.left_hand_landmarks.landmark],
            dtype=np.float32,
        ).flatten()
    else:
        lh = np.zeros(21 * 3, dtype=np.float32)

    if results.right_hand_landmarks:
        rh = np.array(
            [[lm.x, lm.y, lm.z] for lm in results.right_hand_landmarks.landmark],
            dtype=np.float32,
        ).flatten()
    else:
        rh = np.zeros(21 * 3, dtype=np.float32)

    return np.concatenate([pose, lh, rh])


def extract_keypoints_from_bytes(img_bytes):
    """JPEG/PNG bytes -> (258,) keypoint vector (zeros if decode fails)."""
    nparr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if frame is None:
        return np.zeros(KEYPOINT_DIM, dtype=np.float32)
    return extract_keypoints_from_bgr(frame)
