import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PrivateRoute from './PrivateRoute';

const AdminLayout = lazy(() => import('../pages/admin/AdminLayout'));
const MainPage = lazy(() => import('../pages/MainPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const SignupConsentPage = lazy(() => import('../pages/SignupConsentPage'));
const SignupPage = lazy(() => import('../pages/SignupPage'));
const AdminLoginPage = lazy(() => import('../pages/admin/AdminLoginPage'));
const BookPage = lazy(() => import('../pages/BookPage'));
const BookDetailPage = lazy(() => import('../pages/BookDetailPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const OrderCompletePage = lazy(() => import('../pages/OrderCompletePage'));
const MyPage = lazy(() => import('../pages/MyPage'));
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage'));
const MembersPage = lazy(() => import('../pages/admin/MembersPage'));
const OrdersPage = lazy(() => import('../pages/admin/OrdersPage'));
const ProductsPage = lazy(() => import('../pages/admin/ProductsPage'));
const BoardsPage = lazy(() => import('../pages/admin/BoardsPage'));
const SettingsPage = lazy(() => import('../pages/admin/SettingsPage'));

const PageFallback = () => (
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

const Router = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* 헤더/푸터 없는 페이지 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupConsentPage />} />
          <Route path="/signup/form" element={<SignupPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* 일반 사용자 페이지 */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<MainPage />} />
                  <Route path="/books" element={<BookPage />} />
                  <Route path="/books/:id" element={<BookDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route
                    path="/order/complete"
                    element={<OrderCompletePage />}
                  />
                  <Route path="/mypage" element={<MyPage />} />
                </Routes>
              </Layout>
            }
          />

          {/* 관리자 페이지 — 로그인 필수 */}
          <Route path="/admin" element={<PrivateRoute />}>
            <Route element={<AdminLayout />}>
              <Route
                index
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="members/new" element={<MembersPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/new" element={<ProductsPage />} />
              <Route path="boards" element={<BoardsPage />} />
              <Route path="settings/shop" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;
