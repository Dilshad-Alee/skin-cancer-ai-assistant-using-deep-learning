# Skin Cancer AI — Backend

AI-powered skin lesion classification with GradCAM explainability and Gemini AI narrative analysis.

## Stack

| Layer | Technology |
|---|---|
| API | FastAPI + Uvicorn |
| ML inference | TensorFlow / Keras |
| Explainability | GradCAM++ |
| AI narrative | Google Gemini 1.5 Flash |
| Container | Docker + Docker Compose |

---

## Quick Start

### 1. Place your model

```
backend/model/Improved_CNN.keras
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and add your GEMINI_API_KEY
```

### 3. (Optional) Set GradCAM layer

In `backend/.env`, set `GRADCAM_LAYER_NAME` to the name of your model's last
Conv2D layer. Leave as `conv2d_last` to auto-detect.

### 4. Start with Docker Compose

```bash
docker compose up --build
```

API is available at **http://localhost:8000**

Interactive docs: **http://localhost:8000/docs**

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | App info |
| `GET` | `/health` | Health check (model loaded?) |
| `POST` | `/api/v1/predict` | Upload image → get prediction |

### Example predict request

```bash
curl -X POST http://localhost:8000/api/v1/predict \
  -F "file=@/path/to/lesion.jpg"
```

### Example response

```json
{
  "label": "Melanoma",
  "confidence": 0.8712,
  "all_scores": {
    "Actinic Keratosis": 0.02,
    "Basal Cell Carcinoma": 0.04,
    "Benign Keratosis": 0.01,
    "Dermatofibroma": 0.005,
    "Melanoma": 0.8712,
    "Melanocytic Nevi": 0.05,
    "Vascular Lesion": 0.003
  },
  "gradcam_url": "/static/gradcam/abc123.png",
  "gemini_analysis": "The model identified features consistent with Melanoma..."
}
```

---

## Class Labels

The model is pre-configured for the HAM10000 dataset (7 classes). To use
different classes, edit `CLASS_LABELS` in `backend/app/services/model_service.py`.

---

## Project Structure

```
skin-cancer-ai/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app + lifespan
│   │   ├── config.py          # Settings (pydantic-settings)
│   │   ├── routers/
│   │   │   └── predict.py     # POST /api/v1/predict
│   │   ├── services/
│   │   │   ├── model_service.py   # TF model load + inference
│   │   │   ├── gradcam_service.py # GradCAM++ heatmap
│   │   │   └── gemini_service.py  # Gemini AI narrative
│   │   ├── models/
│   │   │   └── schemas.py     # Pydantic response models
│   │   └── utils/
│   │       └── image_utils.py # Preprocessing + base64 encode
│   ├── model/                 # ← place Improved_CNN.keras here
│   ├── static/gradcam/        # ← auto-generated heatmaps
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env                   # copy from .env.example
└── docker-compose.yml
```

---

## Development (without Docker)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # fill in your keys
uvicorn app.main:app --reload
```

---

> ⚠️ **Medical disclaimer**: This tool is for research and educational purposes only.
> It does not constitute medical advice. Always consult a qualified dermatologist.
