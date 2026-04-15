import api from './axios';
import type { OrderPageResponse } from '../types/order';

export interface UserProfile {
  userId: string;
  userName: string;
  email: string;
  phoneNumber: string;
  zipCode: string;
  address: string;
  addressDetail: string;
}

export interface UserUpdateRequest {
  userName: string;
  email: string;
  phoneNumber: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  currentPassword?: string;
  newPassword?: string;
}

export const getMyProfile = async (): Promise<UserProfile> => {
  const { data } = await api.get('/users/me');
  return data.data;
};

export const updateMyProfile = async (req: UserUpdateRequest): Promise<UserProfile> => {
  const { data } = await api.put('/users/me', req);
  return data.data;
};

export const getMyOrders = async (page = 0, size = 10): Promise<OrderPageResponse> => {
  const { data } = await api.get('/orders/my', { params: { page, size } });
  return data.data;
};
