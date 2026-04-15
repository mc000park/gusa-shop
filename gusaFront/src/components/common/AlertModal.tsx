import { useEffect } from 'react';

type AlertType = 'success' | 'error' | 'info';

interface Props {
  open: boolean;
  type?: AlertType;
  title?: string;
  message: string;
  onClose: () => void;
}

const icons: Record<AlertType, { symbol: string; color: string; bg: string }> =
  {
    success: { symbol: '✓', color: '#16a34a', bg: '#dcfce7' },
    error: { symbol: '✕', color: '#dc2626', bg: '#fee2e2' },
    info: { symbol: 'i', color: '#2563eb', bg: '#dbeafe' },
  };

const AlertModal = ({ open, type = 'info', title, message, onClose }: Props) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const icon = icons[type];
  const defaultTitle =
    type === 'success' ? '완료' : type === 'error' ? '오류' : '안내';

  return (
    <div className="alert-overlay" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="alert-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 아이콘 */}
        <div
          className="alert-icon"
          style={{ background: icon.bg, color: icon.color }}
        >
          {icon.symbol}
        </div>

        {/* 제목 */}
        <p className="alert-title">{title ?? defaultTitle}</p>

        {/* 메시지 */}
        <p className="alert-message">{message}</p>

        {/* 확인 버튼 */}
        <button
          className="alert-btn"
          style={{ background: icon.color }}
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
