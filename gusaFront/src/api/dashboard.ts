import type { DashboardStats } from '../types/dashboard';
import api from './axios';

interface ApiWrapper<T> {
  status: number;
  message: string;
  data: T;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get<ApiWrapper<DashboardStats>>('/admin/dashboard/stats');
  return res.data.data;
};
