import api from './axios';
import type { Member, MemberPageResponse, MemberUpdateRequest } from '../types/member';

interface GetMembersParams {
  keyword?: string;
  grade?: string;
  enabled?: boolean;
  page?: number;
  size?: number;
}

export const getMembers = async (params: GetMembersParams = {}): Promise<MemberPageResponse> => {
  const query: Record<string, string | number | boolean> = {
    page: params.page ?? 0,
    size: params.size ?? 10,
  };
  if (params.keyword) query.keyword = params.keyword;
  if (params.grade) query.grade = params.grade;
  if (params.enabled !== undefined) query.enabled = params.enabled;

  const { data } = await api.get('/admin/users', { params: query });
  return data.data;
};

export const updateMember = async (id: number, req: MemberUpdateRequest): Promise<Member> => {
  const { data } = await api.put(`/admin/users/${id}`, req);
  return data.data;
};

export const deleteMember = async (id: number): Promise<void> => {
  await api.delete(`/admin/users/${id}`);
};
