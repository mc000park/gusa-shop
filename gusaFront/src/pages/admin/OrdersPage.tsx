import { useEffect, useState } from 'react';
import Pagination from '../../components/admin/Pagination';
import { getAdminOrders, updateOrderStatus } from '../../api/orders';
import type { Order } from '../../types/order';
import { useDebounce } from '../../hooks/useDebounce';

const STATUS_LABEL: Record<string, string> = {
  PENDING:   '결제대기',
  PAID:      '결제완료',
  SHIPPING:  '배송중',
  DELIVERED: '배송완료',
  CANCELED:  '취소',
};
const STATUS_BADGE: Record<string, string> = {
  PENDING:   'badge-gray',
  PAID:      'badge-blue',
  SHIPPING:  'badge-yellow',
  DELIVERED: 'badge-green',
  CANCELED:  'badge-red',
};
const STATUS_OPTIONS = ['PAID', 'SHIPPING', 'DELIVERED', 'CANCELED'];
const SIZE_OPTIONS = [10, 20, 50];

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const debouncedSearch = useDebounce(search);

  // 검색어 변경 시 페이지 초기화
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  // 페이지 · 검색 · 필터 · 사이즈 변경 시 단일 fetch
  useEffect(() => {
    setLoading(true);
    setError('');
    getAdminOrders({
      page,
      size,
      keyword: debouncedSearch || undefined,
      status: statusFilter || undefined,
    })
      .then((res) => {
        setOrders(res.content);
        setTotalElements(res.totalElements);
        setTotalPages(res.totalPages || 1);
      })
      .catch(() => setError('주문 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [page, size, debouncedSearch, statusFilter]);

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(0);
  };

  const handleSize = (value: number) => {
    setSize(value);
    setPage(0);
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.orderId === updated.orderId ? updated : o)));
    } catch {}
  };

  const startRow = totalElements === 0 ? 0 : page * size + 1;
  const endRow   = Math.min((page + 1) * size, totalElements);

  return (
    <div>
      {/* 헤더 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">주문 내역</h1>
          <p className="admin-page-sub">총 {totalElements.toLocaleString()}건의 주문</p>
        </div>
      </div>

      {/* 툴바 */}
      <div className="admin-toolbar">
        <div className="admin-search">
          <input
            placeholder="주문번호, 회원 ID, 수령인 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16 }}>✕</button>
          )}
          {!search && <button>🔍</button>}
        </div>

        <select
          className="admin-filter-select"
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
        >
          <option value="">전체 상태</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          className="admin-filter-select"
          value={size}
          onChange={(e) => handleSize(Number(e.target.value))}
        >
          {SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>페이지당 {s}건</option>
          ))}
        </select>
      </div>

      {/* 에러 */}
      {error && (
        <div style={{ margin: '0 0 16px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* 테이블 */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>주문번호</th>
              <th>회원 ID</th>
              <th>수령인</th>
              <th>상품 수</th>
              <th>결제금액</th>
              <th>주문일</th>
              <th>상태</th>
              <th>상태 변경</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  불러오는 중...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  {debouncedSearch || statusFilter ? '검색 결과가 없습니다.' : '주문 내역이 없습니다.'}
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.orderId}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{o.orderId}</td>
                  <td style={{ fontWeight: 600 }}>{o.userId}</td>
                  <td>{o.recipientName}</td>
                  <td>{o.items.length}개</td>
                  <td style={{ fontWeight: 600 }}>{o.finalAmount.toLocaleString()}원</td>
                  <td>{o.createdAt?.slice(0, 10)}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[o.status] ?? 'badge-gray'}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </td>
                  <td>
                    {o.status !== 'CANCELED' && o.status !== 'DELIVERED' ? (
                      <select
                        className="admin-filter-select"
                        style={{ padding: '4px 8px', fontSize: 12 }}
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.orderId, e.target.value)}
                      >
                        {STATUS_OPTIONS.filter((s) => {
                          if (o.status === 'PENDING')  return ['PAID', 'CANCELED'].includes(s);
                          if (o.status === 'PAID')     return ['SHIPPING', 'CANCELED'].includes(s);
                          if (o.status === 'SHIPPING') return ['DELIVERED', 'CANCELED'].includes(s);
                          return false;
                        }).map((s) => (
                          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                        ))}
                        <option value={o.status} disabled>{STATUS_LABEL[o.status]}</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 페이지 정보 + 페이지네이션 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 4px 0', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            {totalElements > 0
              ? `${startRow}–${endRow} / 총 ${totalElements.toLocaleString()}건`
              : ''}
          </span>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
