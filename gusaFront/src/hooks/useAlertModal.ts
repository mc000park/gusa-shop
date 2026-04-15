import { useState } from 'react';

type AlertType = 'success' | 'error' | 'info';

interface AlertState {
  open: boolean;
  type: AlertType;
  message: string;
  onClose?: () => void;
}

/**
 * AlertModal 컴포넌트의 상태를 관리합니다.
 *
 * @example
 * const { alert, show, close } = useAlertModal();
 * show('success', '저장되었습니다.');
 * show('error', '오류가 발생했습니다.');
 * show('info', '안내 메시지', () => navigate('/login')); // 닫힌 후 콜백
 *
 * <AlertModal open={alert.open} type={alert.type} message={alert.message} onClose={close} />
 */
export function useAlertModal() {
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    type: 'info',
    message: '',
  });

  const show = (type: AlertType, message: string, onClose?: () => void) =>
    setAlert({ open: true, type, message, onClose });

  const close = () => {
    const cb = alert.onClose;
    setAlert((prev) => ({ ...prev, open: false }));
    cb?.();
  };

  return { alert, show, close };
}
