import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

interface MenuItem {
  icon: string;
  label: string;
  path?: string;
  children?: { label: string; path: string }[];
}

const menuItems: MenuItem[] = [
  { icon: '📊', label: '대시보드', path: '/admin/dashboard' },
  {
    icon: '👥',
    label: '회원 관리',
    children: [{ label: '회원 목록', path: '/admin/members' }],
  },
  {
    icon: '📦',
    label: '주문 관리',
    children: [{ label: '주문 내역', path: '/admin/orders' }],
  },
  {
    icon: '📚',
    label: '상품 관리',
    children: [{ label: '상품 목록', path: '/admin/products' }],
  },
  {
    icon: '📋',
    label: '게시판 관리',
    children: [{ label: '게시판 목록', path: '/admin/boards' }],
  },
  {
    icon: '⚙️',
    label: '환경설정',
    children: [{ label: '쇼핑몰 설정', path: '/admin/settings/shop' }],
  },
];

const AdminSidebar = ({ open = false }: { open?: boolean }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>(['']);

  const toggle = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (item: MenuItem) =>
    item.children?.some((c) => location.pathname.startsWith(c.path));

  return (
    <aside className={`admin-sidebar${open ? ' open' : ''}`}>
      <div className="sidebar-logo">
        <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
          <div className="sidebar-logo-text">GUSA Admin</div>
          <div className="sidebar-logo-sub">관리자 페이지</div>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.label} className="sidebar-item">
            {item.path ? (
              <Link
                to={item.path}
                className={`sidebar-menu-btn${isActive(item.path) ? ' active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                }}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </Link>
            ) : (
              <>
                <button
                  className={`sidebar-menu-btn${openMenus.includes(item.label) ? ' open' : ''}${isParentActive(item) ? ' active' : ''}`}
                  onClick={() => toggle(item.label)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                  <span className="menu-arrow">▼</span>
                </button>
                <div
                  className={`sidebar-sub${openMenus.includes(item.label) ? ' open' : ''}`}
                >
                  {item.children?.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={isActive(child.path) ? 'active' : ''}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}

        <hr className="sidebar-divider" />

        <button
          className="sidebar-menu-btn"
          onClick={() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/admin/login';
          }}
        >
          <span className="menu-label">로그아웃</span>
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
