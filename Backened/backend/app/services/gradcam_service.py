"""
Grad-CAM heatmap generation for model explainability (bonus feature).
Highlights the regions of the lesion image that most influenced the model's prediction.
"""
import logging
import os
import uuid
from typing import Optional

import cv2
import numpy as np
import tensorflow as tf

from app.config import get_settings

logger = logging.getLogger("skin_cancer_ai.gradcam_service")
settings = get_settings()

GRADCAM_DIR = os.path.join("static", "gradcam")
os.makedirs(GRADCAM_DIR, exist_ok=True)


def _find_last_conv_layer(model: tf.keras.Model):
    """
    Auto-detects the last Conv2D layer, searching recursively into nested
    Sequential/Functional sub-models (common when a pretrained base is wrapped
    in a Sequential([...]) block). Returns (owning_model, layer_name) so the
    caller knows which model object actually owns that layer.
    """
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return model, layer.name
        if isinstance(layer, (tf.keras.Model, tf.keras.Sequential)):
            nested = _find_last_conv_layer(layer)
            if nested is not None:
                return nested
    return None


def generate_gradcam(
    model: tf.keras.Model,
    batched_input: np.ndarray,
    original_rgb: np.ndarray,
    predicted_index: int,
) -> Optional[str]:
    """
    Generates a Grad-CAM heatmap overlay and saves it to static/gradcam/.
    Returns the relative URL path, or None if Grad-CAM could not be generated
    (fails gracefully so prediction is never blocked by this bonus feature).
    """
    try:
        found = _find_last_conv_layer(model)
        if found is None:
            logger.warning("No Conv2D layer found; skipping Grad-CAM.")
            return None
        owning_model, last_conv_layer_name = found

        # Force a real forward pass so Keras fully builds the graph for nested
        # Sequential/Functional sub-models before we try to read layer outputs.
        _ = model(batched_input, training=False)

        try:
            target_layer_output = owning_model.get_layer(last_conv_layer_name).output
        except Exception as layer_exc:
            logger.warning(f"Could not access conv layer output for Grad-CAM: {layer_exc}")
            return None

        grad_model = tf.keras.models.Model(
            inputs=model.inputs,
            outputs=[target_layer_output, model.output],
        )

        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(batched_input)
            if predictions.shape[-1] == 1:
                target_score = predictions[:, 0]
            else:
                target_score = predictions[:, predicted_index]

        grads = tape.gradient(target_score, conv_outputs)
        if grads is None:
            logger.warning("Gradients are None; skipping Grad-CAM.")
            return None

        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs = conv_outputs[0]
        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)
        heatmap = heatmap.numpy()

        heatmap = cv2.resize(heatmap, (original_rgb.shape[1], original_rgb.shape[0]))
        heatmap_uint8 = np.uint8(255 * heatmap)
        heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
        heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)

        overlay = cv2.addWeighted(original_rgb, 0.6, heatmap_color, 0.4, 0)

        filename = f"gradcam_{uuid.uuid4().hex}.png"
        filepath = os.path.join(GRADCAM_DIR, filename)
        cv2.imwrite(filepath, cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))

        return f"/static/gradcam/{filename}"

    except Exception as exc:
        logger.error(f"Grad-CAM generation failed: {exc}")
        return None