export default function RouteLoading({
  title = "Loading desk",
  detail = "Pulling the latest feed and assembling the page.",
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <div className="page-frame page-content">
      <div className="soft-panel rounded-[1.8rem] p-6 sm:p-8">
        <p className="text-[0.68rem] uppercase tracking-[0.28em] text-black/40">Loading</p>
        <h1 className="mt-3 font-serif text-4xl text-[var(--color-ink-strong)]">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/58 sm:text-base">{detail}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="soft-panel overflow-hidden rounded-[1.4rem]">
              <div className="skeleton h-44 w-full" />
              <div className="space-y-3 p-5">
                <div className="skeleton h-3 w-20" />
                <div className="skeleton h-6 w-full" />
                <div className="skeleton h-6 w-4/5" />
                <div className="skeleton h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
