"use client";

export default function RouteError({
  error,
  reset,
  title = "This desk hit a loading problem",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}) {
  return (
    <div className="page-frame page-content">
      <div className="rounded-[1.8rem] border border-red-200 bg-red-50 p-6 sm:p-8">
        <p className="text-[0.68rem] uppercase tracking-[0.28em] text-red-700">Route error</p>
        <h1 className="mt-3 font-serif text-4xl text-red-900">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-red-800/80 sm:text-base">
          {error.message || "The page could not be assembled."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-red-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
