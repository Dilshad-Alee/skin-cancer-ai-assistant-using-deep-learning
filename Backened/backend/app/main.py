"""
FastAPI application entrypoint for the Skin Cancer AI Assistant backend.
"""
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.routers.predict import router as predict_router
from app.services.model_service import model_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("skin_cancer_ai.main")

settings = get_settings()

app = FastAPI(
    title="Skin Cancer AI Assistant API",
    description=(
        "Backend API for classifying skin lesion images as Benign or Malignant, "
        "with Gemini-generated explanations. For informational/educational use only — "
        "not a substitute for professional medical diagnosis."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(predict_router)


@app.on_event("startup")
async def startup_event():
    try:
        model_service.load()
    except Exception as exc:
        logger.error(f"FAILED TO LOAD MODEL ON STARTUP: {exc}")
        # App still starts so /health reports the issue clearly,
        # but /predict will return 503 until this is fixed.


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "model_loaded": model_service.is_loaded,
        "environment": settings.environment,
    }


@app.get("/")
async def root():
    return {
        "message": "Skin Cancer AI Assistant API is running.",
        "docs": "/docs",
        "health": "/health",
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred.", "error_code": "internal_error"},
    )