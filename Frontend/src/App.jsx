import { useCallback, useEffect, useState } from "react";
import Header from "./components/Header";
import UploadCard from "./components/UploadCard";
import ResultCard from "./components/ResultCard";
import ExplanationCard from "./components/ExplanationCard";
import HistoryPanel from "./components/HistoryPanel";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorBanner from "./components/ErrorBanner";
import DisclaimerBanner from "./components/DisclaimerBanner";
import { usePrediction } from "./hooks/usePrediction";
import { checkHealth } from "./api/client";

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);

  const { isLoading, result, error, runPrediction, reset } = usePrediction();

  useEffect(() => {
    checkHealth().then(setBackendStatus);
  }, []);

  const handleFileSelected = useCallback(
    (file) => {
      reset();
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    },
    [reset]
  );

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    reset();
  }, [previewUrl, reset]);

  const handleAnalyze = useCallback(() => {
    if (selectedFile) {
      runPrediction(selectedFile, true);
    }
  }, [selectedFile, runPrediction]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <DisclaimerBanner />
        </div>

        {backendStatus && !backendStatus.model_loaded && (
          <div className="mb-6">
            <ErrorBanner message="The AI model is currently unavailable on the server. Predictions may fail until it's ready." />
          </div>
        )}

        {error && (
          <div className="mb-6">
            <ErrorBanner message={error} onDismiss={reset} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <UploadCard
              onFileSelected={handleFileSelected}
              onAnalyze={handleAnalyze}
              onClear={handleClear}
              isLoading={isLoading}
              selectedFile={selectedFile}
              previewUrl={previewUrl}
            />
            <HistoryPanel key={result?.request_id || "history"} />
          </div>

          <div className="space-y-6">
            {isLoading && (
              <div className="card p-6 sm:p-8">
                <LoadingSpinner />
              </div>
            )}

            {!isLoading && result && (
              <>
                <ResultCard result={result} previewUrl={previewUrl} />
                <ExplanationCard explanation={result.explanation} />
              </>
            )}

            {!isLoading && !result && (
              <div className="card flex h-full min-h-[300px] flex-col items-center justify-center p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-medical-blue-50 text-medical-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-7 w-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                    />
                  </svg>
                </div>
                <p className="mt-4 font-semibold text-slate-700">
                  Your analysis will appear here
                </p>
                <p className="mt-1 max-w-xs text-sm text-slate-400">
                  Upload a skin lesion image and click "Analyze Image" to get started.
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-16 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          <p>
            Skin Cancer AI Assistant — for informational and educational purposes only.
            Not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </footer>
      </main>
    </div>
  );
}