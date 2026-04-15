import type { PgSettingRequest, PgSettingResponse } from '../types/pgSetting';
import api from './axios';

interface ApiWrapper<T> {
  status: number;
  message: string;
  data: T;
}

export const fetchPgSettings = async (): Promise<PgSettingResponse[]> => {
  const res = await api.get<ApiWrapper<PgSettingResponse[]>>('/admin/pg-settings');
  return res.data.data;
};

export const savePgSetting = async (req: PgSettingRequest): Promise<PgSettingResponse> => {
  const res = await api.post<ApiWrapper<PgSettingResponse>>('/admin/pg-settings', req);
  return res.data.data;
};
