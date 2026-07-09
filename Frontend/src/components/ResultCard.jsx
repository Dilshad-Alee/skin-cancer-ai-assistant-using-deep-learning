import { useRef } from "react";
import ConfidenceBar from "./ConfidenceBar";
import GradCamView from "./GradCamView";
import { generatePdfReport } from "../utils/pdfReport";

export default function ResultCard({ result, previewUrl }) {
  const cardRef = useRef(null);
  if (!result) return null;

  const { predicted_class, confidence, raw_scores, gradcam_url, request_id, disclaimer, explanation } =
    result;
  const isMalignant = predicted_class?.toLowerCase() === "malignant";

  const handleDownloadPdf = () => {
    generatePdfReport({
      predictedClass: predicted_class,
      confidence,
      rawScores: raw_scores,
      explanation,
      disclaimer,
      requestId: request_id,
      imageDataUrl: previewUrl,
    });
  };

  return (
    <div ref={cardRef} className="card animate-slide-up overflow-hidden p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Prediction Result
          </p>
          <div className="mt-1 flex items-center gap-2">
            <h3
              className={`text-2xl font-extrabold sm:text-3xl ${
                isMalignant ? "text-red-600" : "text-medical-green-700"
              }`}
            >
              {predicted_class}
            </h3>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                isMalignant
                  ? "bg-red-100 text-red-700"
                  : "bg-medical-green-100 text-medical-green-700"
              }`}
            >
              {confidence}% confidence
            </span>
          </div>
        </div>

        <button
          onClick={handleDownloadPdf}
          className="btn-secondary text-sm"
          title="Download PDF report"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          Download Report
        </button>
      </div>

      {isMalignant && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="mt-0.5 h-4 w-4 flex-shrink-0"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          This result suggests features that may need prompt attention. Please consult a
          dermatologist as soon as possible for a professional evaluation.
        </div>
      )}

      <div className="mt-6 space-y-4">
        {raw_scores &&
          Object.entries(raw_scores).map(([label, score]) => (
            <ConfidenceBar
              key={label}
              label={label}
              score={score}
              isPrimary={label === predicted_class}
            />
          ))}
      </div>

      <GradCamView gradcamUrl={gradcam_url} />

      <p className="mt-5 text-xs text-slate-400">Report ID: {request_id}</p>
    </div>
  );
}