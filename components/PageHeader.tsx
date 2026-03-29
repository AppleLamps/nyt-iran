export default function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="page-frame page-section border-b border-black/10 bg-[rgba(255,255,255,0.55)] py-6 sm:py-8">
      <p className="text-[0.68rem] uppercase tracking-[0.28em] text-black/40">Reporting Desk</p>
      <h1
        className="mt-2 font-bold text-[var(--color-ink-strong)]"
        style={{ fontFamily: "Georgia, serif", fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: "0.95" }}
      >
        {title}
      </h1>
      {description && (
        <p className="mt-3 max-w-3xl text-sm leading-6 text-black/58 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
