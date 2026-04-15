import { useEffect, useState } from 'react';

/**
 * 값이 변경된 후 delay ms 동안 추가 변경이 없으면 업데이트된 값을 반환합니다.
 * 검색 입력처럼 빠른 연속 이벤트의 API 호출 빈도를 줄일 때 사용합니다.
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
