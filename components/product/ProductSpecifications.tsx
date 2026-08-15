export function ProductSpecifications({
  specifications,
}: {
  specifications: Array<{ name: string; value: string }>;
}) {
  return (
    <section className="border border-gray-200 bg-white p-4 sm:p-5">
      <h2 className="border-b border-gray-200 pb-3 text-lg font-bold text-gray-900">
        Thông số kỹ thuật
      </h2>
      {specifications.length ? (
        <dl className="mt-4 overflow-hidden border border-gray-200">
          {specifications.map((spec, index) => (
            <div
              className={`grid grid-cols-[minmax(110px,0.7fr)_1.3fr] gap-3 px-3 py-2.5 text-sm ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
              key={`${spec.name}-${index}`}
            >
              <dt className="font-semibold text-gray-600">{spec.name}</dt>
              <dd className="text-gray-900">{spec.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-4 text-sm text-gray-500">
          Thông số đang được cập nhật.
        </p>
      )}
    </section>
  );
}
