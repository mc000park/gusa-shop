import { useEffect, useState } from 'react';
import { fetchDashboardStats } from '../../api/dashboard';
import type { DashboardStats } from '../../types/dashboard';

const MONTHS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

const GRADE_SERIES = [
  { name: '초등', color: '#3b82f6' },
  { name: '중등', color: '#8b5cf6' },
  { name: '고등', color: '#ef4444' },
];

function buildSeriesData(
  monthlyGradeSales: DashboardStats['monthlyGradeSales'],
): { name: string; color: string; data: number[] }[] {
  return GRADE_SERIES.map(({ name, color }) => {
    const data = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const found = monthlyGradeSales.find(
        (r) => r.month === month && r.gradeCategory === name,
      );
      return found ? found.quantity : 0;
    });
    return { name, color, data };
  });
}

/* ── 순수 SVG 꺾은선 차트 ── */
const LineChart = ({
  series,
}: {
  series: { name: string; color: string; data: number[] }[];
}) => {
  const W = 540;
  const H = 260;
  const PAD = { top: 20, right: 20, bottom: 36, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const allValues = series.flatMap((s) => s.data);
  const maxVal = Math.max(...allValues, 1);

  const xStep = innerW / (MONTHS.length - 1);
  const yScale = (v: number) => innerH - (v / maxVal) * innerH;

  const points = (data: number[]) =>
    data
      .map((v, i) => `${PAD.left + i * xStep},${PAD.top + yScale(v)}`)
      .join(' ');

  const tickMax = Math.ceil(maxVal / 100) * 100;
  const yTicks = [0, tickMax * 0.25, tickMax * 0.5, tickMax * 0.75, tickMax]
    .map(Math.round)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {yTicks.map((v) => {
        const y = PAD.top + yScale(v);
        return (
          <g key={v}>
            <line
              x1={PAD.left}
              y1={y}
              x2={PAD.left + innerW}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 6}
              y={y + 4}
              textAnchor="end"
              fontSize={10}
              fill="#94a3b8"
            >
              {v}
            </text>
          </g>
        );
      })}

      {MONTHS.map((m, i) => (
        <text
          key={m}
          x={PAD.left + i * xStep}
          y={H - 6}
          textAnchor="middle"
          fontSize={10}
          fill="#94a3b8"
        >
          {m}
        </text>
      ))}

      {series.map((s) => (
        <g key={s.name}>
          <polyline
            points={points(s.data)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {s.data.map((v, i) => (
            <circle
              key={i}
              cx={PAD.left + i * xStep}
              cy={PAD.top + yScale(v)}
              r={3.5}
              fill={s.color}
            />
          ))}
        </g>
      ))}
    </svg>
  );
};

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(() => setError('통계 데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        {
          label: '오늘 주문',
          value: stats.todayOrderCount.toLocaleString() + '건',
        },
        {
          label: '이번달 매출',
          value: stats.monthlyRevenue.toLocaleString() + '원',
        },
        {
          label: '총 회원 수',
          value: stats.totalUsers.toLocaleString() + '명',
        },
        {
          label: '총 상품 수',
          value: stats.totalProducts.toLocaleString() + '종',
        },
      ]
    : [];

  const series = stats ? buildSeriesData(stats.monthlyGradeSales) : [];

  if (loading) {
    return <div style={{ padding: 32, color: '#94a3b8' }}>불러오는 중...</div>;
  }

  if (error) {
    return <div style={{ padding: 32, color: '#ef4444' }}>{error}</div>;
  }

  return (
    <div>
      {/* 통계 카드 */}
      <div className="dash-stats">
        {statCards.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* 차트 */}
      <div className="dash-charts">
        <div className="chart-card">
          <p className="chart-card-title">학년별 교재 구매 현황 (올해)</p>
          <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
            {GRADE_SERIES.map((s) => (
              <div
                key={s.name}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: s.color,
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontSize: 12, color: '#64748b' }}>{s.name}</span>
              </div>
            ))}
          </div>
          <LineChart series={series} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
