import { useState } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { sendVerificationCode, signup, verifyCode } from '@/api/auth';
import { useDaumPost } from '@/hooks/useDaumPost';
import AlertModal from '@/components/common/AlertModal';
import { useAlertModal } from '@/hooks/useAlertModal';

interface FormState {
  userId: string;
  password: string;
  passwordConfirm: string;
  userName: string;
  email: string;
  phoneNumber: string;
  verificationCode: string;
  zipCode: string;
  address: string;
  addressDetail: string;
}

const initialForm: FormState = {
  userId: '',
  password: '',
  passwordConfirm: '',
  userName: '',
  email: '',
  phoneNumber: '',
  verificationCode: '',
  zipCode: '',
  address: '',
  addressDetail: '',
};

/* ─── 단계 표시기 ──────────────────────────────────── */
const STEPS = ['약관 동의', '정보 입력', '가입 완료'];

const StepIndicator = ({ current }: { current: number }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 28,
    }}
  >
    {STEPS.map((label, idx) => {
      const step = idx + 1;
      const active = step === current;
      const done = step < current;
      return (
        <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: active ? '#1a56db' : done ? '#1a56db' : '#e2e8f0',
                color: active || done ? '#fff' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                margin: '0 auto 6px',
              }}
            >
              {done ? '✓' : step}
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: active ? 700 : 400,
                color: active ? '#1a56db' : done ? '#1a56db' : '#94a3b8',
              }}
            >
              {label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              style={{
                width: 56,
                height: 2,
                background: done ? '#1a56db' : '#e2e8f0',
                margin: '0 10px 20px',
                borderRadius: 2,
              }}
            />
          )}
        </div>
      );
    })}
  </div>
);

/* ─── 필드 래퍼 ────────────────────────────────────── */
const Field = ({
  label,
  error,
  children,
  required,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) => (
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
      {label}
      {required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {error && (
      <p style={{ margin: '5px 0 0', fontSize: 12, color: '#ef4444' }}>
        {error}
      </p>
    )}
  </div>
);

/* ─── 입력 스타일 ──────────────────────────────────── */
const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: '#f8fafc',
  border: '1.5px solid #e2e8f0',
  borderRadius: 10,
  fontSize: 14,
  color: '#1e293b',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, background 0.2s',
};

const readonlyInput: React.CSSProperties = {
  ...inputBase,
  background: '#f1f5f9',
  color: '#64748b',
  cursor: 'default',
};

const inputFocusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#1a56db';
    e.currentTarget.style.background = '#fff';
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#e2e8f0';
    e.currentTarget.style.background = '#f8fafc';
  },
};

/* ─── 보조 버튼 ────────────────────────────────────── */
const SubButton = ({
  onClick,
  children,
  disabled,
  variant = 'default',
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'success';
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: '11px 14px',
      border: '1.5px solid',
      borderColor:
        variant === 'success' ? '#22c55e' : disabled ? '#e2e8f0' : '#1a56db',
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 600,
      background:
        variant === 'success' ? '#22c55e' : disabled ? '#f1f5f9' : '#1a56db',
      color: disabled && variant !== 'success' ? '#94a3b8' : '#fff',
      cursor: disabled ? 'not-allowed' : 'pointer',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      transition: 'all 0.15s',
    }}
  >
    {children}
  </button>
);

