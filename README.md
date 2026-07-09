skin-cancer-ai/
│
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entrypoint
│   │   ├── config.py            # Environment configuration
│   │   ├── routers/
│   │   │   └── predict.py       # /api/predict endpoint
│   │   ├── services/
│   │   │   ├── model_service.py   # Keras model loader (singleton)
│   │   │   ├── gradcam_service.py # Grad-CAM heatmap generation
│   │   │   └── gemini_service.py  # Gemini API explanation
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic request/response schemas
│   │   └── utils/
│   │       └── image_utils.py   # Image validation & preprocessing
│   ├── model/
│   │   └── Improved_CNN.keras   # ← Place your trained model here
│   ├── static/gradcam/          # Auto-generated Grad-CAM heatmaps
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env                     # ← Create from .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api/client.js
│   │   ├── components/          # Header, UploadCard, ResultCard, etc.
│   │   ├── hooks/usePrediction.js
│   │   └── utils/               # pdfReport.js, storage.js
│   ├── index.html
│   ├── package.json
│   └── .env                     # ← Create from .env.example
│
└── docker-compose.yml

---

## ⚙️ Setup & Installation

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- A trained `.keras` model file
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/skin-cancer-ai-assistant.git
cd skin-cancer-ai-assistant
```

### 2. Place Your Trained Model

Copy your `Improved_CNN.keras` file into:
backend/model/Improved_CNN.keras

### 3. Configure Environment Variables

Create `backend/.env` by copying the example:

```bash
cp backend/.env.example backend/.env
```

Then open `backend/.env` and fill in your Gemini key:

```env
GEMINI_API_KEY=your_real_gemini_api_key_here
```

### 4. Run the Backend with Docker

```bash
docker compose up --build
```

Backend will be live at: `http://localhost:8000`
API docs (Swagger UI): `http://localhost:8000/docs`
Health check: `http://localhost:8000/health`

### 5. Run the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will be live at: `http://localhost:5173`

---

## 🔌 API Reference

### `POST /api/predict`

Accepts a skin lesion image and returns a classification result.

**Request:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | `File` | JPEG / PNG / WEBP image (max 10MB) |
| `include_gradcam` | `bool` | Whether to generate a Grad-CAM heatmap (default: true) |

**Response:**

```json
{
  "predicted_class": "Benign",
  "confidence": 81.24,
  "raw_scores": { "Benign": 81.24, "Malignant": 18.76 },
  "explanation": "AI-generated plain-language explanation...",
  "gradcam_url": "/static/gradcam/gradcam_abc123.png",
  "disclaimer": "This tool provides an AI-generated estimate...",
  "request_id": "745cc7e8551b",
  "model_version": "Improved_CNN_v1"
}
```

### `GET /health`

```json
{ "status": "ok", "model_loaded": true, "environment": "development" }
```

---

## 🧠 How It Works

1. User uploads a skin lesion image through the React frontend
2. Image is validated (type, size, integrity) by the FastAPI backend
3. Image is resized to 224×224 and normalized for model input
4. The CNN model returns class probabilities (Benign / Malignant)
5. Grad-CAM identifies and highlights the most influential image regions
6. Google Gemini generates a cautious, plain-language explanation
7. All results are returned to the frontend and displayed in a results card
8. User can download a PDF report or view their prediction history

---

## 🔒 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key | *(required)* |
| `MODEL_PATH` | Path to the `.keras` model file | `model/Improved_CNN.keras` |
| `IMAGE_SIZE` | Input image dimension | `224` |
| `CLASS_NAMES` | Comma-separated class labels | `Benign,Malignant` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173` |
| `MAX_UPLOAD_MB` | Maximum upload file size | `10` |

---

## ⚠️ Medical Disclaimer

This application is built for **educational and research purposes only**. It does not provide medical advice, diagnosis, or treatment. The AI model's output is an automated estimate based on visual pattern recognition and may be affected by image quality, lighting, and angle. Always consult a **qualified dermatologist or licensed healthcare professional** for any concerns about your skin.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
