import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { SUBJECT_COLORS } from '../constants/product';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, totalAmount } = useCart();

  if (items.length === 0) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
          <p style={{ fontSize: 18, color: '#64748b', margin: '0 0 24px' }}>장바구니가 비어 있습니다.</p>
          <button
            onClick={() => navigate('/books')}
            style={{ padding: '12px 32px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
          >
            교재 둘러보기
          </button>
        </div>
      </div>
    );
  }

  const deliveryFee = totalAmount >= 30000 ? 0 : 3000;
  const finalAmount = totalAmount + deliveryFee;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 0' }}>
      <div className="container" style={{ padding: '0 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px', letterSpacing: '-0.5px' }}>장바구니</h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 32px' }}>총 {items.length}종 상품</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          {/* 상품 목록 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={clearCart}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
              >
                전체 삭제
              </button>
            </div>

            {items.map((item) => {
              const color = SUBJECT_COLORS[item.subject] ?? '#64748b';
              const discountRate = item.originalPrice > 0
                ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                : 0;
              return (
                <div
                  key={item.productId}
                  style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px 24px', display: 'flex', gap: 20, alignItems: 'center' }}
                >
                  {/* 커버 */}
                  <div style={{ width: 80, height: 100, borderRadius: 8, background: `linear-gradient(135deg, ${color}22, ${color}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 36 }}>
                    📗
                  </div>

                  {/* 정보 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, color, background: `${color}15`, display: 'inline-block', marginBottom: 6 }}>
                      {item.subject}
                    </span>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 8px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {discountRate > 0 && (
                        <span style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'line-through' }}>{item.originalPrice.toLocaleString()}원</span>
                      )}
                      {discountRate > 0 && (
                        <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, background: '#fef2f2', padding: '2px 6px', borderRadius: 4 }}>-{discountRate}%</span>
                      )}
                    </div>
                    <p style={{ fontSize: 18, fontWeight: 900, color: '#1a56db', margin: '4px 0 0', letterSpacing: '-0.5px' }}>
                      {(item.price * item.quantity).toLocaleString()}원
                    </p>
                  </div>

                  {/* 수량 + 삭제 */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                    <button
                      onClick={() => removeItem(item.productId)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0 }}
                    >
                      ✕
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        style={{ width: 32, height: 32, border: '1px solid #e2e8f0', borderRight: 'none', borderRadius: '8px 0 0 8px', background: '#fff', fontSize: 16, cursor: 'pointer', color: '#475569' }}
                      >−</button>
                      <div style={{ width: 44, height: 32, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                        {item.quantity}
                      </div>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        style={{ width: 32, height: 32, border: '1px solid #e2e8f0', borderLeft: 'none', borderRadius: '0 8px 8px 0', background: '#fff', fontSize: 16, cursor: 'pointer', color: '#475569' }}
                      >+</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 결제 요약 */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px', position: 'sticky', top: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>결제 요약</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#475569' }}>
                <span>상품 금액</span>
                <span>{totalAmount.toLocaleString()}원</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#475569' }}>
                <span>배송비</span>
                <span>{deliveryFee === 0 ? <span style={{ color: '#10b981', fontWeight: 600 }}>무료</span> : `${deliveryFee.toLocaleString()}원`}</span>
              </div>
              {deliveryFee > 0 && (
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '0', padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                  3만원 이상 구매 시 배송비 무료
                </p>
              )}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>총 결제금액</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#1a56db', letterSpacing: '-0.5px' }}>{finalAmount.toLocaleString()}원</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              style={{ width: '100%', padding: '16px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 20 }}
            >
              주문하기
            </button>
            <button
              onClick={() => navigate('/books')}
              style={{ width: '100%', padding: '12px', background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}
            >
              쇼핑 계속하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
