import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder, createGuestOrder } from '../api/orders';
import { getMyProfile } from '../api/users';
import { getBankSetting, type BankSetting } from '../api/bankSetting';
import { getAccessToken, isAdmin } from '../utils/token';
import { SUBJECT_COLORS } from '../constants/product';
import AlertModal from '../components/common/AlertModal';
import { useDaumPost } from '../hooks/useDaumPost';

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
      {label}
      {required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
    </label>
    {children}
  </div>
);

const inputStyle: React.CSSProperties = {
  padding: '11px 14px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 8,
  fontSize: 14,
  color: '#1e293b',
  outline: 'none',
  background: '#fff',
  width: '100%',
  boxSizing: 'border-box',
};

const SectionCard = ({
  title,
  children,
  extra,
}: {
  title: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
}) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #e2e8f0',
      padding: '24px 28px',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
      }}
    >
      <h2
        style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', margin: 0 }}
      >
        {title}
      </h2>
      {extra}
    </div>
    {children}
  </div>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCart();
  const isLoggedIn = !!getAccessToken();
  const isAdminUser = isAdmin();
  const searchAddress = useDaumPost();

  const [form, setForm] = useState({
    senderName: '',
    senderPhone: '',
    senderZipCode: '',
    senderAddress: '',
    senderAddressDetail: '',
    recipientName: '',
    phoneNumber: '',
    zipCode: '',
    address: '',
    addressDetail: '',
    deliveryMemo: '',
  });
  const [sameAsSender, setSameAsSender] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'PG' | 'BANK_TRANSFER'>(
    'PG',
  );
  const [bankSetting, setBankSetting] = useState<BankSetting | null>(null);
  const [cardEnabled, setCardEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<{
    open: boolean;
    type: 'error' | 'info';
    message: string;
  }>({ open: false, type: 'error', message: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    getBankSetting()
      .then((s) => {
        const card = s.cardEnabled ?? true;
        if (s.enabled) setBankSetting(s);
        setCardEnabled(card);
        // 카드결제 비활성화 시 무통장 입금으로 자동 전환
        if (!card) {
          setPaymentMethod(s.enabled ? 'BANK_TRANSFER' : 'BANK_TRANSFER');
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoggedIn || isAdminUser) return;
    setProfileLoading(true);
    getMyProfile()
      .then((profile) => {
        setForm((prev) => ({
          ...prev,
          senderName: profile.userName ?? '',
          senderPhone: profile.phoneNumber ?? '',
          senderZipCode: profile.zipCode ?? '',
          senderAddress: profile.address ?? '',
          senderAddressDetail: profile.addressDetail ?? '',
          recipientName: profile.userName ?? '',
          phoneNumber: profile.phoneNumber ?? '',
          zipCode: profile.zipCode ?? '',
          address: profile.address ?? '',
          addressDetail: profile.addressDetail ?? '',
        }));
        setProfileLoaded(true);
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, [isLoggedIn]);

  // 보내는 분과 동일 체크 시 받는 분 정보 자동 동기화
  const handleSameAsSender = (checked: boolean) => {
    setSameAsSender(checked);
    if (checked) {
      setForm((prev) => ({
        ...prev,
        recipientName: prev.senderName,
        phoneNumber: prev.senderPhone,
      }));
    }
  };

  const openDaumPost = (target: 'sender' | 'recipient') => {
    searchAddress(({ zipCode, address }) => {
      if (target === 'sender') {
        setForm((prev) => ({
          ...prev,
          senderZipCode: zipCode,
          senderAddress: address,
          senderAddressDetail: '',
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          zipCode,
          address,
          addressDetail: '',
        }));
      }
    });
  };

  const deliveryFee = totalAmount >= 30000 ? 0 : 3000;
  const finalAmount = totalAmount + deliveryFee;

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((prev) => {
        const next = { ...prev, [key]: value };
        // 보내는 분 정보 변경 시 받는 분도 동기화
        if (sameAsSender) {
          if (key === 'senderName') next.recipientName = value;
          if (key === 'senderPhone') next.phoneNumber = value;
        }
        return next;
      });
    };

  const validate = () => {
    if (!form.senderName.trim()) return '보내는 분 이름을 입력해주세요.';
    if (!/^01[0-9]{8,9}$/.test(form.senderPhone.replace(/-/g, '')))
      return '보내는 분 연락처를 올바르게 입력해주세요.';
    if (!form.senderZipCode.trim()) return '보내는 분 주소를 검색해주세요.';
    if (!form.senderAddress.trim()) return '보내는 분 주소를 입력해주세요.';
    if (!form.recipientName.trim()) return '받는 분 이름을 입력해주세요.';
    if (!/^01[0-9]{8,9}$/.test(form.phoneNumber.replace(/-/g, '')))
      return '받는 분 휴대폰 번호를 올바르게 입력해주세요.';
    if (!form.zipCode.trim()) return '우편번호를 입력해주세요.';
    if (!form.address.trim()) return '주소를 입력해주세요.';
    if (items.length === 0) return '장바구니가 비어 있습니다.';
    return null;
  };

  const showModal = (type: 'error' | 'info', message: string) =>
    setModal({ open: true, type, message });

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      showModal('info', err);
      return;
    }

    setSubmitting(true);
    try {
      const req = {
        recipientName: form.recipientName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        zipCode: form.zipCode.trim(),
        address: form.address.trim(),
        addressDetail: form.addressDetail.trim(),
        deliveryMemo: form.deliveryMemo.trim() || undefined,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };

      const order = isLoggedIn
        ? await createOrder(req)
        : await createGuestOrder(req);

      clearCart();
      navigate(`/order/complete?orderId=${order.orderId}`);
    } catch {
      showModal(
        'error',
        '주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const loadProfile = () => {
    setProfileLoading(true);
    getMyProfile()
      .then((profile) => {
        setForm((prev) => ({
          ...prev,
          senderName: profile.userName ?? '',
          senderPhone: profile.phoneNumber ?? '',
          senderZipCode: profile.zipCode ?? '',
          senderAddress: profile.address ?? '',
          senderAddressDetail: profile.addressDetail ?? '',
          recipientName: sameAsSender
            ? (profile.userName ?? '')
            : prev.recipientName,
          phoneNumber: sameAsSender
            ? (profile.phoneNumber ?? '')
            : prev.phoneNumber,
          zipCode: profile.zipCode ?? '',
          address: profile.address ?? '',
          addressDetail: profile.addressDetail ?? '',
        }));
        setProfileLoaded(true);
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  };

  if (isAdminUser) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🛡️</div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#1e293b',
              margin: '0 0 8px',
            }}
          >
            관리자 계정입니다
          </h2>
          <p
            style={{
              fontSize: 14,
              color: '#64748b',
              margin: '0 0 24px',
              lineHeight: 1.6,
            }}
          >
            관리자 계정으로는 주문할 수 없습니다.
            <br />
            일반 회원 계정으로 로그인 후 이용해주세요.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/books')}
              style={{
                padding: '11px 24px',
                background: '#1a56db',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              교재 둘러보기
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              style={{
                padding: '11px 24px',
                background: '#fff',
                color: '#475569',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              관리자 페이지
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: '#64748b', marginBottom: 20 }}>
            주문할 상품이 없습니다.
          </p>
          <button
            onClick={() => navigate('/books')}
            style={{
              padding: '12px 32px',
              background: '#1a56db',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            교재 둘러보기
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AlertModal
        open={modal.open}
        type={modal.type}
        message={modal.message}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      />
      <div
        style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 0' }}
      >
        <div className="container" style={{ padding: '0 24px' }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#1e293b',
              margin: '0 0 8px',
              letterSpacing: '-0.5px',
            }}
          >
            주문/결제
          </h1>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 360px',
              gap: 24,
              alignItems: 'start',
              marginTop: 24,
            }}
          >
            {/* 왼쪽: 주문 상품 → 보내는 분 → 받는 분 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* 1. 주문 상품 */}
              <SectionCard title={`주문 상품 (${items.length}종)`}>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
                >
                  {items.map((item, idx) => {
                    const color = SUBJECT_COLORS[item.subject] ?? '#64748b';
                    return (
                      <div
                        key={item.productId}
                        style={{
                          display: 'flex',
                          gap: 14,
                          alignItems: 'center',
                          padding: '14px 0',
                          borderBottom:
                            idx < items.length - 1
                              ? '1px solid #f1f5f9'
                              : 'none',
                        }}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 60,
                            borderRadius: 8,
                            background: `linear-gradient(135deg, ${color}22, ${color}44)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                            flexShrink: 0,
                          }}
                        >
                          📗
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: '#1e293b',
                              margin: '0 0 4px',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.title}
                          </p>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                color: color,
                                background: `${color}15`,
                                padding: '2px 8px',
                                borderRadius: 20,
                                fontWeight: 600,
                              }}
                            >
                              {item.subject}
                            </span>
                            <span style={{ fontSize: 13, color: '#64748b' }}>
                              {item.quantity}권
                            </span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: '#1a56db',
                              margin: 0,
                            }}
                          >
                            {(item.price * item.quantity).toLocaleString()}원
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              color: '#94a3b8',
                              margin: '2px 0 0',
                            }}
                          >
                            {item.price.toLocaleString()}원 × {item.quantity}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 14, color: '#64748b' }}>
                    상품 합계
                  </span>
                  <span
                    style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}
                  >
                    {totalAmount.toLocaleString()}원
                  </span>
                </div>
              </SectionCard>

              {/* 2. 보내는 분 */}
              <SectionCard
                title="보내는 분"
                extra={
                  isLoggedIn ? (
                    <button
                      type="button"
                      onClick={loadProfile}
                      disabled={profileLoading}
                      style={{
                        padding: '7px 14px',
                        background: profileLoaded ? '#f0fdf4' : '#eff6ff',
                        border: `1px solid ${profileLoaded ? '#86efac' : '#93c5fd'}`,
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        color: profileLoaded ? '#16a34a' : '#1a56db',
                        cursor: profileLoading ? 'wait' : 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {profileLoading
                        ? '불러오는 중...'
                        : profileLoaded
                          ? '✓ 내 정보 적용됨'
                          : '내 정보 불러오기'}
                    </button>
                  ) : undefined
                }
              >
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 16,
                    }}
                  >
                    <Field label="이름" required>
                      <input
                        style={inputStyle}
                        placeholder="보내는 분 이름"
                        value={form.senderName}
                        onChange={set('senderName')}
                      />
                    </Field>
                    <Field label="연락처" required>
                      <input
                        style={inputStyle}
                        placeholder="01012345678"
                        value={form.senderPhone}
                        onChange={set('senderPhone')}
                        maxLength={11}
                      />
                    </Field>
                  </div>
                  <Field label="우편번호" required>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        style={{ ...inputStyle, width: 120, flexShrink: 0 }}
                        placeholder="12345"
                        value={form.senderZipCode}
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={() => openDaumPost('sender')}
                        style={{
                          padding: '11px 16px',
                          background: '#1a56db',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        주소 검색
                      </button>
                    </div>
                  </Field>
                  <Field label="주소" required>
                    <input
                      style={{ ...inputStyle, background: '#f8fafc' }}
                      placeholder="도로명 주소"
                      value={form.senderAddress}
                      readOnly
                    />
                  </Field>
                  <Field label="상세 주소">
                    <input
                      style={inputStyle}
                      placeholder="상세 주소 (동/호수 등)"
                      value={form.senderAddressDetail}
                      onChange={set('senderAddressDetail')}
                    />
                  </Field>
                </div>
              </SectionCard>

              {/* 3. 받는 분 */}
              <SectionCard title="받는 분">
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  {/* 보내는 분과 동일 체크박스 */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      padding: '10px 14px',
                      background: sameAsSender ? '#eff6ff' : '#f8fafc',
                      border: `1px solid ${sameAsSender ? '#93c5fd' : '#e2e8f0'}`,
                      borderRadius: 8,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={sameAsSender}
                      onChange={(e) => handleSameAsSender(e.target.checked)}
                      style={{
                        width: 16,
                        height: 16,
                        accentColor: '#1a56db',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: sameAsSender ? '#1a56db' : '#475569',
                      }}
                    >
                      보내는 분과 동일
                    </span>
                  </label>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 16,
                    }}
                  >
                    <Field label="이름" required>
                      <input
                        style={{
                          ...inputStyle,
                          background: sameAsSender ? '#f8fafc' : '#fff',
                        }}
                        placeholder="받는 분 이름"
                        value={form.recipientName}
                        onChange={set('recipientName')}
                        readOnly={sameAsSender}
                      />
                    </Field>
                    <Field label="휴대폰 번호" required>
                      <input
                        style={{
                          ...inputStyle,
                          background: sameAsSender ? '#f8fafc' : '#fff',
                        }}
                        placeholder="01012345678"
                        value={form.phoneNumber}
                        onChange={set('phoneNumber')}
                        maxLength={11}
                        readOnly={sameAsSender}
                      />
                    </Field>
                  </div>

                  <Field label="우편번호" required>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        style={{ ...inputStyle, width: 120, flexShrink: 0 }}
                        placeholder="12345"
                        value={form.zipCode}
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={() => openDaumPost('recipient')}
                        style={{
                          padding: '11px 16px',
                          background: '#1a56db',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        주소 검색
                      </button>
                    </div>
                  </Field>
                  <Field label="주소" required>
                    <input
                      style={{ ...inputStyle, background: '#f8fafc' }}
                      placeholder="도로명 주소"
                      value={form.address}
                      readOnly
                    />
                  </Field>
                  <Field label="상세 주소">
                    <input
                      style={inputStyle}
                      placeholder="상세 주소 (동/호수 등)"
                      value={form.addressDetail}
                      onChange={set('addressDetail')}
                    />
                  </Field>
                  <Field label="배송 메모">
                    <select
                      style={{ ...inputStyle }}
                      value={form.deliveryMemo}
                      onChange={set('deliveryMemo')}
                    >
                      <option value="">선택 안 함</option>
                      <option value="문 앞에 놓아주세요">
                        문 앞에 놓아주세요
                      </option>
                      <option value="경비실에 맡겨주세요">
                        경비실에 맡겨주세요
                      </option>
                      <option value="배송 전 연락 바랍니다">
                        배송 전 연락 바랍니다
                      </option>
                    </select>
                  </Field>
                </div>
              </SectionCard>
            </div>

            {/* 오른쪽: 결제 금액 → 결제 수단 → 결제하기 버튼 */}
            <div
              style={{
                position: 'sticky',
                top: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {/* 결제 금액 */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  padding: '24px',
                }}
              >
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: '#1e293b',
                    margin: '0 0 20px',
                  }}
                >
                  결제 금액
                </h2>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 14,
                      color: '#475569',
                    }}
                  >
                    <span>상품 금액</span>
                    <span>{totalAmount.toLocaleString()}원</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 14,
                      color: '#475569',
                    }}
                  >
                    <span>배송비</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span style={{ color: '#10b981', fontWeight: 600 }}>
                          무료
                        </span>
                      ) : (
                        `${deliveryFee.toLocaleString()}원`
                      )}
                    </span>
                  </div>
                  {deliveryFee > 0 && (
                    <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                      30,000원 이상 구매 시 무료 배송
                    </p>
                  )}
                  <div
                    style={{
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: 14,
                      marginTop: 4,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#1e293b',
                      }}
                    >
                      총 결제금액
                    </span>
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 900,
                        color: '#1a56db',
                        letterSpacing: '-0.5px',
                      }}
                    >
                      {finalAmount.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>

              {/* 결제 수단 */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  padding: '24px',
                }}
              >
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: '#1e293b',
                    margin: '0 0 16px',
                  }}
                >
                  결제 수단
                </h2>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  {cardEnabled && (
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 16px',
                        borderRadius: 10,
                        cursor: 'pointer',
                        border: `2px solid ${paymentMethod === 'PG' ? '#1a56db' : '#e2e8f0'}`,
                        background: paymentMethod === 'PG' ? '#eff6ff' : '#fff',
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="PG"
                        checked={paymentMethod === 'PG'}
                        onChange={() => setPaymentMethod('PG')}
                        style={{ accentColor: '#1a56db' }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#1e293b',
                          }}
                        >
                          💳 카드 / 간편결제
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: '#64748b',
                            marginTop: 2,
                          }}
                        >
                          신용카드, 카카오페이, 토스 등
                        </div>
                      </div>
                    </label>
                  )}

                  {bankSetting ? (
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 16px',
                        borderRadius: 10,
                        cursor: 'pointer',
                        border: `2px solid ${paymentMethod === 'BANK_TRANSFER' ? '#1a56db' : '#e2e8f0'}`,
                        background:
                          paymentMethod === 'BANK_TRANSFER'
                            ? '#eff6ff'
                            : '#fff',
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="BANK_TRANSFER"
                        checked={paymentMethod === 'BANK_TRANSFER'}
                        onChange={() => setPaymentMethod('BANK_TRANSFER')}
                        style={{ accentColor: '#1a56db' }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#1e293b',
                          }}
                        >
                          🏦 무통장 입금
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: '#64748b',
                            marginTop: 2,
                          }}
                        >
                          입금 확인 후 주문이 처리됩니다
                        </div>
                      </div>
                    </label>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 16px',
                        borderRadius: 10,
                        border: '2px solid #f1f5f9',
                        background: '#f8fafc',
                        opacity: 0.6,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#94a3b8',
                          }}
                        >
                          🏦 무통장 입금
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: '#94a3b8',
                            marginTop: 2,
                          }}
                        >
                          현재 사용 불가
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 무통장 계좌 정보 */}
                  {paymentMethod === 'BANK_TRANSFER' && bankSetting && (
                    <div
                      style={{
                        padding: '14px 16px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                      }}
                    >
                      <p
                        style={{
                          margin: '0 0 10px',
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#475569',
                        }}
                      >
                        입금 계좌 정보
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                          <span style={{ color: '#64748b', minWidth: 56 }}>
                            은행
                          </span>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>
                            {bankSetting.bankName}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                          <span style={{ color: '#64748b', minWidth: 56 }}>
                            계좌번호
                          </span>
                          <span
                            style={{
                              fontWeight: 700,
                              color: '#1e293b',
                              fontFamily: 'monospace',
                            }}
                          >
                            {bankSetting.accountNumber}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                          <span style={{ color: '#64748b', minWidth: 56 }}>
                            예금주
                          </span>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>
                            {bankSetting.accountHolder}
                          </span>
                        </div>
                      </div>
                      {bankSetting.depositNote && (
                        <p
                          style={{
                            margin: '10px 0 0',
                            fontSize: 12,
                            color: '#f59e0b',
                            fontWeight: 600,
                            background: '#fefce8',
                            padding: '8px 10px',
                            borderRadius: 6,
                            border: '1px solid #fde68a',
                          }}
                        >
                          ⚠ {bankSetting.depositNote}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 결제하기 버튼 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: submitting ? '#93c5fd' : '#1a56db',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting
                    ? '주문 처리 중...'
                    : paymentMethod === 'BANK_TRANSFER'
                      ? `${finalAmount.toLocaleString()}원 주문하기 (무통장 입금)`
                      : `${finalAmount.toLocaleString()}원 결제하기`}
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#fff',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  장바구니로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
