const W = 280;
const H = 110;

function Empty() {
  return (
    <div className="empty" style={{ padding: 24 }}>
      Ainda sem dados.
    </div>
  );
}

interface LineChartProps {
  values: number[];
  min?: number;
  max?: number;
}

export function LineChart({ values, min, max }: LineChartProps) {
  if (!values.length) return <Empty />;
  const pad = 6;
  const lo = min ?? Math.min(...values);
  const hi = max ?? Math.max(...values, 1);
  const points = values
    .map((v, i) => {
      const x = pad + i * ((W - 2 * pad) / Math.max(1, values.length - 1));
      const y = H - pad - ((v - lo) / (hi - lo || 1)) * (H - 2 * pad);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface BarChartProps {
  values: number[];
  max?: number;
  color: string;
}

export function BarChart({ values, max, color }: BarChartProps) {
  if (!values.length || values.every((v) => !v)) return <Empty />;
  const pad = 4;
  const hi = max ?? Math.max(...values, 1);
  const bw = (W - 2 * pad) / values.length;

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {values.map((v, i) => {
        const bh = (v / hi) * (H - 2 * pad);
        return (
          <rect
            key={i}
            x={pad + i * bw + bw * 0.15}
            y={H - pad - bh}
            width={bw * 0.7}
            height={Math.max(bh, 1)}
            rx="2"
            fill={color}
          />
        );
      })}
    </svg>
  );
}
