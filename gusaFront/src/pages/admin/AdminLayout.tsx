import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import '@/styles/admin.css';

const pageTitles: Record<string, string> = {
  '/admin/dashboard': '대시보드',
  '/admin/members': '회원 목록',
  '/admin/orders': '주문 내역',
  '/admin/products': '상품 목록',
  '/admin/boards': '게시판 목록',
  '/admin/settings/pg': 'PG사 연동',
};

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = pageTitles[location.pathname] ?? '관리자';

  return (
    <div className="admin-wrap">
      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <AdminSidebar open={sidebarOpen} />

      <div className="admin-main">
        {/* 상단 바 */}
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            {/* 모바일 햄버거 */}
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="admin-hamburger"
            >
              ☰
            </button>
            <span className="admin-topbar-title">{title}</span>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-topbar-user">
              <span>관리자</span>
            </div>
          </div>
        </div>

        {/* 페이지 콘텐츠 */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
