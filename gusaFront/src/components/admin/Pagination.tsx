interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const Pagination = ({ page, totalPages, onChange }: Props) => {
  if (totalPages <= 1) return null;

  // 최대 5개 페이지 번호 표시
  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
  const end   = Math.min(totalPages, start + 5);
  const pages = Array.from({ length: end - start }, (_, i) => start + i);

  return (
    <div className="admin-pagination">
      <button
        className="page-btn"
        disabled={page === 0}
        onClick={() => onChange(0)}
      >
        «
      </button>
      <button
        className="page-btn"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        ‹
      </button>

      {pages.map((p) => (
        <button
          key={p}
          className={`page-btn${p === page ? ' active' : ''}`}
          onClick={() => onChange(p)}
        >
          {p + 1}
        </button>
      ))}

      <button
        className="page-btn"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
      <button
        className="page-btn"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(totalPages - 1)}
      >
        »
      </button>
    </div>
  );
};

export default Pagination;
