import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';
import { setToken } from '../utils/token';

const LoginPage = () => {
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
      const { accessToken, refreshToken } = await login(userId, password);
      setToken(accessToken, refreshToken);
      navigate('/', { replace: true });
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
        background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
          padding: '48px 40px 40px',
        }}
      >
        {/* 로고 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span
            onClick={() => navigate('/')}
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: '#1a56db',
              letterSpacing: '-1px',
              cursor: 'pointer',
            }}
          >
            GUSA
          </span>
        </div>

        {/* 폼 */}
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 6,
              }}
            >
              아이디
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="아이디를 입력하세요"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#eeeeee',
                border: '1.5px solid #e2e8f0',
                borderRadius: 10,
                fontSize: 14,
                color: '#1e293b',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#1a56db')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 6,
              }}
            >
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#eeeeee',
                border: '1.5px solid #e2e8f0',
                borderRadius: 10,
                fontSize: 14,
                color: '#1e293b',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#1a56db')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            />
          </div>

          {error && (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: '#ef4444',
                textAlign: 'center',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              width: '100%',
              padding: '14px',
              background: loading ? '#93c5fd' : '#1a56db',
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
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 하단 링크 */}
        <div
          style={{
            marginTop: 24,
            textAlign: 'center',
            fontSize: 13,
            color: '#64748b',
          }}
        >
          아직 계정이 없으신가요?{' '}
          <Link
            to="/signup"
            style={{
              color: '#1a56db',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
