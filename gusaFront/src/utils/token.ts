export const getAccessToken = (): string | null =>
  localStorage.getItem('accessToken');

export const getRefreshToken = (): string | null =>
  localStorage.getItem('refreshToken');

export const setToken = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const clearToken = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

/** JWT payload를 디코딩해 role claim을 반환합니다. */
export const getRoleFromToken = (): string | null => {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
};

export const isAdmin = (): boolean => getRoleFromToken() === 'ROLE_ADMIN';
