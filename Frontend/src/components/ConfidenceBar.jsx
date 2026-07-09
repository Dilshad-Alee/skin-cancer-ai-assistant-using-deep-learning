export default function ConfidenceBar({ label, score, isPrimary }) {
  const colorClass = isPrimary
    ? label.toLowerCase() === "malignant"
      ? "bg-red-500"
      : "bg-medical-green-500"
    : "bg-slate-300";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">{score}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}