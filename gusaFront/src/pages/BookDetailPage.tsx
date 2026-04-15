import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProduct, searchProducts } from '../api/products';
import type { Product } from '../types/product';
import { useCart } from '../context/CartContext';
import { SUBJECT_COLORS } from '../constants/product';

const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { addItem } = useCart();
  const [book, setBook] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'detail' | 'toc' | 'review'>(
    'detail',
  );
  const [addedMsg, setAddedMsg] = useState(false);

  const handleAddToCart = () => {
    if (!book) return;
    addItem(book, quantity);
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2000);
  };

  const handleBuyNow = () => {
    if (!book) return;
    addItem(book, quantity);
    navigate('/checkout');
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setQuantity(1);
    setActiveTab('detail');

    fetchProduct(Number(id))
      .then((data) => {
        setBook(data);
        return searchProducts({ subject: data.subject, size: 5 });
      })
      .then((res) => {
        setRelated(res.content.filter((p) => p.id !== Number(id)).slice(0, 4));
      })
      .catch(() => setBook(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          fontSize: 15,
        }}
      >
        불러오는 중...
      </div>
    );
  }

  if (!book) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <span style={{ fontSize: 48 }}>📭</span>
        <p style={{ fontSize: 18, color: '#64748b', margin: 0 }}>
          상품을 찾을 수 없습니다.
        </p>
        <button
          onClick={() => navigate('/books')}
          style={{
            background: '#1a56db',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          교재 목록으로 돌아가기
        </button>
      </div>
    );
  }

  const color = SUBJECT_COLORS[book.subject] ?? '#64748b';
  const discountRate =
    book.originalPrice > 0
      ? Math.round(
          ((book.originalPrice - book.price) / book.originalPrice) * 100,
        )
      : 0;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* 브레드크럼 */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container" style={{ padding: '12px 24px' }}>
          <nav
            style={{ display: 'flex', gap: 8, fontSize: 13, color: '#64748b' }}
          >
            <a
              href="/"
              style={{ color: '#64748b', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#1a56db')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              홈
            </a>
            <span>›</span>
            <a
              href="/books"
              style={{ color: '#64748b', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#1a56db')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              교재
            </a>
            <span>›</span>
            <span
              style={{ color, fontWeight: 600, cursor: 'pointer' }}
              onClick={() => navigate(`/books?subject=${book.subject}`)}
            >
              {book.subject}
            </span>
            <span>›</span>
            <span style={{ color: '#1e293b', fontWeight: 500 }}>
              {book.title}
            </span>
          </nav>
        </div>
      </div>

      {/* 상품 상세 메인 */}
      <div className="container" style={{ padding: '40px 24px' }}>
        <div className="book-detail-grid">
          {/* 왼쪽: 책 커버 */}
          <div>
            <div
              style={{
                background: `linear-gradient(135deg, ${color}22, ${color}44)`,
                borderRadius: 16,
                height: 420,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: `1px solid ${color}33`,
              }}
            >
              {book.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    background: '#1a56db',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 6,
                  }}
                >
                  {book.badge}
                </span>
              )}
              {book.isNew && !book.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    background: '#10b981',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 6,
                  }}
                >
                  NEW
                </span>
              )}
              <span style={{ fontSize: 96 }}>📗</span>
            </div>
          </div>

          {/* 오른쪽: 상품 정보 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '4px 12px',
                  borderRadius: 100,
                  color,
                  background: `${color}15`,
                }}
              >
                {book.subject}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: '#64748b',
                  background: '#f1f5f9',
                  padding: '4px 12px',
                  borderRadius: 100,
                }}
              >
                {book.grade}
              </span>
            </div>

            <h1
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: '#1e293b',
                margin: 0,
                lineHeight: 1.3,
                letterSpacing: '-0.5px',
              }}
            >
              {book.title}
            </h1>

            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
              저자{' '}
              <span style={{ color: '#1e293b', fontWeight: 500 }}>
                {book.author}
              </span>
              &nbsp;·&nbsp;{book.publisher}
            </p>

            <div style={{ borderTop: '1px solid #e2e8f0' }} />

            {/* 가격 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {discountRate > 0 && (
                  <span
                    style={{
                      fontSize: 14,
                      color: '#ef4444',
                      fontWeight: 700,
                      background: '#fef2f2',
                      padding: '3px 8px',
                      borderRadius: 4,
                    }}
                  >
                    {discountRate}% 할인
                  </span>
                )}
                <span
                  style={{
                    fontSize: 14,
                    color: '#94a3b8',
                    textDecoration: 'line-through',
                  }}
                >
                  {book.originalPrice.toLocaleString()}원
                </span>
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: '#1a56db',
                  marginTop: 6,
                  letterSpacing: '-1px',
                }}
              >
                {book.price.toLocaleString()}
                <span style={{ fontSize: 20, fontWeight: 600, marginLeft: 4 }}>
                  원
                </span>
              </div>
            </div>

            {/* 도서 정보 */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '20px 24px',
              }}
            >
              {[
                { label: '출판일', value: book.publishedDate ?? '-' },
                { label: '페이지', value: book.pages ? `${book.pages}p` : '-' },
                { label: 'ISBN', value: book.isbn ?? '-' },
                { label: '출판사', value: book.publisher },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    gap: 16,
                    fontSize: 14,
                    padding: '6px 0',
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  <span style={{ width: 72, color: '#64748b', flexShrink: 0 }}>
                    {label}
                  </span>
                  <span style={{ color: '#1e293b' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* 수량 */}
            <div>
              <p
                style={{
                  margin: '0 0 8px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#475569',
                }}
              >
                수량
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    width: 40,
                    height: 40,
                    border: '1px solid #e2e8f0',
                    borderRight: 'none',
                    borderRadius: '8px 0 0 8px',
                    background: '#fff',
                    fontSize: 18,
                    cursor: 'pointer',
                    color: '#475569',
                  }}
                >
                  −
                </button>
                <div
                  style={{
                    width: 56,
                    height: 40,
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#1e293b',
                  }}
                >
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{
                    width: 40,
                    height: 40,
                    border: '1px solid #e2e8f0',
                    borderLeft: 'none',
                    borderRadius: '0 8px 8px 0',
                    background: '#fff',
                    fontSize: 18,
                    cursor: 'pointer',
                    color: '#475569',
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* 합계 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 0',
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <span style={{ fontSize: 14, color: '#64748b' }}>
                총 상품 금액 ({quantity}권)
              </span>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#1a56db' }}>
                {(book.price * quantity).toLocaleString()}원
              </span>
            </div>

            {/* 구매 버튼 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {addedMsg && (
                <div
                  style={{
                    padding: '10px 16px',
                    background: '#dcfce7',
                    border: '1px solid #86efac',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#166534',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  장바구니에 담겼습니다! 🛒
                </div>
              )}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleAddToCart}
                  style={{
                    flex: 1,
                    padding: '16px',
                    border: '2px solid #1a56db',
                    borderRadius: 10,
                    background: '#fff',
                    color: '#1a56db',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  장바구니 담기
                </button>
                <button
                  onClick={handleBuyNow}
                  style={{
                    flex: 1,
                    padding: '16px',
                    border: 'none',
                    borderRadius: 10,
                    background: '#1a56db',
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  구매하기
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 상세 탭 */}
        <div style={{ marginTop: 64 }}>
          <div
            style={{
              display: 'flex',
              borderBottom: '2px solid #e2e8f0',
              marginBottom: 32,
            }}
          >
            {(['detail', 'toc', 'review'] as const).map((key) => {
              const label =
                key === 'detail'
                  ? '상세 정보'
                  : key === 'toc'
                    ? '목차'
                    : '리뷰 (0)';
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    padding: '14px 28px',
                    border: 'none',
                    background: 'none',
                    fontSize: 15,
                    fontWeight: activeTab === key ? 700 : 500,
                    color: activeTab === key ? '#1a56db' : '#64748b',
                    borderBottom:
                      activeTab === key
                        ? '2px solid #1a56db'
                        : '2px solid transparent',
                    marginBottom: -2,
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {activeTab === 'detail' && (
            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: 32,
              }}
            >
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#1e293b',
                  margin: '0 0 16px',
                }}
              >
                책 소개
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: '#475569',
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                {book.description || '등록된 소개가 없습니다.'}
              </p>
            </div>
          )}

          {activeTab === 'toc' && (
            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: 32,
              }}
            >
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#1e293b',
                  margin: '0 0 20px',
                }}
              >
                목차
              </h3>
              {book.tableOfContents.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 14 }}>
                  등록된 목차가 없습니다.
                </p>
              ) : (
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  {book.tableOfContents.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '12px 16px',
                        borderRadius: 8,
                        background: i % 2 === 0 ? '#f8fafc' : '#fff',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: `${color}20`,
                          color,
                          fontSize: 12,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 14, color: '#1e293b' }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'review' && (
            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: 48,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 48 }}>✍️</span>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  color: '#64748b',
                  textAlign: 'center',
                }}
              >
                아직 등록된 리뷰가 없습니다.
                <br />첫 번째 리뷰를 남겨보세요!
              </p>
              <button
                style={{
                  marginTop: 8,
                  padding: '10px 24px',
                  background: '#1a56db',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                리뷰 작성하기
              </button>
            </div>
          )}
        </div>

        {/* 관련 상품 */}
        {related.length > 0 && (
          <div style={{ marginTop: 64, paddingBottom: 64 }}>
            <div className="section-header">
              <div>
                <h2 className="section-title">관련 교재</h2>
                <p className="section-sub">같은 과목의 다른 교재</p>
              </div>
              <a href="/books" className="section-more">
                전체보기 →
              </a>
            </div>

            <div className="grid-4">
              {related.map((r) => {
                const relColor = SUBJECT_COLORS[r.subject] ?? '#64748b';
                return (
                  <div
                    key={r.id}
                    className="book-card"
                    onClick={() => navigate(`/books/${r.id}`)}
                  >
                    <div
                      className="book-cover"
                      style={{
                        background: `linear-gradient(135deg, ${relColor}22, ${relColor}44)`,
                      }}
                    >
                      {r.badge && (
                        <span className="book-badge best">{r.badge}</span>
                      )}
                      {r.isNew && !r.badge && (
                        <span className="book-badge new">NEW</span>
                      )}
                      <span style={{ fontSize: 48 }}>📗</span>
                    </div>
                    <div className="book-body">
                      <div className="book-tags">
                        <span
                          className="book-tag"
                          style={{
                            color: relColor,
                            background: `${relColor}15`,
                          }}
                        >
                          {r.subject}
                        </span>
                        <span className="book-tag-grade">{r.grade}</span>
                      </div>
                      <p className="book-title">{r.title}</p>
                      <div className="book-footer">
                        <span className="book-price">
                          {r.price.toLocaleString()}원
                        </span>
                        <button
                          className="book-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          담기
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetailPage;
