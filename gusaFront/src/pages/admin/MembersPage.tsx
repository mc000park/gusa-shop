import { useState, useEffect } from 'react';
import Pagination from '../../components/admin/Pagination';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { getMembers, updateMember, deleteMember } from '../../api/members';
import type { Member, MemberUpdateRequest } from '../../types/member';
import { useDebounce } from '../../hooks/useDebounce';
import { useModal } from '../../hooks/useModal';

interface EditForm {
  userName: string;
  email: string;
  phoneNumber: string;
  grade: string;
  enabled: boolean;
}

const emptyForm: EditForm = {
  userName: '', email: '', phoneNumber: '', grade: '초등', enabled: true,
};

const GRADE_OPTIONS = ['초등', '중등', '고등'];
const SIZE_OPTIONS = [10, 20, 50];

const MembersPage = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const debouncedSearch = useDebounce(search);
  const { modal, open: openModal, close: closeModal } = useModal<'edit' | 'delete', Member>();

  // 검색어 변경 시 페이지 초기화
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  // 페이지·검색·필터·사이즈 변경 시 단일 fetch
  useEffect(() => {
    setLoading(true);
    setError('');

    const params: Parameters<typeof getMembers>[0] = {
      page,
      size,
      keyword: debouncedSearch || undefined,
      grade: gradeFilter || undefined,
    };
    if (statusFilter === '정상') params.enabled = true;
    else if (statusFilter === '정지') params.enabled = false;

    getMembers(params)
      .then((res) => {
        setMembers(res.content);
        setTotalElements(res.totalElements);
        setTotalPages(res.totalPages || 1);
      })
      .catch(() => setError('회원 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [page, size, debouncedSearch, gradeFilter, statusFilter, refreshKey]);

  const handleGradeFilter = (value: string) => { setGradeFilter(value); setPage(0); };
  const handleStatusFilter = (value: string) => { setStatusFilter(value); setPage(0); };
  const handleSize = (value: number) => { setSize(value); setPage(0); };

  const openEdit = (m: Member) => {
    setForm({
      userName: m.userName ?? '',
      email: m.email ?? '',
      phoneNumber: m.phoneNumber ?? '',
      grade: m.grade ?? '초등',
      enabled: m.enabled,
    });
    openModal('edit', m);
  };
  const openDelete = (m: Member) => openModal('delete', m);

  const handleSave = async () => {
    if (!modal.item) return;
    setSaving(true);
    try {
      const req: MemberUpdateRequest = { ...form };
      const updated = await updateMember(modal.item.id, req);
      setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      closeModal();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!modal.item) return;
    try {
      await deleteMember(modal.item.id);
      closeModal();
      const remaining = totalElements - 1;
      const maxPage = Math.max(0, Math.ceil(remaining / size) - 1);
      if (page > maxPage) {
        setPage(maxPage);
      } else {
        setRefreshKey((k) => k + 1);
      }
    } catch {}
  };

  const startRow = totalElements === 0 ? 0 : page * size + 1;
  const endRow   = Math.min((page + 1) * size, totalElements);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">회원 관리</h1>
          <p className="admin-page-sub">총 {totalElements.toLocaleString()}명의 회원</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <input
            placeholder="아이디, 이름, 이메일 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16 }}
            >
              ✕
            </button>
          )}
          {!search && <button>🔍</button>}
        </div>

        <select
          className="admin-filter-select"
          value={gradeFilter}
          onChange={(e) => handleGradeFilter(e.target.value)}
        >
          <option value="">전체 학년</option>
          {GRADE_OPTIONS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <select
          className="admin-filter-select"
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
        >
          <option value="">전체 상태</option>
          <option value="정상">정상</option>
          <option value="정지">정지</option>
        </select>

        <select
          className="admin-filter-select"
          value={size}
          onChange={(e) => handleSize(Number(e.target.value))}
        >
          {SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>페이지당 {s}명</option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ margin: '0 0 16px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 14 }}>
          {error}
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>아이디</th>
              <th>이름</th>
              <th>이메일</th>
              <th>연락처</th>
              <th>학년</th>
              <th>가입일</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  불러오는 중...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  {debouncedSearch || gradeFilter || statusFilter ? '검색 결과가 없습니다.' : '회원이 없습니다.'}
                </td>
              </tr>
            ) : (
              members.map((m, i) => (
                <tr key={m.id}>
                  <td>{page * size + i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{m.userId}</td>
                  <td>{m.userName}</td>
                  <td>{m.email}</td>
                  <td>{m.phoneNumber}</td>
                  <td>
                    {m.grade
                      ? <span className="badge badge-blue">{m.grade}</span>
                      : <span style={{ color: '#94a3b8' }}>—</span>}
                  </td>
                  <td>{m.createdAt}</td>
                  <td>
                    <span className={`badge ${m.enabled ? 'badge-green' : 'badge-red'}`}>
                      {m.enabled ? '정상' : '정지'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openEdit(m)}>수정</button>
                      <button className="admin-btn admin-btn-danger  admin-btn-sm" onClick={() => openDelete(m)}>삭제</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 4px 0', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            {totalElements > 0
              ? `${startRow}–${endRow} / 총 ${totalElements.toLocaleString()}명`
              : ''}
          </span>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* 수정 모달 */}
      {modal.type === 'edit' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">회원 수정 — {modal.item?.userId}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-row">
                  <label className="form-label">이름</label>
                  <input
                    className="form-input"
                    value={form.userName}
                    onChange={(e) => setForm({ ...form, userName: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">이메일</label>
                  <input
                    className="form-input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">연락처</label>
                  <input
                    className="form-input"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">학년</label>
                  <select
                    className="form-select"
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  >
                    <option value="">미지정</option>
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <label className="form-label">상태</label>
                  <select
                    className="form-select"
                    value={form.enabled ? '정상' : '정지'}
                    onChange={(e) => setForm({ ...form, enabled: e.target.value === '정상' })}
                  >
                    <option>정상</option>
                    <option>정지</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn admin-btn-outline" onClick={closeModal}>취소</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={modal.type === 'delete'}
        title="회원 삭제"
        message={
          <>
            <strong>{modal.item?.userName}</strong> ({modal.item?.userId}) 회원을<br />
            정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </>
        }
        confirmLabel="삭제"
        onConfirm={handleDelete}
        onClose={closeModal}
      />
    </div>
  );
};

export default MembersPage;
