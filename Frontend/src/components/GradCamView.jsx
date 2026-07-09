import { useState } from "react";
import { resolveAssetUrl } from "../api/client";

export default function GradCamView({ gradcamUrl }) {
  const [showHeatmap, setShowHeatmap] = useState(true);

  if (!gradcamUrl) return null;

  const fullUrl = resolveAssetUrl(gradcamUrl);

  return (
    <div className="animate-fade-in mt-5 border-t border-slate-100 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Grad-CAM Visualization</h4>
          <p className="text-xs text-slate-500">
            Highlighted regions show what most influenced the AI's decision
          </p>
        </div>
        <button
          onClick={() => setShowHeatmap((s) => !s)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          {showHeatmap ? "Hide" : "Show"}
        </button>
      </div>
      {showHeatmap && (
        <img
          src={fullUrl}
          alt="Grad-CAM heatmap overlay"
          className="w-full rounded-xl border border-slate-200"
        />
      )}
    </div>
  );
}