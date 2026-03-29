"use client";

function safeFilename(name: string): string {
  const s = name.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "");
  return s || "export";
}

/** Save any JSON-serializable value as a downloaded .json file */
export function downloadJson(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeFilename(filename)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportButton({
  data,
  filename,
  label = "Download JSON",
}: {
  data: unknown;
  filename: string;
  /** Button text (default visible for accessibility and clarity) */
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => downloadJson(data, filename)}
      className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold border-2 border-[#1a1a2e] bg-white text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white transition-colors flex items-center gap-2 shadow-sm"
      title="Download the current result set as a JSON file"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M8 2v8m0 0L5 7m3 3l3-3" />
        <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" />
      </svg>
      {label}
    </button>
  );
}
