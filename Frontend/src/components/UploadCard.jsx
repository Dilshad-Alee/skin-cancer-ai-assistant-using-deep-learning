import { useCallback, useRef, useState } from "react";
import ImagePreview from "./ImagePreview";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;

export default function UploadCard({ onFileSelected, onAnalyze, isLoading, selectedFile, previewUrl, onClear }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState(null);

  const validateAndSet = useCallback(
    (file) => {
      setLocalError(null);
      if (!file) return;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setLocalError("Please upload a JPEG, PNG, or WEBP image.");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setLocalError(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      validateAndSet(file);
    },
    [validateAndSet]
  );

  return (
    <div className="card animate-slide-up p-6 sm:p-8">
      <h2 className="text-lg font-bold text-slate-900">Upload a Skin Lesion Image</h2>
      <p className="mt-1 text-sm text-slate-500">
        Use a clear, well-lit, close-up photo for the most reliable result.
      </p>

      <div className="mt-5">
        {previewUrl ? (
          <ImagePreview imageUrl={previewUrl} onClear={onClear} disabled={isLoading} />
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex h-64 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 text-center transition-colors sm:h-72 ${
              isDragging
                ? "border-medical-blue-500 bg-medical-blue-50"
                : "border-slate-300 bg-slate-50 hover:border-medical-blue-400 hover:bg-medical-blue-50/40"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-medical-blue-100 text-medical-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V9m0 0l-3 3m3-3l3 3M6 18.75A2.25 2.25 0 013.75 16.5v-9A2.25 2.25 0 016 5.25h12A2.25 2.25 0 0120.25 7.5v9a2.25 2.25 0 01-2.25 2.25H6z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-700">
                Drag &amp; drop an image, or click to browse
              </p>
              <p className="mt-1 text-xs text-slate-400">JPEG, PNG, or WEBP — up to {MAX_SIZE_MB}MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={(e) => validateAndSet(e.target.files?.[0])}
            />
          </div>
        )}

        {localError && <p className="mt-3 text-sm font-medium text-red-600">{localError}</p>}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onAnalyze}
          disabled={!selectedFile || isLoading}
          className="btn-primary flex-1"
        >
          {isLoading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing...
            </>
          ) : (
            "Analyze Image"
          )}
        </button>
        {selectedFile && !isLoading && (
          <button onClick={onClear} className="btn-secondary">
            Clear
          </button>
        )}
      </div>
    </div>
  );
}