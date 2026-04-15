import { useEffect, useRef, useState } from 'react';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Pagination from '../../components/admin/Pagination';
import {
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '../../api/products';
import type { Product, ProductRequest } from '../../types/product';
import { useModal } from '../../hooks/useModal';

const SUBJECTS = ['국어', '수학', '영어', '과학', '사회', '역사', '탐구'];
const GRADES = ['초등 1~2학년', '초등 3~4학년', '초등 5~6학년', '중등 1학년', '중등 2학년', '중등 3학년', '고등 1학년', '고등 2학년', '고등 3학년', '고등 전학년'];

const emptyForm: ProductRequest = {
  title: '',
  subject: '수학',
  grade: '초등 3~4학년',
  price: 0,
  originalPrice: 0,
  author: '',
  publisher: '',
  publishedDate: '',
  pages: 0,
  isbn: '',
  description: '',
  tableOfContents: [],
  badge: '',
  isNew: false,
};

type ModalType = 'edit' | 'delete' | 'register';

const SIZE = 10;

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { modal, open: openModal, close: closeModal } = useModal<ModalType, Product>();
  const [form, setForm] = useState<ProductRequest>(emptyForm);
  const [tocText, setTocText] = useState('');
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    load(page, search, filterSubject, filterGrade);
  }, [page, filterSubject, filterGrade]);

  const load = async (p: number, kw: string, subject: string, grade: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await searchProducts({
        page: p,
        size: SIZE,
        keyword: kw || undefined,
        subject: subject || undefined,
        grade: grade || undefined,
      });
      setProducts(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages || 1);
    } catch {
      setError('상품 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      load(0, value, filterSubject, filterGrade);
    }, 400);
  };

  const handleFilterChange = (subject: string, grade: string) => {
    setPage(0);
    load(0, search, subject, grade);
  };

  const filtered = products; // 이미 서버에서 필터됨

  const openRegister = () => {
    setForm(emptyForm);
    setTocText('');
    setImageFile(null);
    setImagePreview(null);
    openModal('register');
  };

  const openEdit = (p: Product) => {
    setForm({
      title: p.title,
      subject: p.subject,
      grade: p.grade,
      price: p.price,
      originalPrice: p.originalPrice,
      author: p.author,
      publisher: p.publisher,
      publishedDate: p.publishedDate ?? '',
      pages: p.pages,
      isbn: p.isbn ?? '',
      description: p.description ?? '',
      tableOfContents: p.tableOfContents ?? [],
      badge: p.badge ?? '',
      isNew: p.isNew,
    });
    setTocText((p.tableOfContents ?? []).join('\n'));
    setImageFile(null);
    setImagePreview(p.imageUrl ?? null);
    openModal('edit', p);
  };

  const openDelete = (p: Product) => openModal('delete', p);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const payload: ProductRequest = {
      ...form,
      tableOfContents: tocText.split('\n').map((s) => s.trim()).filter(Boolean),
    };

    try {
      setSaving(true);
      let saved: Product;
      if (modal.type === 'edit' && modal.item) {
        saved = await updateProduct(modal.item.id, payload);
      } else {
        saved = await createProduct(payload);
      }
      // 이미지 파일이 선택된 경우 업로드
      if (imageFile) {
        saved = await uploadProductImage(saved.id, imageFile);
      }
      const isEdit = modal.type === 'edit';
      closeModal();
      load(isEdit ? page : 0, search, filterSubject, filterGrade);
      if (!isEdit) setPage(0);
    } catch {
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!modal.item) return;
    try {
      setSaving(true);
      await deleteProduct(modal.item.id);
      closeModal();
      load(page, search, filterSubject, filterGrade);
    } catch {
      setError('삭제 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const discountRate = (p: Product) =>
    p.originalPrice > 0
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : 0;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">상품 관리</h1>
          <p className="admin-page-sub">총 {totalElements}개의 상품</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openRegister}>
          + 상품 등록
        </button>
      </div>

      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 16,
            color: '#dc2626',
            fontSize: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {error}
          <button
            onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 16 }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="admin-toolbar">
        <div className="admin-search">
          <input
            placeholder="상품명, 저자, 출판사 검색"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <button>🔍</button>
        </div>
        <select
          className="admin-filter-select"
          value={filterGrade}
          onChange={(e) => { setFilterGrade(e.target.value); handleFilterChange(filterSubject, e.target.value); }}
        >
          <option value="">전체 학년</option>
          {GRADES.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select
          className="admin-filter-select"
          value={filterSubject}
          onChange={(e) => { setFilterSubject(e.target.value); handleFilterChange(e.target.value, filterGrade); }}
        >
          <option value="">전체 과목</option>
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: 14 }}>
            불러오는 중...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: 14 }}>
            등록된 상품이 없습니다.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>상품명</th>
                <th>학년</th>
                <th>과목</th>
                <th>판매가</th>
                <th>할인율</th>
                <th>저자</th>
                <th>출판사</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>
                    {p.title}
                    {p.isNew && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 11,
                          background: '#10b981',
                          color: '#fff',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontWeight: 700,
                        }}
                      >
                        NEW
                      </span>
                    )}
                    {p.badge && (
                      <span
                        style={{
                          marginLeft: 4,
                          fontSize: 11,
                          background: '#1a56db',
                          color: '#fff',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontWeight: 700,
                        }}
                      >
                        {p.badge}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-blue">{p.grade}</span>
                  </td>
                  <td>{p.subject}</td>
                  <td>{p.price.toLocaleString()}원</td>
                  <td style={{ color: '#ef4444', fontWeight: 600 }}>
                    {discountRate(p)}%
                  </td>
                  <td>{p.author}</td>
                  <td>{p.publisher}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="admin-btn admin-btn-outline admin-btn-sm"
                        onClick={() => openEdit(p)}
                      >
                        수정
                      </button>
                      <button
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => openDelete(p)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* 등록/수정 모달 */}
      {(modal.type === 'edit' || modal.type === 'register') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal"
            style={{ maxWidth: 640, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                {modal.type === 'register' ? '상품 등록' : '상품 수정'}
              </h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {/* 이미지 업로드 */}
              <div className="form-row">
                <label className="form-label">상품 이미지</label>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  {/* 미리보기 */}
                  <div
                    style={{
                      width: 100, height: 120, flexShrink: 0,
                      border: '1.5px dashed #cbd5e1', borderRadius: 8,
                      background: '#f8fafc', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', cursor: 'pointer',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview.startsWith('blob:') ? imagePreview : `http://localhost:8080${imagePreview}`}
                        alt="미리보기"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: 28, color: '#cbd5e1' }}>📷</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageChange}
                    />
                    <button
                      type="button"
                      className="admin-btn admin-btn-outline"
                      style={{ marginBottom: 8 }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      이미지 선택
                    </button>
                    {imageFile && (
                      <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                        {imageFile.name}
                      </p>
                    )}
                    {!imageFile && !imagePreview && (
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                        JPG, PNG, WEBP (최대 10MB)
                      </p>
                    )}
                    {imagePreview && (
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer', padding: 0, marginTop: 4 }}
                        onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      >
                        이미지 제거
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 기본 정보 */}
              <div className="form-row">
                <label className="form-label">상품명 *</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="상품명을 입력하세요"
                />
              </div>

              <div className="form-grid-2">
                <div className="form-row">
                  <label className="form-label">과목 *</label>
                  <select
                    className="form-select"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  >
                    {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <label className="form-label">학년 *</label>
                  <select
                    className="form-select"
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  >
                    {GRADES.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <label className="form-label">판매가 (원) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">정가 (원) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">저자 *</label>
                  <input
                    className="form-input"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="저자명"
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">출판사 *</label>
                  <input
                    className="form-input"
                    value={form.publisher}
                    onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                    placeholder="출판사명"
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">출판일</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.publishedDate}
                    onChange={(e) => setForm({ ...form, publishedDate: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">페이지 수</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.pages}
                    onChange={(e) => setForm({ ...form, pages: Number(e.target.value) })}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">ISBN</label>
                  <input
                    className="form-input"
                    value={form.isbn}
                    onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                    placeholder="978-89-000-0000-0"
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">배지</label>
                  <input
                    className="form-input"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="예) BEST 1"
                  />
                </div>
              </div>

              <div className="form-row">
                <label className="form-label">책 소개</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: 80, resize: 'vertical' }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="책 소개를 입력하세요"
                />
              </div>

              <div className="form-row">
                <label className="form-label">목차 (줄바꿈으로 구분)</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: 100, resize: 'vertical' }}
                  value={tocText}
                  onChange={(e) => setTocText(e.target.value)}
                  placeholder={'1장. 예시 목차\n2장. 예시 목차'}
                />
              </div>

              <div className="form-row">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.isNew}
                    onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
                    style={{ width: 16, height: 16 }}
                  />
                  <span className="form-label" style={{ margin: 0 }}>신규 상품 표시 (NEW 뱃지)</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn admin-btn-outline" onClick={closeModal}>
                취소
              </button>
              <button
                className="admin-btn admin-btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={modal.type === 'delete'}
        title="상품 삭제"
        message={
          <>
            <strong>{modal.item?.title}</strong> 상품을
            <br />
            정말 삭제하시겠습니까?
          </>
        }
        confirmLabel="삭제"
        onConfirm={handleDelete}
        onClose={closeModal}
      />
    </div>
  );
};

export default ProductsPage;
