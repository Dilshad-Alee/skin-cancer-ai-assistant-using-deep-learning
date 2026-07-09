"""
Pydantic schemas for request/response validation.
"""
from typing import Optional
from pydantic import BaseModel, Field


class PredictionResponse(BaseModel):
    predicted_class: str = Field(..., description="Benign or Malignant")
    confidence: float = Field(..., description="Confidence score 0-100 for the predicted class")
    raw_scores: dict = Field(..., description="Raw probability for each class")
    explanation: str = Field(..., description="Gemini-generated, medically-cautious explanation")
    gradcam_url: Optional[str] = Field(None, description="Relative URL to Grad-CAM heatmap image, if generated")
    disclaimer: str = Field(
        default=(
            "This tool provides an AI-generated estimate for informational purposes only. "
            "It is NOT a medical diagnosis. Please consult a licensed dermatologist or "
            "healthcare professional for any concerns about your skin."
        )
    )
    request_id: str
    model_version: str = "Improved_CNN_v1"


class ErrorResponse(BaseModel):
    detail: str
    error_code: str