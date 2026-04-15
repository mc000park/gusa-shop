import api from './axios';

export interface BankSetting {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  depositNote: string;
  enabled: boolean;
  cardEnabled: boolean;
}

export const getBankSetting = async (): Promise<BankSetting> => {
  const { data } = await api.get('/bank-setting');
  return data.data;
};

export const getAdminBankSetting = async (): Promise<BankSetting> => {
  const { data } = await api.get('/admin/bank-setting');
  return data.data;
};

export const saveAdminBankSetting = async (req: Omit<BankSetting, never>): Promise<BankSetting> => {
  const { data } = await api.put('/admin/bank-setting', req);
  return data.data;
};
