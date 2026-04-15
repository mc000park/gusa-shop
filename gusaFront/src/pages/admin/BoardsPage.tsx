import { useState } from 'react';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Pagination from '../../components/admin/Pagination';
import { useModal } from '../../hooks/useModal';

interface Post {
  id: number;
  category: string;
  title: string;
  author: string;
  views: number;
  createdAt: string;
  status: '게시중' | '숨김';
}

const mockPosts: Post[] = [
  { id: 10, category: '공지',  title: '2026년 신학기 교재 입고 안내',      author: '관리자',   views: 1520, createdAt: '2026-03-01', status: '게시중' },
  { id: 9,  category: '공지',  title: '개인정보처리방침 개정 안내',          author: '관리자',   views:  980, createdAt: '2026-02-20', status: '게시중' },
  { id: 8, category: '이벤트', title: '3권 이상 구매 시 10% 할인 이벤트',           author: '관리자',    views: 2340, createdAt: '2026-02-15', status: '게시중' },
  { id: 7, category: 'FAQ',   title: '교재 교환·반품 방법을 알고 싶어요',           author: 'user1234', views:  430, createdAt: '2026-02-10', status: '게시중' },
  { id: 6, category: '후기',  title: '기초 수학 완성 - 정말 쉽고 잘 정리됐어요!',  author: 'bookworm', views:  280, createdAt: '2026-02-05', status: '게시중' },
  { id: 5, category: '문의',  title: '배송이 아직 안 왔어요',                      author: 'kim_study', views:  90, createdAt: '2026-01-28', status: '숨김'   },
];

const categoryClass: Record<string, string> = {
  공지: 'badge-blue', 이벤트: 'badge-yellow', FAQ: 'badge-green', 후기: 'badge-gray', 문의: 'badge-red',
};

interface EditForm { title: string; category: string; status: '게시중' | '숨김'; content: string; }

const SIZE = 5;

const BoardsPage = () => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [page, setPage] = useState(0);
  const { modal, open: openModal, close: closeModal } = useModal<'edit' | 'delete', Post>();
  const [form, setForm] = useState<EditForm>({ title: '', category: '공지', status: '게시중', content: '' });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = posts.filter((p) => {
    const matchSearch = p.title.includes(search) || p.author.includes(search);
    const matchCategory = categoryFilter ? p.category === categoryFilter : true;
    const matchStatus = statusFilter ? p.status === statusFilter : true;
    return matchSearch && matchCategory && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / SIZE));
  const paginated = filtered.slice(page * SIZE, page * SIZE + SIZE);

  const openEdit = (p: Post) => {
    setForm({ title: p.title, category: p.category, status: p.status, content: '' });
    openModal('edit', p);
  };
  const openDelete = (p: Post) => openModal('delete', p);

  const handleSave = () => {
    if (modal.item) {
      const id = modal.item.id;
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, title: form.title, category: form.category, status: form.status } : p));
    }
    closeModal();
  };

  const handleDelete = () => {
    if (modal.item) {
      const id = modal.item.id;
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
    closeModal();
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">게시판 관리</h1>
          <p className="admin-page-sub">총 {filtered.length}개의 게시글</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <input
            placeholder="제목, 작성자 검색"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
          <button>🔍</button>
        </div>
        <select
          className="admin-filter-select"
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
        >
          <option value="">전체 카테고리</option>
          <option>공지</option><option>이벤트</option>
          <option>FAQ</option><option>후기</option><option>문의</option>
        </select>
        <select
          className="admin-filter-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
        >
          <option value="">전체 상태</option>
          <option>게시중</option><option>숨김</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>번호</th><th>카테고리</th><th>제목</th>
              <th>작성자</th><th>조회수</th><th>작성일</th>
              <th>상태</th><th>관리</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td><span className={`badge ${categoryClass[p.category] ?? 'badge-gray'}`}>{p.category}</span></td>
                <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                  {p.title}
                </td>
                <td>{p.author}</td>
                <td>{p.views.toLocaleString()}</td>
                <td>{p.createdAt}</td>
                <td>
                  <span className={`badge ${p.status === '게시중' ? 'badge-green' : 'badge-gray'}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openEdit(p)}>수정</button>
                    <button className="admin-btn admin-btn-danger  admin-btn-sm" onClick={() => openDelete(p)}>삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* 수정 모달 */}
      {modal.type === 'edit' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">게시글 수정</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-row">
                  <label className="form-label">카테고리</label>
                  <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option>공지</option><option>이벤트</option>
                    <option>FAQ</option><option>후기</option><option>문의</option>
                  </select>
                </div>
                <div className="form-row">
                  <label className="form-label">상태</label>
                  <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Post['status'] })}>
                    <option>게시중</option><option>숨김</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <label className="form-label">제목</label>
                <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-row">
                <label className="form-label">내용</label>
                <textarea className="form-textarea" placeholder="내용을 입력하세요" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn admin-btn-outline" onClick={closeModal}>취소</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave}>저장</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={modal.type === 'delete'}
        title="게시글 삭제"
        message={<><strong>{modal.item?.title}</strong><br />게시글을 삭제하시겠습니까?</>}
        confirmLabel="삭제"
        onConfirm={handleDelete}
        onClose={closeModal}
      />
    </div>
  );
};

export default BoardsPage;
