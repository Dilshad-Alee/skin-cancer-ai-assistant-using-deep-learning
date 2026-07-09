"""
Generates a medically-cautious, plain-language explanation of the model's
prediction using the Google Gemini API. Always frames output as informational,
never as a diagnosis.
"""
import logging

import google.generativeai as genai

from app.config import get_settings

logger = logging.getLogger("skin_cancer_ai.gemini_service")
settings = get_settings()

_configured = False


def _ensure_configured() -> None:
    global _configured
    if not _configured:
        if not settings.gemini_api_key or settings.gemini_api_key == "your_gemini_api_key_here":
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Add a valid key to backend/.env"
            )
        genai.configure(api_key=settings.gemini_api_key)
        _configured = True


SYSTEM_INSTRUCTION = """You are a medical-information assistant embedded in a skin lesion
screening tool. You NEVER provide a diagnosis. You only explain, in clear and
compassionate plain language, what a given AI classification result and confidence
score might generally mean, what such a result commonly suggests in dermatology
education, and what the person should do next (always recommending professional
evaluation by a licensed dermatologist). Avoid alarming language. Avoid certainty.
Always include a brief reminder that this is not a medical diagnosis. Keep the
response to 3-5 short paragraphs, no markdown headers, plain prose."""


def generate_explanation(predicted_class: str, confidence: float, raw_scores: dict) -> str:
    """
    Calls Gemini to produce a medically-safe explanation of the prediction.
    Falls back to a safe static explanation if the API call fails for any reason.
    """
    try:
        _ensure_configured()
        model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            system_instruction=SYSTEM_INSTRUCTION,
        )

        prompt = (
            f"An AI image classifier analyzed a skin lesion photo and produced this result:\n"
            f"- Predicted category: {predicted_class}\n"
            f"- Confidence score: {confidence}%\n"
            f"- Full probability breakdown: {raw_scores}\n\n"
            f"Write a clear, reassuring-but-honest explanation of what this result means "
            f"in general terms, and what the person should do next. Do not diagnose. "
            f"Remind them this is an AI screening aid, not a medical diagnosis."
        )

        response = model.generate_content(prompt)
        text = (response.text or "").strip()

        if not text:
            raise ValueError("Empty response from Gemini")

        return text

    except Exception as exc:
        logger.error(f"Gemini explanation generation failed: {exc}")
        return _fallback_explanation(predicted_class, confidence)


def _fallback_explanation(predicted_class: str, confidence: float) -> str:
    """Static, medically-safe fallback if Gemini is unavailable."""
    return (
        f"The AI model classified this image as '{predicted_class}' with a confidence "
        f"score of {confidence}%. This is an automated screening estimate based on visual "
        f"patterns in the image, not a clinical diagnosis.\n\n"
        f"Skin lesions can change in appearance for many reasons, and AI image classifiers "
        f"can be affected by lighting, image quality, and angle. A result like this should "
        f"be treated as a prompt to seek a professional opinion rather than as a conclusive "
        f"finding.\n\n"
        f"We strongly recommend showing this image and result to a licensed dermatologist "
        f"or healthcare provider, especially if you've noticed the lesion changing in size, "
        f"shape, color, or texture, or if it itches, bleeds, or doesn't heal.\n\n"
        f"This tool is intended for informational and educational purposes only and does "
        f"not replace professional medical evaluation."
    )