import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import type { TokenResponse } from '../types/auth';
import {
  clearToken,
  getAccessToken,
  getRefreshToken,
  setToken,
} from '../utils/token';
import { refreshToken } from './auth';

// axios 인스턴스 생성
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// refresh 완료 시 대기 요청 처리
const onRefreshed = (token: string): void => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback);
};

// 요청 인터셉터
instance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// custom 타입 (retry 플래그)
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// 응답 인터셉터
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 로그인 엔드포인트의 401은 인터셉터에서 처리하지 않음 (호출부에서 catch)
    const requestUrl = originalRequest.url ?? '';
    if (requestUrl.includes('/auth/')) {
      return Promise.reject(error);
    }

    // 401 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(instance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshTokenValue = getRefreshToken();

        if (!refreshTokenValue) {
          throw new Error('No refresh token');
        }

        const tokenData: TokenResponse = await refreshToken(refreshTokenValue);

        const { accessToken, refreshToken: newRefreshToken } = tokenData;

        setToken(accessToken, newRefreshToken);

        isRefreshing = false;
        onRefreshed(accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return instance(originalRequest);
      } catch (err) {
        isRefreshing = false;
        clearToken();

        // 현재 경로가 /admin 하위이면 관리자 로그인으로 이동
        const isAdminPath = window.location.pathname.startsWith('/admin');
        window.location.href = isAdminPath ? '/admin/login' : '/login';

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
