export interface Member {
  id: number;
  userId: string;
  userName: string;
  email: string;
  phoneNumber: string;
  grade: string | null;
  enabled: boolean;
  createdAt: string;
}

export interface MemberPageResponse {
  content: Member[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface MemberUpdateRequest {
  userName: string;
  email: string;
  phoneNumber: string;
  grade: string;
  enabled: boolean;
}
