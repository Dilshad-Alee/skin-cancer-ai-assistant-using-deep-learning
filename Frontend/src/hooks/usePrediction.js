/**
 * Custom hook encapsulating prediction state, API calls, and history persistence.
 */
import { useCallback, useState } from "react";
import { predictImage, ApiError } from "../api/client";
import { addHistoryItem } from "../utils/storage";

export function usePrediction() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runPrediction = useCallback(async (file, includeGradcam = true) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await predictImage(file, includeGradcam);
      setResult(data);
      addHistoryItem({
        request_id: data.request_id,
        predicted_class: data.predicted_class,
        confidence: data.confidence,
      });
      return data;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "An unexpected error occurred. Please try again.";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { isLoading, result, error, runPrediction, reset };
}