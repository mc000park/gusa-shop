import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccessToken } from '../utils/token';
import { getMyProfile, updateMyProfile, getMyOrders, type UserProfile } from '../api/users';
import type { Order, OrderPageResponse } from '../types/order';
import Pagination from '../components/admin/Pagination';

type Tab = 'profile' | 'orders';

const STATUS_LABEL: Record<string, string> = {
  PENDING:   '결제대기',
  PAID:      '결제완료',
  SHIPPING:  '배송중',
  DELIVERED: '배송완료',
  CANCELED:  '취소',
};
const STATUS_COLOR: Record<string, string> = {
  PENDING:   '#f59e0b',
  PAID:      '#1a56db',
  SHIPPING:  '#8b5cf6',
  DELIVERED: '#10b981',
  CANCELED:  '#ef4444',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  border: '1.5px solid #e2e8f0', borderRadius: 8,
  fontSize: 14, color: '#1e293b', outline: 'none',
  background: '#fff', boxSizing: 'border-box',
};

const MyPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('profile');

  /* ── 프로필 상태 ── */
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [form, setForm] = useState({
    userName: '', email: '', phoneNumber: '',
    zipCode: '', address: '', addressDetail: '',
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /* ── 주문내역 상태 ── */
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderPage, setOrderPage] = useState(0);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [orderTotalElements, setOrderTotalElements] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  /* ── 비로그인 리다이렉트 ── */
  useEffect(() => {
    if (!getAccessToken()) navigate('/login', { replace: true });
  }, []);

  /* ── 프로필 로드 ── */
  useEffect(() => {
    getMyProfile()
      .then((p) => {
        setProfile(p);
        setForm((f) => ({
          ...f,
          userName: p.userName ?? '',
          email: p.email ?? '',
          phoneNumber: p.phoneNumber ?? '',
          zipCode: p.zipCode ?? '',
          address: p.address ?? '',
          addressDetail: p.addressDetail ?? '',
        }));
      })
      .catch(() => navigate('/login', { replace: true }))
      .finally(() => setProfileLoading(false));
  }, []);

  /* ── 주문내역 로드 ── */
  useEffect(() => {
    if (tab !== 'orders') return;
    setOrdersLoading(true);
    getMyOrders(orderPage, 5)
      .then((res: OrderPageResponse) => {
        setOrders(res.content);
        setOrderTotalPages(res.totalPages || 1);
        setOrderTotalElements(res.totalElements);
      })
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, [tab, orderPage]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleProfileSave = async () => {
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setProfileMsg({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }
    if (form.newPassword && !form.currentPassword) {
      setProfileMsg({ type: 'error', text: '현재 비밀번호를 입력해주세요.' });
      return;
    }
    setSaving(true);
    setProfileMsg(null);
    try {
      const updated = await updateMyProfile({
        userName: form.userName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        zipCode: form.zipCode,
        address: form.address,
        addressDetail: form.addressDetail,
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword || undefined,
      });
      setProfile(updated);
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setProfileMsg({ type: 'success', text: '회원정보가 저장되었습니다.' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? '저장에 실패했습니다.';
      setProfileMsg({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '12px 28px', border: 'none',
    borderBottom: `2px solid ${active ? '#1a56db' : 'transparent'}`,
    background: 'none', fontSize: 15,
    fontWeight: active ? 700 : 500,
    color: active ? '#1a56db' : '#64748b',
    cursor: 'pointer',
  });

  if (profileLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        불러오는 중...
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 0' }}>
      <div className="container" style={{ padding: '0 24px', maxWidth: 760 }}>

        {/* 헤더 */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>마이페이지</h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            {profile?.userId} 님 환영합니다.
          </p>
        </div>

        {/* 탭 */}
        <div style={{ borderBottom: '1px solid #e2e8f0', marginBottom: 28 }}>
          <button style={tabStyle(tab === 'profile')} onClick={() => setTab('profile')}>👤 회원정보 변경</button>
          <button style={tabStyle(tab === 'orders')} onClick={() => setTab('orders')}>📦 주문내역</button>
        </div>

        {/* ═══ 회원정보 변경 탭 ═══ */}
        {tab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* 기본 정보 */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '28px 28px' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>기본 정보</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>아이디</label>
                  <input style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8' }} value={profile?.userId ?? ''} readOnly />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>이름</label>
                  <input style={inputStyle} value={form.userName} onChange={set('userName')} placeholder="이름" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>이메일</label>
                  <input style={inputStyle} value={form.email} onChange={set('email')} placeholder="이메일" type="email" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>휴대폰 번호</label>
                  <input style={inputStyle} value={form.phoneNumber} onChange={set('phoneNumber')} placeholder="01012345678" maxLength={11} />
                </div>
              </div>
            </div>

            {/* 배송지 정보 */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '28px 28px' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>기본 배송지</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>우편번호</label>
                  <input style={{ ...inputStyle, maxWidth: 160 }} value={form.zipCode} onChange={set('zipCode')} placeholder="12345" maxLength={5} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>주소</label>
                  <input style={inputStyle} value={form.address} onChange={set('address')} placeholder="도로명 주소" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>상세 주소</label>
                  <input style={inputStyle} value={form.addressDetail} onChange={set('addressDetail')} placeholder="상세 주소 (동/호수 등)" />
                </div>
              </div>
            </div>

            {/* 비밀번호 변경 */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '28px 28px' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>비밀번호 변경</h2>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 20px' }}>변경하지 않으려면 비워두세요.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>현재 비밀번호</label>
                  <input style={inputStyle} type="password" value={form.currentPassword} onChange={set('currentPassword')} placeholder="현재 비밀번호" autoComplete="current-password" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>새 비밀번호</label>
                  <input style={inputStyle} type="password" value={form.newPassword} onChange={set('newPassword')} placeholder="새 비밀번호 (8자 이상)" autoComplete="new-password" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>새 비밀번호 확인</label>
                  <input
                    style={{ ...inputStyle, borderColor: form.confirmPassword && form.newPassword !== form.confirmPassword ? '#ef4444' : '#e2e8f0' }}
                    type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                    placeholder="새 비밀번호 재입력" autoComplete="new-password"
                  />
                  {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ef4444' }}>비밀번호가 일치하지 않습니다.</p>
                  )}
                </div>
              </div>
            </div>

            {/* 메시지 + 저장 버튼 */}
            {profileMsg && (
              <div style={{
                padding: '12px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                background: profileMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${profileMsg.type === 'success' ? '#86efac' : '#fecaca'}`,
                color: profileMsg.type === 'success' ? '#166534' : '#dc2626',
              }}>
                {profileMsg.type === 'success' ? '✓ ' : '✕ '}{profileMsg.text}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleProfileSave}
                disabled={saving}
                style={{
                  padding: '13px 40px', background: saving ? '#93c5fd' : '#1a56db',
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? '저장 중...' : '변경 저장'}
              </button>
            </div>
          </div>
        )}

        {/* ═══ 주문내역 탭 ═══ */}
        {tab === 'orders' && (
          <div>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 16px' }}>
              총 <strong style={{ color: '#1a56db' }}>{orderTotalElements}</strong>건의 주문
            </p>

            {ordersLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>불러오는 중...</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <p style={{ color: '#94a3b8', fontSize: 15 }}>주문 내역이 없습니다.</p>
                <button
                  onClick={() => navigate('/books')}
                  style={{ marginTop: 16, padding: '11px 28px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                >
                  교재 둘러보기
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {orders.map((order) => (
                  <div key={order.orderId} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    {/* 주문 헤더 */}
                    <button
                      onClick={() => setExpandedOrderId(expandedOrderId === order.orderId ? null : order.orderId)}
                      style={{ width: '100%', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                            background: `${STATUS_COLOR[order.status]}18`,
                            color: STATUS_COLOR[order.status] ?? '#64748b',
                          }}>
                            {STATUS_LABEL[order.status] ?? order.status}
                          </span>
                          <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#64748b' }}>{order.orderId}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                            {order.finalAmount.toLocaleString()}원
                          </span>
                          <span style={{ fontSize: 13, color: '#94a3b8' }}>{order.createdAt?.slice(0, 10)}</span>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>{expandedOrderId === order.orderId ? '▲' : '▼'}</span>
                        </div>
                      </div>
                      {/* 상품 요약 */}
                      <p style={{ margin: '8px 0 0', fontSize: 13, color: '#475569', textAlign: 'left' }}>
                        {order.items[0]?.productTitle}
                        {order.items.length > 1 && ` 외 ${order.items.length - 1}종`}
                      </p>
                    </button>

                    {/* 주문 상세 펼치기 */}
                    {expandedOrderId === order.orderId && (
                      <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 20px', background: '#fafafa' }}>
                        {/* 상품 목록 */}
                        <div style={{ marginBottom: 16 }}>
                          {order.items.map((item) => (
                            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
                              <span style={{ color: '#1e293b' }}>{item.productTitle} × {item.quantity}</span>
                              <span style={{ fontWeight: 600 }}>{item.totalPrice.toLocaleString()}원</span>
                            </div>
                          ))}
                        </div>

                        {/* 금액 요약 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#475569' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>상품 금액</span><span>{order.totalAmount.toLocaleString()}원</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>배송비</span>
                            <span>{order.deliveryFee === 0 ? <span style={{ color: '#10b981' }}>무료</span> : `${order.deliveryFee.toLocaleString()}원`}</span>
                          </div>
                          {order.paymentMethod && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>결제수단</span>
                              <span>{order.paymentMethod === 'BANK_TRANSFER' ? '무통장 입금' : '카드/간편결제'}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#1e293b', borderTop: '1px solid #e2e8f0', paddingTop: 8, marginTop: 4 }}>
                            <span>총 결제금액</span><span style={{ color: '#1a56db' }}>{order.finalAmount.toLocaleString()}원</span>
                          </div>
                        </div>

                        {/* 배송지 */}
                        <div style={{ marginTop: 14, padding: '12px 14px', background: '#f1f5f9', borderRadius: 8, fontSize: 13, color: '#475569' }}>
                          <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#334155' }}>배송지</p>
                          <p style={{ margin: 0 }}>{order.recipientName} · {order.phoneNumber}</p>
                          <p style={{ margin: 0 }}>{order.zipCode} {order.address} {order.addressDetail}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {orderTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <Pagination page={orderPage} totalPages={orderTotalPages} onChange={(p) => { setOrderPage(p); setExpandedOrderId(null); }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;
