import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../api/auth';
import { setToken } from '../../utils/token';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { accessToken, refreshToken } = await adminLogin(userId, password);
      setToken(accessToken, refreshToken);
      navigate('/admin/dashboard', { replace: true });
    } catch {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* 로고 */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                background: '#1a56db',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              🛡️
            </div>
            <span
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '-1px',
              }}
            >
              GUSA Admin
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            관리자 전용 로그인 페이지입니다
          </p>
        </div>

        {/* 카드 */}
        <div
          style={{
            background: '#1e293b',
            borderRadius: 16,
            border: '1px solid #334155',
            padding: '36px 32px',
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#94a3b8',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                관리자 ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="관리자 아이디"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: '#fff',
                  border: '1.5px solid #334155',
                  borderRadius: 10,
                  fontSize: 14,
                  color: '#1e293b',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#1a56db')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#334155')}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#94a3b8',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: '#fff',
                  border: '1.5px solid #334155',
                  borderRadius: 10,
                  fontSize: 14,
                  color: '#1e293b',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#1a56db')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#334155')}
              />
            </div>

            {error && (
              <p style={{ margin: 0, fontSize: 13, color: '#f87171', textAlign: 'center' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                width: '100%',
                padding: '14px',
                background: loading ? '#334155' : '#1a56db',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#1e429f';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = '#1a56db';
              }}
            >
              {loading ? '로그인 중...' : '관리자 로그인'}
            </button>
          </form>

          <div
            style={{
              marginTop: 20,
              paddingTop: 20,
              borderTop: '1px solid #334155',
              textAlign: 'center',
            }}
          >
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: 13,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              사용자 페이지로 돌아가기
            </button>
          </div>
        </div>

        <p
          style={{
            marginTop: 20,
            textAlign: 'center',
            fontSize: 12,
            color: '#475569',
          }}
        >
          관리자 계정 문의: 시스템 담당자에게 연락하세요
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
