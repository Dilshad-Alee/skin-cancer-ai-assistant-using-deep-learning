"""
/predict endpoint: accepts an image upload, runs model inference,
optionally generates a Grad-CAM heatmap, and calls Gemini for an explanation.
"""
import logging
import uuid

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from app.config import get_settings
from app.models.schemas import PredictionResponse
from app.services.gemini_service import generate_explanation
from app.services.gradcam_service import generate_gradcam
from app.services.model_service import model_service
from app.utils.image_utils import InvalidImageError, preprocess_image, validate_and_load_image

logger = logging.getLogger("skin_cancer_ai.predict")
settings = get_settings()

router = APIRouter(prefix="/api", tags=["prediction"])


@router.post("/predict", response_model=PredictionResponse)
async def predict(
    file: UploadFile = File(..., description="Skin lesion image (JPEG/PNG/WEBP)"),
    include_gradcam: bool = Query(default=True, description="Whether to generate a Grad-CAM heatmap"),
):
    request_id = uuid.uuid4().hex[:12]

    if not model_service.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="Model is not loaded yet. Please try again in a few seconds.",
        )

    file_bytes = await file.read()

    if len(file_bytes) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {settings.max_upload_mb}MB.",
        )

    try:
        image = validate_and_load_image(file_bytes, file.content_type)
    except InvalidImageError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    try:
        batched_input, original_rgb = preprocess_image(image, target_size=settings.image_size)
    except Exception as exc:
        logger.error(f"[{request_id}] Preprocessing failed: {exc}")
        raise HTTPException(status_code=400, detail="Could not process the uploaded image.")

    try:
        predicted_class, confidence, raw_scores, raw_output = model_service.predict(batched_input)
    except Exception as exc:
        logger.error(f"[{request_id}] Model inference failed: {exc}")
        raise HTTPException(status_code=500, detail="Prediction failed due to an internal model error.")

    gradcam_url = None
    if include_gradcam:
        predicted_idx = settings.class_names_list.index(predicted_class)
        gradcam_url = generate_gradcam(
            model=model_service.model,
            batched_input=batched_input,
            original_rgb=original_rgb,
            predicted_index=predicted_idx,
        )

    explanation = generate_explanation(predicted_class, confidence, raw_scores)

    logger.info(f"[{request_id}] Prediction: {predicted_class} ({confidence}%)")

    return PredictionResponse(
        predicted_class=predicted_class,
        confidence=confidence,
        raw_scores=raw_scores,
        explanation=explanation,
        gradcam_url=gradcam_url,
        request_id=request_id,
    )