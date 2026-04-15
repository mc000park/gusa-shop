import api from './axios';
import type { Order, OrderCreateRequest, OrderPageResponse } from '../types/order';

interface GetOrdersParams {
  keyword?: string;
  status?: string;
  page?: number;
  size?: number;
}

export const getAdminOrders = async (params: GetOrdersParams = {}): Promise<OrderPageResponse> => {
  const { data } = await api.get('/admin/orders', { params: { page: 0, size: 10, ...params } });
  return data.data;
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<Order> => {
  const { data } = await api.put(`/admin/orders/${orderId}/status`, { status });
  return data.data;
};

export const createOrder = async (req: OrderCreateRequest): Promise<Order> => {
  const { data } = await api.post('/orders', req);
  return data.data;
};

export const createGuestOrder = async (req: OrderCreateRequest): Promise<Order> => {
  const { data } = await api.post('/orders/guest', req);
  return data.data;
};
