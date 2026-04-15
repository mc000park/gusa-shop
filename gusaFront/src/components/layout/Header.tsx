import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getAccessToken, clearToken } from '../../utils/token';

const navItems = [
  { label: '초등교재', href: '/books?grade=elementary' },
  { label: '중등교재', href: '/books?grade=middle' },
  { label: '고등교재', href: '/books?grade=high' },
  { label: '베스트셀러', href: '/best' },
  { label: '신간도서', href: '/new' },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalCount } = useCart();
  const navigate = useNavigate();
  const isLoggedIn = !!getAccessToken();

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <header style={{ width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      {/* 상단 바 */}
      <div className="header-topbar">
        <div className="container">
          {isLoggedIn ? (
            <>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'inherit',
                  color: 'inherit',
                  padding: 0,
                }}
              >
                로그아웃
              </button>
              <span>|</span>
              <a href="/mypage">마이페이지</a>
            </>
          ) : (
            <>
              <a href="/login">로그인</a>
              <span>|</span>
              <a href="/signup">회원가입</a>
            </>
          )}
          <span>|</span>
          <a href="/cart">장바구니</a>
        </div>
      </div>

      {/* 로고 + 검색 */}
      <div className="header-main">
        <div className="container">
          {/* 로고 */}
          <a href="/" className="header-logo">
            <div className="header-logo-text">GUSA</div>
            <div className="header-logo-sub">교재 전문 쇼핑몰</div>
          </a>

          {/* 아이콘 */}
          <div className="header-icons">
            <a
              href="/cart"
              className="header-icon-link"
              style={{ position: 'relative' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {totalCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {totalCount > 99 ? '99+' : totalCount}
                </span>
              )}
            </a>
            <a href="/mypage" className="header-icon-link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </a>
          </div>

          {/* 햄버거 버튼 (모바일) */}
          <button
            className="hamburger"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="메뉴 열기"
          >
            <span
              style={{
                transform: mobileOpen
                  ? 'rotate(45deg) translate(5px, 5px)'
                  : undefined,
              }}
            />
            <span style={{ opacity: mobileOpen ? 0 : 1 }} />
            <span
              style={{
                transform: mobileOpen
                  ? 'rotate(-45deg) translate(5px, -5px)'
                  : undefined,
              }}
            />
          </button>
        </div>
      </div>

      {/* PC 카테고리 내비 */}
      <nav className="header-nav">
        <div className="container">
          <div className="header-nav-all">☰ 전체 카테고리</div>
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="header-nav-link">
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* 모바일 드로어 */}
      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </a>
        ))}
        {isLoggedIn ? (
          <button
            onClick={() => {
              setMobileOpen(false);
              handleLogout();
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'inherit',
              color: 'inherit',
              padding: '12px 20px',
              textAlign: 'left',
              width: '100%',
            }}
          >
            로그아웃
          </button>
        ) : (
          <>
            <a href="/login" onClick={() => setMobileOpen(false)}>
              로그인
            </a>
            <a href="/signup" onClick={() => setMobileOpen(false)}>
              회원가입
            </a>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
