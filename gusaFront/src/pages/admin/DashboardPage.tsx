const months = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
];

const series = [
  {
    name: '초등',
    color: '#3b82f6',
    data: [210, 245, 310, 380, 290, 260, 230, 320, 410, 360, 280, 240],
  },
  {
    name: '중등',
    color: '#8b5cf6',
    data: [150, 180, 230, 280, 220, 200, 180, 250, 310, 270, 210, 180],
  },
  {
    name: '고등',
    color: '#ef4444',
    data: [120, 140, 190, 240, 180, 160, 140, 200, 270, 230, 170, 150],
  },
];

const stats = [
  {
    label: '오늘 방문자',
    value: '1,284',
    change: '+12.3%',
    up: true,
    icon: '',
  },
  { label: '오늘 로그인', value: '342', change: '+8.1%', up: true, icon: '' },
  { label: '오늘 주문', value: '87', change: '-3.2%', up: false, icon: '' },
  {
    label: '이번달 매출',
    value: '42,000원',
    change: '+18.5%',
    up: true,
    icon: '',
  },
];

/* ── 순수 SVG 꺾은선 차트 ── */
const LineChart = () => {
  const W = 540;
  const H = 260;
  const PAD = { top: 20, right: 20, bottom: 36, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const allValues = series.flatMap((s) => s.data);
  const maxVal = Math.max(...allValues);

  const xStep = innerW / (months.length - 1);
  const yScale = (v: number) => innerH - (v / maxVal) * innerH;

  const points = (data: number[]) =>
    data
      .map((v, i) => `${PAD.left + i * xStep},${PAD.top + yScale(v)}`)
      .join(' ');

  const yTicks = [0, 100, 200, 300, 400].filter((v) => v <= maxVal + 50);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {/* y 격자 */}
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

      {/* x 레이블 */}
      {months.map((m, i) => (
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

      {/* 시리즈 */}
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
  return (
    <div>
      {/* 통계 카드 */}
      <div className="dash-stats">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div className="stat-card-label">{s.label}</div>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
            </div>
            <div className="stat-card-value">{s.value}</div>
            <div className={`stat-card-change ${s.up ? 'up' : 'down'}`}>
              {s.up ? '▲' : '▼'} {s.change} 전일 대비
            </div>
          </div>
        ))}
      </div>

      {/* 차트 + 금일 로그인 */}
      <div className="dash-charts">
        {/* SVG 꺾은선 차트 */}
        <div className="chart-card">
          <p className="chart-card-title">학년별 교재 구매 현황</p>
          {/* 범례 */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
            {series.map((s) => (
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
          <LineChart />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
