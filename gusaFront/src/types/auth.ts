export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

export interface SignupRequest {
  userId: string;
  password: string;
  userName: string;
  email: string;
  phoneNumber: string;
  zipCode: string;
  address: string;
  addressDetail: string;
}
