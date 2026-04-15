import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Agreement {
  id: string;
  label: string;
  required: boolean;
  content: string;
}

const AGREEMENTS: Agreement[] = [
  {
    id: 'terms',
    label: '서비스 이용약관',
    required: true,
    content: `제1조 (목적)
이 약관은 구사(이하 "회사")가 운영하는 구사몰(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의)
① "서비스"란 회사가 운영하는 교육용 교재 전자상거래 플랫폼을 말합니다.
② "이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
③ "회원"이란 회사와 이용계약을 체결하고 이용자 아이디(ID)를 부여받은 자를 말합니다.

제3조 (약관의 게시와 개정)
① 회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기화면에 게시합니다.
② 회사는 필요한 경우 관련법령에 위배되지 않는 범위에서 이 약관을 개정할 수 있습니다.

제4조 (서비스 이용)
① 회사는 교육용 교재(초·중·고 교재) 판매 서비스를 제공합니다.
② 서비스 이용시간은 연중무휴 1일 24시간을 원칙으로 합니다. 단, 시스템 점검 등의 사유로 서비스가 일시 중단될 수 있습니다.

제5조 (회원의 의무)
① 회원은 아이디와 비밀번호를 관리할 책임이 있습니다.
② 회원은 타인의 정보를 도용하거나 허위 정보를 등록해서는 안 됩니다.
③ 회원은 관련 법령 및 이 약관의 규정, 회사의 공지사항을 준수해야 합니다.

제6조 (면책조항)
회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.`,
  },
  {
    id: 'privacy',
    label: '개인정보 수집·이용 동의',
    required: true,
    content: `■ 개인정보 수집·이용 목적
회원가입, 본인확인, 서비스 제공, 상품 배송, 고객 상담 및 불만처리, 공지사항 전달

■ 수집하는 개인정보 항목
· 필수항목: 아이디, 비밀번호, 이름, 이메일 주소, 휴대폰 번호, 주소(우편번호·기본주소·상세주소)
· 자동수집: 접속 IP 주소, 쿠키, 서비스 이용기록, 불량 이용기록

■ 개인정보의 보유·이용 기간
원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 즉시 파기합니다.
단, 관계 법령의 규정에 의해 보존할 필요가 있는 경우 아래 기간 동안 보관합니다.

· 계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)
· 대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)
· 소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)
· 로그 기록: 3개월 (통신비밀보호법)

■ 동의 거부 권리
위 개인정보 수집·이용에 대한 동의를 거부할 권리가 있으며, 거부 시 회원가입이 제한됩니다.`,
  },
  {
    id: 'marketing',
    label: '마케팅 정보 수신 동의',
    required: false,
    content: `■ 마케팅 정보 수신 목적
신상품 출시 안내, 이벤트·프로모션 정보, 교육 자료 및 도서 추천, 할인 혜택 안내

■ 수집 항목
이메일 주소, 휴대폰 번호

■ 보유·이용 기간
동의 철회 시 즉시 파기 (동의 철회는 마이페이지에서 언제든지 가능)

■ 수신 채널
이메일, SMS/MMS

동의하지 않더라도 서비스 이용에는 제한이 없습니다.`,
  },
];

/* ─── 단계 표시기 ────────────────────────────────────── */
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
                background: active ? '#1a56db' : done ? '#22c55e' : '#e2e8f0',
                color: active || done ? '#fff' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                margin: '0 auto 6px',
                transition: 'background 0.2s',
              }}
            >
              {done ? '✓' : step}
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: active ? 700 : 400,
                color: active ? '#1a56db' : done ? '#22c55e' : '#94a3b8',
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
                background: done ? '#22c55e' : '#e2e8f0',
                margin: '0 10px 20px',
                borderRadius: 2,
                transition: 'background 0.2s',
              }}
            />
          )}
        </div>
      );
    })}
  </div>
);

