import os
import urllib.request
# pyrefly: ignore [missing-import]
import cv2
import numpy as np
import mediapipe as mp


class HeadlessGazeTracker:
    """
    Headless memory-optimized gaze and face tracking engine using MediaPipe.
    Supports both modern MediaPipe Tasks (FaceLandmarker) and legacy FaceMesh APIs.
    Evaluates dual-iris positioning relative to eye corners to accurately detect gaze direction.
    """

    # Landmark indices for both eyes
    LEFT_IRIS = [474, 475, 476, 477]
    LEFT_EYE_OUTER = 33
    LEFT_EYE_INNER = 133

    RIGHT_IRIS = [469, 470, 471, 472]
    RIGHT_EYE_INNER = 362
    RIGHT_EYE_OUTER = 263

    MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
    MODEL_FILENAME = "face_landmarker.task"

    def __init__(self):
        self.use_tasks_api = False
        self.landmarker = None
        self.face_mesh = None

        if hasattr(mp, "solutions") and hasattr(mp.solutions, "face_mesh"):
            self.mp_face_mesh = mp.solutions.face_mesh
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                static_image_mode=True,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5,
            )
        else:
            self.use_tasks_api = True
            model_path = os.path.join(os.path.dirname(__file__), "..", "..", self.MODEL_FILENAME)
            model_path = os.path.abspath(model_path)

            if not os.path.exists(model_path):
                print(f"Downloading MediaPipe FaceLandmarker model to {model_path}...")
                urllib.request.urlretrieve(self.MODEL_URL, model_path)

            from mediapipe.tasks import python
            from mediapipe.tasks.python import vision

            base_options = python.BaseOptions(model_asset_path=model_path)
            options = vision.FaceLandmarkerOptions(
                base_options=base_options,
                running_mode=vision.RunningMode.IMAGE,
                num_faces=1,
                min_face_detection_confidence=0.5,
            )
            self.landmarker = vision.FaceLandmarker.create_from_options(options)

    def _get_eye_ratio(self, landmarks, iris_indices, corner1_idx, corner2_idx):
        iris_x = sum(landmarks[idx].x for idx in iris_indices) / len(iris_indices)
        c1_x = landmarks[corner1_idx].x
        c2_x = landmarks[corner2_idx].x

        min_x = min(c1_x, c2_x)
        max_x = max(c1_x, c2_x)
        width = max_x - min_x

        if width <= 0:
            return None

        # Normalized ratio between 0.0 (outer corner) and 1.0 (inner corner)
        ratio = (iris_x - min_x) / width
        return ratio

    def process_frame(self, frame_bytes: bytes) -> dict:
        """
        Processes a raw image frame byte buffer and calculates gaze ratio and cheating risk.
        """
        if not frame_bytes:
            return {
                "status": "INVALID_FRAME",
                "gaze_ratio": None,
                "cheating_risk": True,
            }

        nparr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return {
                "status": "INVALID_FRAME",
                "gaze_ratio": None,
                "cheating_risk": True,
            }

        # Flip horizontally (mirror effect) & convert BGR to RGB
        flipped_frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(flipped_frame, cv2.COLOR_BGR2RGB)

        landmarks = None

        if self.use_tasks_api:
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
            detection_result = self.landmarker.detect(mp_image)
            if detection_result.face_landmarks and len(detection_result.face_landmarks) > 0:
                landmarks = detection_result.face_landmarks[0]
        else:
            results = self.face_mesh.process(rgb_frame)
            if results.multi_face_landmarks and len(results.multi_face_landmarks) > 0:
                landmarks = results.multi_face_landmarks[0].landmark

        if not landmarks:
            return {
                "status": "NO_FACE_DETECTED",
                "gaze_ratio": None,
                "cheating_risk": True,
            }

        # Calculate gaze ratio for both eyes
        left_ratio = self._get_eye_ratio(landmarks, self.LEFT_IRIS, self.LEFT_EYE_OUTER, self.LEFT_EYE_INNER)
        right_ratio = self._get_eye_ratio(landmarks, self.RIGHT_IRIS, self.RIGHT_EYE_OUTER, self.RIGHT_EYE_INNER)

        if left_ratio is None and right_ratio is None:
            return {
                "status": "NO_FACE_DETECTED",
                "gaze_ratio": None,
                "cheating_risk": True,
            }

        ratios = [r for r in (left_ratio, right_ratio) if r is not None]
        avg_ratio = sum(ratios) / len(ratios)
        gaze_ratio_rounded = round(float(avg_ratio), 4)

        # Classification thresholds (Centered range expanded to 0.32 - 0.68)
        if avg_ratio < 0.32:
            status = "LOOKING_LEFT"
            cheating_risk = True
        elif avg_ratio > 0.68:
            status = "LOOKING_RIGHT"
            cheating_risk = True
        else:
            status = "CENTERED"
            cheating_risk = False

        return {
            "status": status,
            "gaze_ratio": gaze_ratio_rounded,
            "cheating_risk": cheating_risk,
        }

    def __del__(self):
        if self.face_mesh:
            self.face_mesh.close()
        if self.landmarker:
            self.landmarker.close()
