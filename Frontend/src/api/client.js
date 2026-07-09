/**
 * Centralized API client for talking to the FastAPI backend.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Sends an image file to the backend /api/predict endpoint.
 * @param {File} file - the image file selected/dropped by the user
 * @param {boolean} includeGradcam - whether to request a Grad-CAM heatmap
 * @returns {Promise<object>} parsed prediction response
 */
export async function predictImage(file, includeGradcam = true) {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_BASE_URL}/api/predict?include_gradcam=${includeGradcam}`;

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      body: formData,
    });
  } catch (networkErr) {
    throw new ApiError(
      "Could not reach the server. Please check your internet connection and try again.",
      0
    );
  }

  if (!response.ok) {
    let detail = "Something went wrong while analyzing the image.";
    try {
      const errorBody = await response.json();
      if (errorBody?.detail) detail = errorBody.detail;
    } catch {
      // response wasn't JSON; keep default message
    }
    throw new ApiError(detail, response.status);
  }

  return response.json();
}

/**
 * Builds the full absolute URL for an asset (e.g. Grad-CAM image) returned
 * by the backend as a relative path like "/static/gradcam/xyz.png".
 */
export function resolveAssetUrl(relativePath) {
  if (!relativePath) return null;
  if (relativePath.startsWith("http")) return relativePath;
  return `${API_BASE_URL}${relativePath}`;
}

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) return { status: "error", model_loaded: false };
    return res.json();
  } catch {
    return { status: "unreachable", model_loaded: false };
  }
}