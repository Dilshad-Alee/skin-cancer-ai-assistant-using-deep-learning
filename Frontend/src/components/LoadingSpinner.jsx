export default function LoadingSpinner({ label = "Analyzing image..." }) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center gap-4 py-10">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-medical-blue-100 border-t-medical-blue-600" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6 text-medical-blue-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold text-slate-700">{label}</p>
        <p className="mt-1 text-sm text-slate-400">This usually takes a few seconds</p>
      </div>
    </div>
  );
}