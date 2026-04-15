import { useNavigate, useSearchParams } from 'react-router-dom';

const OrderCompletePage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get('orderId') ?? '';

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '56px 48px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>
          ✅
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
          주문이 완료되었습니다!
        </h1>
        <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 32px', lineHeight: 1.6 }}>
          소중한 주문 감사합니다.
          <br />
          배송 준비가 완료되면 안내해 드리겠습니다.
        </p>

        {orderId && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 20px', marginBottom: 32 }}>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 4px' }}>주문번호</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
              {orderId}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => navigate('/books')}
            style={{ padding: '14px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
          >
            쇼핑 계속하기
          </button>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '12px', background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCompletePage;
