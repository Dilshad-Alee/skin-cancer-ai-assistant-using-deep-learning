import { useEffect, useState } from "react";
import { clearHistory, getHistory, removeHistoryItem } from "../utils/storage";

export default function HistoryPanel() {
  const [history, setHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Refresh history whenever the panel is opened
  useEffect(() => {
    if (isOpen) setHistory(getHistory());
  }, [isOpen]);

  const handleClearAll = () => {
    clearHistory();
    setHistory([]);
  };

  const handleRemove = (id) => {
    setHistory(removeHistoryItem(id));
  };

  return (
    <div className="card p-6 sm:p-8">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Prediction History</h3>
            <p className="text-xs text-slate-500">{history.length} saved on this device</p>
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="animate-fade-in mt-5">
          {history.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No predictions yet. Your analysis history will appear here.
            </p>
          ) : (
            <div className="space-y-2">
              {history.map((item) => {
                const isMalignant = item.predicted_class?.toLowerCase() === "malignant";
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isMalignant ? "bg-red-500" : "bg-medical-green-500"
                          }`}
                        />
                        <span className="text-sm font-semibold text-slate-700">
                          {item.predicted_class}
                        </span>
                        <span className="text-xs text-slate-400">{item.confidence}%</span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      aria-label="Remove from history"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}

              <button
                onClick={handleClearAll}
                className="mt-3 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
              >
                Clear All History
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}