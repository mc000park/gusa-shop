import type { SignupRequest, TokenResponse, LoginResponse } from '../types/auth';
import api from './axios';

export const login = async (userId: string, userPw: string): Promise<LoginResponse> => {
  const res = await api.post<{ data: LoginResponse }>('/auth/login', { userId, userPw });
  return res.data.data;
};

export const adminLogin = async (userId: string, userPw: string): Promise<LoginResponse> => {
  const res = await api.post<{ data: LoginResponse }>('/auth/admin/login', { userId, userPw });
  return res.data.data;
};

export const refreshToken = async (
  refreshToken: string,
): Promise<TokenResponse> => {
  const response = await api.post<{ data: TokenResponse }>('/auth/refresh', {
    refreshToken,
  });
  return response.data.data;
};

export const signup = async (data: SignupRequest): Promise<void> => {
  await api.post('/auth/signup', data);
};

export const sendVerificationCode = async (phoneNumber: string): Promise<void> => {
  await api.post('/auth/send-code', { phoneNumber });
};

export const verifyCode = async (phoneNumber: string, code: string): Promise<void> => {
  await api.post('/auth/verify-code', { phoneNumber, code });
};
