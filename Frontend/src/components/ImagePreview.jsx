export default function ImagePreview({ imageUrl, onClear, disabled }) {
  if (!imageUrl) return null;

  return (
    <div className="animate-fade-in relative overflow-hidden rounded-2xl border border-slate-200">
      <img
        src={imageUrl}
        alt="Uploaded skin lesion preview"
        className="h-64 w-full object-cover sm:h-72"
      />
      {!disabled && (
        <button
          onClick={onClear}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:bg-white"
          aria-label="Remove image"
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
      )}
    </div>
  );
}