import { useState } from 'react';

interface ModalState<TType extends string, TItem> {
  type: TType | null;
  item: TItem | null;
}

/**
 * 어드민 테이블 페이지의 모달 상태(타입 + 대상 아이템)를 관리합니다.
 *
 * @example
 * const { modal, open, close } = useModal<'edit' | 'delete', Member>();
 * open('edit', member);   // 수정 모달 열기
 * open('delete', member); // 삭제 모달 열기
 * close();                // 모달 닫기
 * modal.type              // 현재 열린 모달 종류
 * modal.item              // 현재 대상 아이템
 */
export function useModal<TType extends string, TItem = unknown>() {
  const [modal, setModal] = useState<ModalState<TType, TItem>>({
    type: null,
    item: null,
  });

  const open = (type: TType, item?: TItem) =>
    setModal({ type, item: item ?? null });

  const close = () => setModal({ type: null, item: null });

  return { modal, open, close };
}
