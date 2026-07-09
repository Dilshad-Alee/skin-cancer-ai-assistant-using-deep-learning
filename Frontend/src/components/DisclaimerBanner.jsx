export default function DisclaimerBanner() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="mt-0.5 h-5 w-5 flex-shrink-0"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m0 3.75h.008M10.29 3.86l-8.18 14.18A1.5 1.5 0 003.5 20.5h17a1.5 1.5 0 001.39-2.46L13.71 3.86a1.5 1.5 0 00-2.42 0z"
        />
      </svg>
      <p>
        <span className="font-semibold">Important: </span>
        This tool provides an AI-generated estimate for informational and educational
        purposes only. It is <span className="font-semibold">not a medical diagnosis</span>.
        Always consult a licensed dermatologist or healthcare professional for any
        concerns about your skin.
      </p>
    </div>
  );
}