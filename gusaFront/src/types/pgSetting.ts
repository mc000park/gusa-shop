export interface PgSettingResponse {
  id?: number;
  pgProvider: string;
  merchantId: string;
  apiKey: string;
  mode: 'test' | 'production';
  paymentMethods: string[];
  enabled: boolean;
  updatedAt?: string;
}

export interface PgSettingRequest {
  pgProvider: string;
  merchantId: string;
  apiKey: string;
  apiSecret: string;
  mode: 'test' | 'production';
  paymentMethods: string[];
  enabled: boolean;
}

export type PgFormState = Omit<PgSettingRequest, 'pgProvider'>;
