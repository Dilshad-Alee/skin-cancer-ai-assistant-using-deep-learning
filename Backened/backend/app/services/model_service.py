"""
Loads the trained Keras model once at startup and exposes a prediction interface.
Implemented as a singleton so the (potentially large) model is loaded into memory
exactly once, not on every request.
"""
import logging
import os
from typing import Dict, Tuple

import numpy as np
import tensorflow as tf

from app.config import get_settings

logger = logging.getLogger("skin_cancer_ai.model_service")

settings = get_settings()


class ModelService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._model = None
            cls._instance._class_names = settings.class_names_list
        return cls._instance

    def load(self) -> None:
        """Loads the .keras model from disk. Call once on app startup."""
        model_path = settings.model_path
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model file not found at '{model_path}'. "
                f"Place your trained 'Improved_CNN.keras' file there, "
                f"or update MODEL_PATH in .env."
            )

        logger.info(f"Loading model from {model_path} ...")
        self._model = tf.keras.models.load_model(model_path)
        logger.info("Model loaded successfully.")

        # Warm-up inference to avoid first-request latency spike, and to force
        # Keras to fully build the model's internal graph (required for Grad-CAM
        # to later access intermediate layer outputs on Sequential-based models).
        dummy_input = np.zeros((1, settings.image_size, settings.image_size, 3), dtype="float32")
        self._model.predict(dummy_input, verbose=0)
        _ = self._model(dummy_input, training=False)
        logger.info("Model warm-up complete.")

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    @property
    def model(self) -> tf.keras.Model:
        if self._model is None:
            raise RuntimeError("Model has not been loaded yet. Call ModelService().load() on startup.")
        return self._model

    def predict(self, batched_input: np.ndarray) -> Tuple[str, float, Dict[str, float], np.ndarray]:
        """
        Runs inference on a preprocessed batched image array.

        Returns:
            predicted_class: str
            confidence: float (0-100, for the predicted class)
            raw_scores: dict mapping class name -> probability (0-100)
            raw_output: the raw numpy output array from the model (for Grad-CAM use)
        """
        output = self.model.predict(batched_input, verbose=0)[0]  # shape (num_classes,) or (1,)

        # Handle both sigmoid (binary, single neuron) and softmax (2-neuron) output heads
        if output.shape[-1] == 1:
            malignant_prob = float(output[0])
            benign_prob = 1.0 - malignant_prob
            probs = [benign_prob, malignant_prob]
        else:
            probs = output.tolist()

        class_names = self._class_names
        raw_scores = {name: round(probs[i] * 100, 2) for i, name in enumerate(class_names)}

        predicted_idx = int(np.argmax(probs))
        predicted_class = class_names[predicted_idx]
        confidence = round(probs[predicted_idx] * 100, 2)

        return predicted_class, confidence, raw_scores, output


model_service = ModelService()