/* ─── 커스텀 체크박스 ────────────────────────────────── */
const CheckIcon = () => (
  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
    <path
      d="M1 4L4 7.5L10 1"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Checkbox = ({
  checked,
  onChange,
  size = 20,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  size?: number;
}) => (
  <div
    onClick={() => onChange(!checked)}
    style={{
      width: size,
      height: size,
      borderRadius: 6,
      border: checked ? '2px solid #1a56db' : '2px solid #cbd5e1',
      background: checked ? '#1a56db' : '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      flexShrink: 0,
      transition: 'all 0.15s',
    }}
  >
    {checked && <CheckIcon />}
  </div>
);

/* ─── 메인 컴포넌트 ──────────────────────────────────── */
const SignupConsentPage = () => {
  const navigate = useNavigate();
  const [checked, setChecked] = useState<Record<string, boolean>>({
    all: false,
    terms: false,
    privacy: false,
    marketing: false,
  });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const requiredAll = AGREEMENTS.filter((a) => a.required).every(
    (a) => checked[a.id],
  );

  const handleAll = (value: boolean) => {
    const next: Record<string, boolean> = { all: value };
    AGREEMENTS.forEach((a) => (next[a.id] = value));
    setChecked(next);
  };

  const handleOne = (id: string, value: boolean) => {
    const next = { ...checked, [id]: value };
    next.all = AGREEMENTS.every((a) => next[a.id]);
    setChecked(next);
  };

  const handleNext = () => {
    navigate('/signup/form', {
      state: { agreed: true, marketing: checked.marketing },
    });
  };

  return (
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
          maxWidth: 500,
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
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 13,
              color: '#64748b',
            }}
          >
            서비스 이용을 위해 약관에 동의해 주세요.
          </p>
        </div>

        {/* 단계 표시 */}
        <StepIndicator current={1} />

        {/* 전체 동의 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 20px',
            background: '#eff6ff',
            border: '1.5px solid #1a56db',
            borderRadius: 12,
            marginBottom: 12,
            cursor: 'pointer',
          }}
          onClick={() => handleAll(!checked.all)}
        >
          <Checkbox checked={checked.all} onChange={handleAll} size={22} />
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 700,
                color: '#1e293b',
              }}
            >
              전체 동의하기
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
              이용약관, 개인정보 수집·이용(필수) 및 마케팅 수신(선택) 포함
            </p>
          </div>
        </div>

        {/* 개별 약관 */}
        <div
          style={{
            border: '1.5px solid #e2e8f0',
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: 24,
          }}
        >
          {AGREEMENTS.map((ag, idx) => (
            <div
              key={ag.id}
              style={{
                borderBottom:
                  idx < AGREEMENTS.length - 1 ? '1px solid #e2e8f0' : 'none',
              }}
            >
              {/* 항목 행 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 18px',
                  gap: 12,
                  background: checked[ag.id] ? '#f8faff' : '#fff',
                  transition: 'background 0.15s',
                }}
              >
                <Checkbox
                  checked={!!checked[ag.id]}
                  onChange={(v) => handleOne(ag.id, v)}
                  size={18}
                />
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleOne(ag.id, !checked[ag.id])}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: ag.required ? '#1a56db' : '#64748b',
                      background: ag.required ? '#dbeafe' : '#f1f5f9',
                      padding: '2px 8px',
                      borderRadius: 100,
                      flexShrink: 0,
                    }}
                  >
                    {ag.required ? '필수' : '선택'}
                  </span>
                  {ag.label}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [ag.id]: !prev[ag.id],
                    }))
                  }
                  style={{
                    background: 'none',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    fontSize: 11,
                    color: '#64748b',
                    padding: '4px 10px',
                    borderRadius: 6,
                    flexShrink: 0,
                    transition: 'border-color 0.15s',
                  }}
                >
                  {expanded[ag.id] ? '접기' : '내용보기'}
                </button>
              </div>

              {/* 약관 전문 */}
              {expanded[ag.id] && (
                <div
                  style={{
                    margin: '0 18px 14px',
                    padding: '14px 16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    maxHeight: 180,
                    overflowY: 'auto',
                    fontSize: 12,
                    color: '#475569',
                    lineHeight: 1.9,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {ag.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 다음 버튼 */}
        <button
          type="button"
          onClick={handleNext}
          disabled={!requiredAll}
          style={{
            width: '100%',
            padding: '14px 0',
            fontSize: 15,
            fontWeight: 700,
            border: 'none',
            borderRadius: 12,
            cursor: requiredAll ? 'pointer' : 'not-allowed',
            background: requiredAll ? '#1a56db' : '#e2e8f0',
            color: requiredAll ? '#fff' : '#94a3b8',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            if (requiredAll) e.currentTarget.style.background = '#1e429f';
          }}
          onMouseLeave={(e) => {
            if (requiredAll) e.currentTarget.style.background = '#1a56db';
          }}
        >
          동의하고 계속하기
        </button>
      </div>
    </div>
  );
};

export default SignupConsentPage;