/* ─── 메인 컴포넌트 ────────────────────────────────── */
const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchAddress = useDaumPost();

  /* 모든 hook을 조건 분기 전에 선언 */
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [codeSent, setCodeSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { alert, show: showModal, close: closeModal } = useAlertModal();

  /* 동의 페이지를 거치지 않은 직접 접근 차단 */
  if (!location.state?.agreed) {
    return <Navigate to="/signup" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAddressSearch = () => {
    searchAddress(({ zipCode, address }) => {
      setForm((prev) => ({ ...prev, zipCode, address, addressDetail: '' }));
      setErrors((prev) => ({ ...prev, address: '' }));
    });
  };

  const handleSendCode = async () => {
    if (!/^01[016789]\d{7,8}$/.test(form.phoneNumber)) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: '올바른 휴대폰 번호를 입력해 주세요.',
      }));
      return;
    }
    try {
      await sendVerificationCode(form.phoneNumber);
      setCodeSent(true);
      setPhoneVerified(false);
      showModal('info', '인증번호가 발송되었습니다.');
    } catch {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: '인증번호 발송에 실패했습니다.',
      }));
    }
  };

  const handleVerifyCode = async () => {
    if (!form.verificationCode) {
      setErrors((prev) => ({
        ...prev,
        verificationCode: '인증번호를 입력해 주세요.',
      }));
      return;
    }
    try {
      await verifyCode(form.phoneNumber, form.verificationCode);
      setPhoneVerified(true);
      setErrors((prev) => ({ ...prev, verificationCode: '' }));
      showModal('success', '휴대폰 인증이 완료되었습니다.');
    } catch {
      setErrors((prev) => ({
        ...prev,
        verificationCode: '인증번호가 올바르지 않거나 만료되었습니다.',
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.userId) newErrors.userId = '아이디를 입력해 주세요.';
    if (!form.userName) newErrors.userName = '이름을 입력해 주세요.';
    if (!form.password) newErrors.password = '비밀번호를 입력해 주세요.';
    if (form.password !== form.passwordConfirm)
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    if (!form.email) newErrors.email = '이메일을 입력해 주세요.';
    if (!form.phoneNumber)
      newErrors.phoneNumber = '휴대폰 번호를 입력해 주세요.';
    if (!form.address) newErrors.address = '주소를 검색해 주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await signup({
        userId: form.userId,
        password: form.password,
        userName: form.userName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        zipCode: form.zipCode,
        address: form.address,
        addressDetail: form.addressDetail,
      });
      showModal('success', '회원가입이 완료되었습니다.', () =>
        navigate('/login'),
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? '회원가입에 실패했습니다.';
      showModal('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AlertModal
        open={alert.open}
        type={alert.type}
        message={alert.message}
        onClose={closeModal}
      />
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '40px 16px 60px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 520,
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
            padding: '44px 40px 40px',
          }}
        >
          {/* 로고 */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
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

          {/* 단계 표시 */}
          <StepIndicator current={2} />

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <Field label="아이디" error={errors.userId} required>
              <input
                name="userId"
                value={form.userId}
                onChange={handleChange}
                placeholder="아이디를 입력해 주세요"
                style={inputBase}
                {...inputFocusHandlers}
              />
            </Field>

            <Field label="이름" error={errors.userName} required>
              <input
                name="userName"
                value={form.userName}
                onChange={handleChange}
                placeholder="이름을 입력해 주세요"
                style={inputBase}
                {...inputFocusHandlers}
              />
            </Field>

            <Field label="비밀번호" error={errors.password} required>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력해 주세요"
                style={inputBase}
                {...inputFocusHandlers}
              />
            </Field>

            <Field
              label="비밀번호 확인"
              error={errors.passwordConfirm}
              required
            >
              <input
                type="password"
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력해 주세요"
                style={{
                  ...inputBase,
                  borderColor:
                    form.passwordConfirm &&
                    form.password === form.passwordConfirm
                      ? '#22c55e'
                      : undefined,
                }}
                {...inputFocusHandlers}
              />
              {form.passwordConfirm &&
                form.password === form.passwordConfirm && (
                  <p
                    style={{
                      margin: '5px 0 0',
                      fontSize: 12,
                      color: '#22c55e',
                    }}
                  >
                    ✓ 비밀번호가 일치합니다.
                  </p>
                )}
            </Field>

            <Field label="이메일" error={errors.email} required>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="이메일을 입력해 주세요"
                style={inputBase}
                {...inputFocusHandlers}
              />
            </Field>

            <Field label="휴대폰 번호" error={errors.phoneNumber} required>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={(e) => {
                    handleChange(e);
                    setCodeSent(false);
                    setPhoneVerified(false);
                  }}
                  placeholder="01012345678"
                  style={{ ...inputBase, flex: 1 }}
                  {...inputFocusHandlers}
                />
                <SubButton onClick={handleSendCode}>
                  {codeSent ? '재발송' : '인증번호 발송'}
                </SubButton>
              </div>
            </Field>

            {codeSent && (
              <Field label="인증번호" error={errors.verificationCode}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    name="verificationCode"
                    value={form.verificationCode}
                    onChange={handleChange}
                    placeholder="인증번호 6자리"
                    maxLength={6}
                    style={{ ...inputBase, flex: 1 }}
                    disabled={phoneVerified}
                    {...(phoneVerified ? {} : inputFocusHandlers)}
                  />
                  <SubButton
                    onClick={handleVerifyCode}
                    disabled={phoneVerified}
                    variant={phoneVerified ? 'success' : 'default'}
                  >
                    {phoneVerified ? '✓ 인증완료' : '확인'}
                  </SubButton>
                </div>
              </Field>
            )}

            <Field label="주소" error={errors.address} required>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  value={form.zipCode}
                  readOnly
                  placeholder="우편번호"
                  style={{ ...readonlyInput, width: 130, flex: 'none' }}
                />
                <SubButton onClick={handleAddressSearch}>주소 검색</SubButton>
              </div>
              <input
                value={form.address}
                readOnly
                placeholder="기본 주소"
                style={{ ...readonlyInput, marginBottom: 8 }}
              />
              <input
                name="addressDetail"
                value={form.addressDetail}
                onChange={handleChange}
                placeholder="상세 주소를 입력해 주세요"
                style={inputBase}
                {...inputFocusHandlers}
              />
            </Field>

            {/* 가입 버튼 */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 8,
                width: '100%',
                padding: '14px',
                background: submitting ? '#93c5fd' : '#1a56db',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!submitting) e.currentTarget.style.background = '#1e429f';
              }}
              onMouseLeave={(e) => {
                if (!submitting) e.currentTarget.style.background = '#1a56db';
              }}
            >
              {submitting ? '처리 중...' : '회원가입 완료'}
            </button>
          </form>

          {/* 하단 링크 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 20,
              marginTop: 20,
              fontSize: 13,
              color: '#64748b',
            }}
          >
            <button
              type="button"
              onClick={() => navigate('/signup')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                color: '#64748b',
                padding: 0,
              }}
            >
              약관 동의로 돌아가기
            </button>
            <span style={{ color: '#e2e8f0' }}>|</span>
            <Link
              to="/login"
              style={{
                color: '#1a56db',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
