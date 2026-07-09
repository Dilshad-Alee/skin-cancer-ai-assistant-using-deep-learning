"""
Image preprocessing utilities for model inference.
"""
import io
from typing import Tuple

import numpy as np
from PIL import Image, UnidentifiedImageError

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}


class InvalidImageError(Exception):
    pass


def validate_and_load_image(file_bytes: bytes, content_type: str) -> Image.Image:
    """
    Validates the uploaded file is a real, readable image and returns a PIL Image (RGB).
    """
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise InvalidImageError(
            f"Unsupported file type '{content_type}'. Please upload a JPEG, PNG, or WEBP image."
        )

    if not file_bytes:
        raise InvalidImageError("Uploaded file is empty.")

    try:
        image = Image.open(io.BytesIO(file_bytes))
        image.verify()  # checks file integrity
        # re-open because verify() closes the file pointer/decoder state
        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise InvalidImageError("The uploaded file is not a valid image.") from exc

    return image


def preprocess_image(image: Image.Image, target_size: int = 224) -> Tuple[np.ndarray, np.ndarray]:
    """
    Resizes to (target_size, target_size), normalizes pixel values to [0, 1],
    and returns both:
      - batched array ready for model.predict()  -> shape (1, H, W, 3)
      - the resized RGB array (for Grad-CAM overlay) -> shape (H, W, 3), uint8
    """
    resized = image.resize((target_size, target_size))
    rgb_array = np.array(resized).astype("uint8")  # for visualization later

    normalized = rgb_array.astype("float32") / 255.0
    batched = np.expand_dims(normalized, axis=0)  # (1, 224, 224, 3)

    return batched, rgb_array