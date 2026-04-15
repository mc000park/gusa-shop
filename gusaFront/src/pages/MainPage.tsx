import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchProducts } from '../api/products';
import type { Product } from '../types/product';
import { SUBJECT_COLORS } from '../constants/product';

const categories = [
  {
    grade: '초등',
    color: '#3b82f6',
    bg: '#eff6ff',
    icon: '📚',
    desc: '1학년 ~ 6학년',
  },
  {
    grade: '중등',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    icon: '📖',
    desc: '중1 ~ 중3',
  },
  {
    grade: '고등',
    color: '#ef4444',
    bg: '#fef2f2',
    icon: '🎓',
    desc: '고1 ~ 고3 · 수능',
  },
];

const BookCard = ({ book }: { book: Product }) => {
  const navigate = useNavigate();
  const color = SUBJECT_COLORS[book.subject] ?? '#64748b';
  return (
    <div
      className="book-card"
      onClick={() => navigate(`/books/${book.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div
        className="book-cover"
        style={{
          background: `linear-gradient(135deg, ${color}22, ${color}44)`,
        }}
      >
        {book.badge && <span className="book-badge best">{book.badge}</span>}
        {book.isNew && !book.badge && (
          <span className="book-badge new">NEW</span>
        )}
        <span style={{ fontSize: 48 }}>📗</span>
      </div>
      <div className="book-body">
        <div className="book-tags">
          <span
            className="book-tag"
            style={{ color, background: `${color}15` }}
          >
            {book.subject}
          </span>
          <span className="book-tag-grade">{book.grade}</span>
        </div>
        <p className="book-title">{book.title}</p>
        <div className="book-footer">
          <span className="book-price">{book.price.toLocaleString()}원</span>
          <button className="book-btn" onClick={(e) => e.stopPropagation()}>
            담기
          </button>
        </div>
      </div>
    </div>
  );
};

const MainPage = () => {
  const [bestBooks, setBestBooks] = useState<Product[]>([]);
  const [newBooks, setNewBooks] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      searchProducts({ hasBadge: true, size: 4 }),
      searchProducts({ isNew: true, size: 4 }),
    ])
      .then(([best, newItems]) => {
        setBestBooks(best.content);
        setNewBooks(newItems.content);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* 히어로 배너 */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-badge">🎉 2026년 신학기 교재 출시</span>
            <h1 className="hero-title">
              초·중·고 교재를
              <br />한 곳에서 편리하게
            </h1>
            <p className="hero-desc">
              검증된 교재로 내 아이의 실력을 키워보세요.
              <br />
              학년별·과목별 맞춤 교재를 추천해 드립니다.
            </p>
            <div className="hero-buttons">
              <a href="/books" className="hero-btn-primary">
                교재 둘러보기
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 학년별 카테고리 */}
      <section className="section-wrap">
        <div className="category-title">
          <h2>학년별 교재</h2>
          <p>원하는 학년을 선택하세요</p>
        </div>
        <div className="grid-3">
          {categories.map((cat) => (
            <a
              key={cat.grade}
              href={`/books?grade=${cat.grade}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  background: cat.bg,
                  border: `2px solid ${cat.color}22`,
                  borderRadius: 16,
                  padding: '32px 28px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 32px ${cat.color}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span
                    style={{
                      fontSize: 36,
                      background: `${cat.color}20`,
                      width: 64,
                      height: 64,
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {cat.icon}
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: cat.color,
                      }}
                    >
                      {cat.grade}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      {cat.desc}
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 프로모션 배너 */}
      <div className="promo-wrap">
        <div className="promo-banner">
          <div className="promo-text">
            <div className="promo-label">🔥 신학기 특가 이벤트</div>
            <div className="promo-title">3권 이상 구매 시 10% 추가 할인</div>
          </div>
          <a href="/event" className="promo-btn">
            이벤트 보기 →
          </a>
        </div>
      </div>

      {/* 베스트셀러 */}
      <section className="section-wrap pb-only">
        <div className="section-header">
          <div>
            <h2 className="section-title">베스트셀러</h2>
            <p className="section-sub">지금 가장 많이 팔리는 교재</p>
          </div>
          <a href="/books" className="section-more">
            전체보기 →
          </a>
        </div>

        {loading ? (
          <div className="grid-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: '#e2e8f0',
                  borderRadius: 16,
                  height: 260,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        ) : bestBooks.length === 0 ? (
          <p
            style={{
              color: '#94a3b8',
              fontSize: 14,
              textAlign: 'center',
              padding: '32px 0',
            }}
          >
            등록된 베스트셀러가 없습니다.
          </p>
        ) : (
          <div className="grid-4">
            {bestBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* 신간 도서 */}
      <section className="section-wrap pb-only" style={{ paddingBottom: 64 }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">신간 도서</h2>
            <p className="section-sub">새로 출시된 최신 교재</p>
          </div>
          <a href="/books" className="section-more">
            전체보기 →
          </a>
        </div>

        {loading ? (
          <div className="grid-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: '#e2e8f0',
                  borderRadius: 16,
                  height: 260,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        ) : newBooks.length === 0 ? (
          <p
            style={{
              color: '#94a3b8',
              fontSize: 14,
              textAlign: 'center',
              padding: '32px 0',
            }}
          >
            등록된 신간 도서가 없습니다.
          </p>
        ) : (
          <div className="grid-4">
            {newBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MainPage;
