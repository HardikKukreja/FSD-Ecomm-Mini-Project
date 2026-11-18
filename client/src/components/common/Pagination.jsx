export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50"
      >
        Previous
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-primary-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
        >
          {p}
        </button>
      ))}
      {totalPages > 7 && page < totalPages - 2 && <span className="px-2">…</span>}
      {totalPages > 7 && (
        <button
          onClick={() => onPageChange(totalPages)}
          className={`w-9 h-9 rounded-lg text-sm font-medium ${totalPages === page ? 'bg-primary-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
        >
          {totalPages}
        </button>
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
}

