import { useEffect, useRef, useState } from 'react';
import { fetchPgSettings, savePgSetting } from '../../api/pgSettings';
import {
  getAdminBankSetting,
  saveAdminBankSetting,
  type BankSetting,
} from '../../api/bankSetting';
import type { PgFormState, PgSettingResponse } from '../../types/pgSetting';

/* ─── PG 설정 상수 ─────────────────────────────────────────────── */
const PG_LIST = [
  {
    id: 'inicis',
    name: 'KG이니시스',
    desc: '국내 1위 PG사, 다양한 결제수단 지원',
  },
  {
    id: 'nicepay',
    name: '나이스페이',
    desc: '안정적인 결제 서비스, 기업 선호 1위',
  },
  {
    id: 'kakao',
    name: '카카오페이',
    desc: '간편결제, 2030 사용자 점유율 1위',
  },
  {
    id: 'naver',
    name: '네이버페이',
    desc: '네이버 쇼핑 연동, 빠른 결제',
  },
  {
    id: 'toss',
    name: '토스페이먼츠',
    desc: '핀테크 기반 간편결제 서비스',
  },
] as const;

const ALL_METHODS = [
  '신용카드',
  '계좌이체',
  '가상계좌',
  '휴대폰결제',
  '카카오페이',
  '네이버페이',
  '토스페이',
];
const DEFAULT_METHODS = ['신용카드', '계좌이체', '가상계좌'];

const emptyPgForm = (): PgFormState => ({
  merchantId: '',
  apiKey: '',
  apiSecret: '',
  mode: 'test',
  paymentMethods: DEFAULT_METHODS,
  enabled: true,
});

const emptyBankForm = (): BankSetting => ({
  bankName: '',
  accountNumber: '',
  accountHolder: '',
  depositNote: '',
  enabled: false,
  cardEnabled: true,
});

type Tab = 'pg' | 'bank';

