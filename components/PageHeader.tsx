export default function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-[#e2e2e2] bg-white px-8 py-6">
      <h1
        className="font-bold text-[#1a1a2e]"
        style={{ fontFamily: "Georgia, serif", fontSize: "26px" }}
      >
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-gray-500" style={{ fontSize: "14px" }}>
          {description}
        </p>
      )}
    </div>
  );
}
