interface Props {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  confirmClass?: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel = '확인',
  confirmClass = 'admin-btn-danger',
  onConfirm,
  onClose,
}: Props) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="admin-btn admin-btn-outline" onClick={onClose}>취소</button>
          <button className={`admin-btn ${confirmClass}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
