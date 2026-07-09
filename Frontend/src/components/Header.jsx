export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-medical-blue-600 to-medical-green-600 text-white shadow-sm">
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
                d="M12 2a4 4 0 014 4v1a4 4 0 01-1.17 2.83M12 2a4 4 0 00-4 4v1a4 4 0 001.17 2.83M9 17a3 3 0 106 0v-1a3 3 0 00-3-3 3 3 0 00-3 3v1z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-900 sm:text-xl">
              Skin Cancer AI Assistant
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              AI-powered lesion screening &amp; education tool
            </p>
          </div>
        </div>

        <span className="hidden rounded-full bg-medical-green-50 px-3 py-1 text-xs font-semibold text-medical-green-700 sm:inline-block">
          Research / Informational Use
        </span>
      </div>
    </header>
  );
}