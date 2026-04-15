import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchProducts } from '../api/products';
import type { Product } from '../types/product';
import { useCart } from '../context/CartContext';
import { SUBJECT_COLORS, SUBJECTS, GRADE_GROUPS } from '../constants/product';

const PAGE_SIZE = 12;

const BookPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addItem } = useCart();
  const [addedId, setAddedId] = useState<number | null>(null);

  const handleAddToCart = (e: React.MouseEvent, book: Product) => {
    e.stopPropagation();
    addItem(book, 1);
    setAddedId(book.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeSubject, setActiveSubject] = useState(() => {
    const s = searchParams.get('subject') ?? '';
    return SUBJECTS.includes(s) ? s : '전체';
  });
  const [activeGrade, setActiveGrade] = useState(() => {
    const g = searchParams.get('grade') ?? '';
    return GRADE_GROUPS.includes(g) ? g : '전체';
  });
  const [sort, setSort] = useState<'default' | 'price_asc' | 'price_desc' | 'discount'>('default');
  const [page, setPage] = useState(0);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 검색어 디바운스
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  // 필터/페이지 변경 시 재조회
  useEffect(() => {
    load();
  }, [debouncedSearch, activeSubject, activeGrade, page]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await searchProducts({
        keyword: debouncedSearch || undefined,
        subject: activeSubject !== '전체' ? activeSubject : undefined,
        grade: activeGrade !== '전체' ? activeGrade : undefined,
        page,
        size: PAGE_SIZE,
      });
      setProducts(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch {
      setError('상품 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubject = (s: string) => { setActiveSubject(s); setPage(0); };
  const handleGrade   = (g: string) => { setActiveGrade(g);   setPage(0); };

  const sorted = [...products].sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    if (sort === 'discount') {
      const rA = (a.originalPrice - a.price) / a.originalPrice;
      const rB = (b.originalPrice - b.price) / b.originalPrice;
      return rB - rA;
    }
    return 0;
  });

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {/* 페이지 헤더 + 과목 탭 */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container" style={{ padding: '32px 24px 0' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            교재 목록
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px' }}>
            총 <strong style={{ color: '#1a56db' }}>{totalElements}</strong>개의 교재
          </p>

          <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
            {SUBJECTS.map((s) => {
              const color = SUBJECT_COLORS[s];
              const isActive = activeSubject === s;
              return (
                <button
                  key={s}
                  onClick={() => handleSubject(s)}
                  style={{
                    padding: '10px 18px',
                    border: 'none',
                    borderRadius: '8px 8px 0 0',
                    background: isActive ? (color ?? '#1a56db') : 'transparent',
                    color: isActive ? '#fff' : '#64748b',
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    borderBottom: isActive ? `2px solid ${color ?? '#1a56db'}` : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '24px' }}>

        {/* 검색 + 필터 바 */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex', alignItems: 'center',
              background: '#fff', border: '1.5px solid #e2e8f0',
              borderRadius: 10, padding: '0 14px', gap: 8,
              flex: '1 1 240px', minWidth: 0,
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: 16 }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="교재명, 저자 검색"
              style={{ border: 'none', outline: 'none', fontSize: 14, color: '#1e293b', background: 'transparent', padding: '11px 0', width: '100%' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16, padding: 0 }}>✕</button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {GRADE_GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => handleGrade(g)}
                style={{
                  padding: '9px 16px',
                  border: `1.5px solid ${activeGrade === g ? '#1a56db' : '#e2e8f0'}`,
                  borderRadius: 8,
                  background: activeGrade === g ? '#eff6ff' : '#fff',
                  color: activeGrade === g ? '#1a56db' : '#64748b',
                  fontSize: 13,
                  fontWeight: activeGrade === g ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {g}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff', fontSize: 13, color: '#475569', cursor: 'pointer', outline: 'none' }}
          >
            <option value="default">기본순</option>
            <option value="price_asc">낮은 가격순</option>
            <option value="price_desc">높은 가격순</option>
            <option value="discount">할인율순</option>
          </select>
        </div>

        {/* 에러 */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* 로딩 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: '#94a3b8', fontSize: 15 }}>
            불러오는 중...
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: '#94a3b8', fontSize: 15 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            검색 결과가 없습니다.
          </div>
        ) : (
          <>
            {/* 상품 그리드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {sorted.map((book) => {
                const color = SUBJECT_COLORS[book.subject] ?? '#64748b';
                const discountRate = book.originalPrice > 0
                  ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
                  : 0;

                return (
                  <div
                    key={book.id}
                    onClick={() => navigate(`/books/${book.id}`)}
                    style={{
                      background: '#fff', borderRadius: 16,
                      border: '1px solid #e2e8f0', overflow: 'hidden',
                      cursor: 'pointer', transition: 'transform 0.18s, box-shadow 0.18s',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
                    }}
                  >
                    {/* 커버 */}
                    <div style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)`, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {book.badge && (
                        <span style={{ position: 'absolute', top: 10, left: 10, background: '#1a56db', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 5 }}>
                          {book.badge}
                        </span>
                      )}
                      {book.isNew && !book.badge && (
                        <span style={{ position: 'absolute', top: 10, left: 10, background: '#10b981', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 5 }}>
                          NEW
                        </span>
                      )}
                      {discountRate > 0 && (
                        <span style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 5 }}>
                          -{discountRate}%
                        </span>
                      )}
                      <span style={{ fontSize: 56 }}>📗</span>
                    </div>

                    {/* 본문 */}
                    <div style={{ padding: '14px 16px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 100, color, background: `${color}15` }}>
                          {book.subject}
                        </span>
                        <span style={{ fontSize: 11, color: '#64748b', background: '#f1f5f9', padding: '3px 8px', borderRadius: 100 }}>
                          {book.grade}
                        </span>
                      </div>

                      <p style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 4px', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {book.title}
                      </p>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 10px' }}>
                        {book.author} · {book.publisher}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'line-through', display: 'block', lineHeight: 1.2 }}>
                            {book.originalPrice.toLocaleString()}원
                          </span>
                          <span style={{ fontSize: 17, fontWeight: 900, color: '#1a56db', letterSpacing: '-0.5px' }}>
                            {book.price.toLocaleString()}
                            <span style={{ fontSize: 12, fontWeight: 600, marginLeft: 2 }}>원</span>
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleAddToCart(e, book)}
                          style={{ padding: '7px 14px', background: addedId === book.id ? '#10b981' : '#1a56db', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                        >
                          {addedId === book.id ? '담김 ✓' : '담기'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 40 }}>
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{ padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', color: page === 0 ? '#cbd5e1' : '#475569', cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: 13 }}
                >
                  ‹ 이전
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    style={{
                      padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: i === page ? 700 : 400, cursor: 'pointer',
                      border: `1px solid ${i === page ? '#1a56db' : '#e2e8f0'}`,
                      background: i === page ? '#1a56db' : '#fff',
                      color: i === page ? '#fff' : '#475569',
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  style={{ padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', color: page === totalPages - 1 ? '#cbd5e1' : '#475569', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer', fontSize: 13 }}
                >
                  다음 ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookPage;