/* ─── 컴포넌트 ──────────────────────────────────────────────────── */
const SettingsPage = () => {
  const [tab, setTab] = useState<Tab>('pg');

  /* PG 상태 */
  const [selectedPg, setSelectedPg] = useState<string>('inicis');
  const [forms, setForms] = useState<Record<string, PgFormState>>({});
  const [pgLoading, setPgLoading] = useState(true);
  const [pgSaving, setPgSaving] = useState(false);

  /* 무통장 상태 */
  const [bankForm, setBankForm] = useState<BankSetting>(emptyBankForm());
  const [bankLoading, setBankLoading] = useState(true);
  const [bankSaving, setBankSaving] = useState(false);

  /* 토스트 */
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  /* 초기 로딩 */
  useEffect(() => {
    fetchPgSettings()
      .then((list) => {
        const map: Record<string, PgFormState> = {};
        list.forEach((s: PgSettingResponse) => {
          map[s.pgProvider] = {
            merchantId: s.merchantId ?? '',
            apiKey: s.apiKey ?? '',
            apiSecret: '',
            mode: s.mode ?? 'test',
            paymentMethods: s.paymentMethods ?? DEFAULT_METHODS,
            enabled: s.enabled,
          };
        });
        setForms(map);
      })
      .catch(() => showToast('error', 'PG 설정을 불러오지 못했습니다.'))
      .finally(() => setPgLoading(false));

    getAdminBankSetting()
      .then((s) => setBankForm(s))
      .catch(() => {})
      .finally(() => setBankLoading(false));
  }, []);

  /* ── PG 핸들러 ── */
  const currentForm = forms[selectedPg] ?? emptyPgForm();

  const updatePgForm = (patch: Partial<PgFormState>) => {
    setForms((prev) => ({
      ...prev,
      [selectedPg]: { ...(prev[selectedPg] ?? emptyPgForm()), ...patch },
    }));
  };

  const toggleMethod = (method: string) => {
    const methods = currentForm.paymentMethods.includes(method)
      ? currentForm.paymentMethods.filter((m) => m !== method)
      : [...currentForm.paymentMethods, method];
    updatePgForm({ paymentMethods: methods });
  };

  const handlePgSave = async () => {
    setPgSaving(true);
    try {
      await savePgSetting({ pgProvider: selectedPg, ...currentForm });
      showToast('success', 'PG 설정이 저장되었습니다.');
    } catch {
      showToast('error', '저장에 실패했습니다.');
    } finally {
      setPgSaving(false);
    }
  };

  /* ── 무통장 핸들러 ── */
  const handleBankSave = async (
    successMsg = '무통장 입금 정보가 저장되었습니다.',
  ) => {
    if (bankForm.enabled) {
      if (
        !bankForm.bankName.trim() ||
        !bankForm.accountNumber.trim() ||
        !bankForm.accountHolder.trim()
      ) {
        showToast('error', '은행명, 계좌번호, 예금주는 필수 입력 항목입니다.');
        return;
      }
    }
    setBankSaving(true);
    try {
      const saved = await saveAdminBankSetting(bankForm);
      setBankForm(saved);
      showToast('success', successMsg);
    } catch {
      showToast('error', '저장에 실패했습니다.');
    } finally {
      setBankSaving(false);
    }
  };

  /* ── 탭 스타일 ── */
  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 24px',
    border: 'none',
    borderBottom: `2px solid ${active ? '#1a56db' : 'transparent'}`,
    background: 'none',
    fontSize: 14,
    fontWeight: active ? 700 : 500,
    color: active ? '#1a56db' : '#64748b',
    cursor: 'pointer',
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">쇼핑몰 설정</h1>
          <p className="admin-page-sub">
            PG사 연동 및 무통장 입금 계좌를 관리하세요
          </p>
        </div>
        {toast && (
          <span
            style={{
              background: toast.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: toast.type === 'success' ? '#065f46' : '#991b1b',
              padding: '8px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {toast.type === 'success' ? '✓ ' : '✕ '}
            {toast.msg}
          </span>
        )}
      </div>

      {/* 탭 */}
      <div style={{ borderBottom: '1px solid #e2e8f0', marginBottom: 24 }}>
        <button style={tabStyle(tab === 'pg')} onClick={() => setTab('pg')}>
          PG사 연동
        </button>
        <button style={tabStyle(tab === 'bank')} onClick={() => setTab('bank')}>
          무통장 입금
        </button>
      </div>

      {/* ═══ PG 탭 ═══ */}
      {tab === 'pg' &&
        (pgLoading || bankLoading ? (
          <div
            style={{ display: 'flex', justifyContent: 'center', padding: 80 }}
          >
            <span style={{ color: '#94a3b8', fontSize: 14 }}>
              설정 로딩 중...
            </span>
          </div>
        ) : (
          <>
            {/* 카드결제 전역 표시 설정 */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 24,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <p
                    className="form-section-title"
                    style={{ margin: '0 0 4px' }}
                  >
                    카드결제 표시 설정
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                    비활성화 시 주문 화면에서 카드 / 간편결제 옵션이 숨겨집니다.
                  </p>
                </div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: 44,
                      height: 24,
                      background: bankForm.cardEnabled ? '#1a56db' : '#cbd5e1',
                      borderRadius: 12,
                      transition: 'background 0.2s',
                      cursor: 'pointer',
                    }}
                    onClick={() =>
                      setBankForm((prev) => ({
                        ...prev,
                        cardEnabled: !prev.cardEnabled,
                      }))
                    }
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 3,
                        left: bankForm.cardEnabled ? 23 : 3,
                        width: 18,
                        height: 18,
                        background: '#fff',
                        borderRadius: '50%',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: bankForm.cardEnabled ? '#1a56db' : '#64748b',
                      minWidth: 56,
                    }}
                  >
                    {bankForm.cardEnabled ? '표시' : '숨김'}
                  </span>
                </label>
              </div>
              {!bankForm.cardEnabled && (
                <div
                  style={{
                    marginTop: 16,
                    padding: '12px 16px',
                    background: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#92400e',
                  }}
                >
                  ⚠ 카드결제가 비활성화되어 있습니다. 저장 후 주문 화면에서 카드
                  / 간편결제 옵션이 표시되지 않습니다.
                </div>
              )}
              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  className="admin-btn admin-btn-primary"
                  onClick={() =>
                    handleBankSave('카드결제 설정이 저장되었습니다.')
                  }
                  disabled={bankSaving}
                  style={{ minWidth: 100 }}
                >
                  {bankSaving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>

            {/* PG사 선택 */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 24,
                marginBottom: 24,
              }}
            >
              <p className="form-section-title">PG사 선택</p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 16,
                }}
              >
                {PG_LIST.map((pg) => {
                  const isSaved = !!forms[pg.id]?.apiKey;
                  return (
                    <div
                      key={pg.id}
                      className={`pg-card${selectedPg === pg.id ? ' selected' : ''}`}
                      onClick={() => setSelectedPg(pg.id)}
                    >
                      <div className="pg-card-header">
                        <div>
                          <div className="pg-name">{pg.name}</div>
                          <div
                            style={{ display: 'flex', gap: 4, marginTop: 2 }}
                          >
                            {isSaved && (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: '#065f46',
                                  fontWeight: 700,
                                  background: '#d1fae5',
                                  padding: '1px 7px',
                                  borderRadius: 100,
                                }}
                              >
                                설정완료
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="pg-desc">{pg.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* API 설정 */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 24,
                marginBottom: 24,
              }}
            >
              <p className="form-section-title">
                {PG_LIST.find((p) => p.id === selectedPg)?.name} API 설정
              </p>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                {(['test', 'production'] as const).map((mode) => (
                  <label
                    key={mode}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={mode}
                      checked={currentForm.mode === mode}
                      onChange={() => updatePgForm({ mode })}
                      style={{ accentColor: '#1a56db' }}
                    />
                    <span
                      style={{
                        fontWeight: currentForm.mode === mode ? 700 : 400,
                      }}
                    >
                      {mode === 'test' ? '테스트 모드' : '운영 모드'}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: mode === 'test' ? '#f59e0b' : '#ef4444',
                        background: mode === 'test' ? '#fef3c7' : '#fee2e2',
                        padding: '1px 7px',
                        borderRadius: 100,
                      }}
                    >
                      {mode === 'test' ? 'TEST' : 'LIVE'}
                    </span>
                  </label>
                ))}
              </div>
              {currentForm.mode === 'production' && (
                <div
                  style={{
                    background: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: 8,
                    padding: '12px 16px',
                    marginBottom: 20,
                    fontSize: 13,
                    color: '#92400e',
                  }}
                >
                  운영 모드에서는 실제 결제가 발생합니다. API 키를 정확히
                  입력하세요.
                </div>
              )}
              <div className="form-grid-2">
                <div className="form-row">
                  <label className="form-label">가맹점 ID (Merchant ID)</label>
                  <input
                    className="form-input"
                    value={currentForm.merchantId}
                    onChange={(e) =>
                      updatePgForm({ merchantId: e.target.value })
                    }
                    placeholder="가맹점 ID"
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">API Key</label>
                  <input
                    className="form-input"
                    value={currentForm.apiKey}
                    onChange={(e) => updatePgForm({ apiKey: e.target.value })}
                    placeholder="API Key"
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">Secret Key</label>
                  <input
                    className="form-input"
                    type="password"
                    value={currentForm.apiSecret}
                    onChange={(e) =>
                      updatePgForm({ apiSecret: e.target.value })
                    }
                    placeholder="변경 시에만 입력하세요"
                  />
                </div>
                <div
                  className="form-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    paddingTop: 28,
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={currentForm.enabled}
                      onChange={(e) =>
                        updatePgForm({ enabled: e.target.checked })
                      }
                      style={{ accentColor: '#1a56db', width: 16, height: 16 }}
                    />
                    <span style={{ fontWeight: 600 }}>PG사 활성화</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 결제 수단 */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 24,
                marginBottom: 24,
              }}
            >
              <p className="form-section-title">사용 결제 수단</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {ALL_METHODS.map((method) => (
                  <label
                    key={method}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={currentForm.paymentMethods.includes(method)}
                      onChange={() => toggleMethod(method)}
                      style={{ accentColor: '#1a56db' }}
                    />
                    {method}
                  </label>
                ))}
              </div>
            </div>

            <div
              style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}
            >
              <button
                className="admin-btn admin-btn-outline"
                onClick={() =>
                  setForms((prev) => ({ ...prev, [selectedPg]: emptyPgForm() }))
                }
                disabled={pgSaving}
              >
                초기화
              </button>
              <button
                className="admin-btn admin-btn-primary"
                onClick={handlePgSave}
                disabled={pgSaving}
              >
                {pgSaving ? '저장 중...' : '설정 저장'}
              </button>
            </div>
          </>
        ))}

      {/* ═══ 무통장 입금 탭 ═══ */}
      {tab === 'bank' &&
        (bankLoading ? (
          <div
            style={{ display: 'flex', justifyContent: 'center', padding: 80 }}
          >
            <span style={{ color: '#94a3b8', fontSize: 14 }}>
              설정 로딩 중...
            </span>
          </div>
        ) : (
          <>
            <div
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 24,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 24,
                }}
              >
                <p className="form-section-title" style={{ margin: 0 }}>
                  계좌 정보
                </p>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={bankForm.enabled}
                    onChange={(e) =>
                      setBankForm({ ...bankForm, enabled: e.target.checked })
                    }
                    style={{ accentColor: '#1a56db', width: 16, height: 16 }}
                  />
                  <span
                    style={{
                      fontWeight: 700,
                      color: bankForm.enabled ? '#1a56db' : '#64748b',
                    }}
                  >
                    무통장 입금 활성화
                  </span>
                </label>
              </div>

              {!bankForm.enabled && (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '12px 16px',
                    marginBottom: 20,
                    fontSize: 13,
                    color: '#64748b',
                  }}
                >
                  비활성화 상태입니다. 주문 화면에서 무통장 입금 옵션이 표시되지
                  않습니다.
                </div>
              )}

              <div className="form-grid-2">
                <div className="form-row">
                  <label className="form-label">
                    은행명 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    className="form-input"
                    value={bankForm.bankName}
                    onChange={(e) =>
                      setBankForm({ ...bankForm, bankName: e.target.value })
                    }
                    placeholder="예) 국민은행"
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">
                    계좌번호 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    className="form-input"
                    value={bankForm.accountNumber}
                    onChange={(e) =>
                      setBankForm({
                        ...bankForm,
                        accountNumber: e.target.value,
                      })
                    }
                    placeholder="예) 123-456-789012"
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">
                    예금주 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    className="form-input"
                    value={bankForm.accountHolder}
                    onChange={(e) =>
                      setBankForm({
                        ...bankForm,
                        accountHolder: e.target.value,
                      })
                    }
                    placeholder="예) (주)구사"
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">입금 안내 문구</label>
                  <input
                    className="form-input"
                    value={bankForm.depositNote}
                    onChange={(e) =>
                      setBankForm({ ...bankForm, depositNote: e.target.value })
                    }
                    placeholder="예) 주문번호를 입금자명에 기재해주세요"
                  />
                </div>
              </div>
            </div>

            {/* 미리보기 */}
            {bankForm.enabled && bankForm.bankName && (
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 24,
                  marginBottom: 24,
                }}
              >
                <p className="form-section-title">주문 화면 미리보기</p>
                <div
                  style={{
                    maxWidth: 400,
                    padding: '16px 20px',
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
                    style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                  >
                    <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                      <span style={{ color: '#64748b', minWidth: 60 }}>
                        은행
                      </span>
                      <span style={{ fontWeight: 700 }}>
                        {bankForm.bankName || '—'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                      <span style={{ color: '#64748b', minWidth: 60 }}>
                        계좌번호
                      </span>
                      <span
                        style={{ fontWeight: 700, fontFamily: 'monospace' }}
                      >
                        {bankForm.accountNumber || '—'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                      <span style={{ color: '#64748b', minWidth: 60 }}>
                        예금주
                      </span>
                      <span style={{ fontWeight: 700 }}>
                        {bankForm.accountHolder || '—'}
                      </span>
                    </div>
                  </div>
                  {bankForm.depositNote && (
                    <p
                      style={{
                        margin: '12px 0 0',
                        fontSize: 13,
                        color: '#f59e0b',
                        fontWeight: 600,
                        background: '#fefce8',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #fde68a',
                      }}
                    >
                      ⚠ {bankForm.depositNote}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div
              style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}
            >
              <button
                className="admin-btn admin-btn-outline"
                onClick={() => setBankForm(emptyBankForm())}
                disabled={bankSaving}
              >
                초기화
              </button>
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => handleBankSave()}
                disabled={bankSaving}
              >
                {bankSaving ? '저장 중...' : '설정 저장'}
              </button>
            </div>
          </>
        ))}
    </div>
  );
};

export default SettingsPage;
