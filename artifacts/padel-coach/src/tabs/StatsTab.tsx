import { BarChart, LineChart } from '../components/Charts';
import { dateKey, parseDateKey, useStore, type Log } from '../store/useStore';

export function StatsTab() {
  const data = useStore();
  const logs = Object.values(data.logs).sort((a, b) => a.date.localeCompare(b.date));
  const last30 = logs.slice(-30);

  if (!last30.length) {
    return (
      <div className="empty">
        <span className="big-emoji">📊</span>
        Ainda não há dias registados.
        <div style={{ fontSize: '0.82rem', marginTop: 8 }}>
          Conclui um treino e as estatísticas começam a aparecer aqui.
        </div>
      </div>
    );
  }

  const totalHours = last30.reduce((s, l) => s + l.padelHours, 0);
  const trainDays = last30.filter((l) => l.didTrain).length;
  const painDays = last30.filter((l) => l.pain > 0).length;
  const minutos = last30.reduce((s, l) => s + l.duration, 0);
  const media = (campo: 'energy' | 'sleep' | 'fatigue') =>
    (last30.reduce((s, l) => s + l[campo], 0) / last30.length).toFixed(1);

  return (
    <>
      <div className="section-title">Últimos 30 dias</div>
      <div className="stat-grid" style={{ marginBottom: 10 }}>
        <Tile value={`${totalHours.toFixed(1)}h`} label="Horas de padel" />
        <Tile value={trainDays} label="Dias de treino" />
        <Tile value={`${Math.round(minutos / 60)}h`} label="Tempo de treino" />
        <Tile value={computeStreak(logs)} label="Sequência atual" />
      </div>
      <div className="stat-grid" style={{ marginBottom: 18 }}>
        <Tile value={media('energy')} label="Energia média (1-5)" />
        <Tile value={media('sleep')} label="Sono médio (1-5)" />
        <Tile value={media('fatigue')} label="Cansaço médio (1-5)" />
        <Tile value={painDays} label="Dias com dor" alert={painDays > 0} />
      </div>

      <Chart title="Energia" scale="1 a 5">
        <LineChart values={last30.map((l) => l.energy)} min={0} max={5} />
      </Chart>

      <Chart title="Qualidade do sono" scale="1 a 5">
        <LineChart values={last30.map((l) => l.sleep)} min={0} max={5} />
      </Chart>

      <Chart title="Cansaço" scale="1 a 5">
        <LineChart values={last30.map((l) => l.fatigue)} min={0} max={5} />
      </Chart>

      <Chart title="Dor ao longo do tempo" scale="0 a 10">
        <BarChart values={last30.map((l) => l.painMax)} max={10} color="var(--coral)" />
      </Chart>

      <Chart title="Horas de padel por semana" scale="horas">
        <BarChart values={weeklySum(last30, 'padelHours')} color="var(--sky)" />
      </Chart>

      <Chart title="Minutos de treino por semana" scale="minutos">
        <BarChart values={weeklySum(last30, 'duration')} color="var(--accent)" />
      </Chart>
    </>
  );
}

function Chart({
  title,
  scale,
  children,
}: {
  title: string;
  /** A escala do eixo. Sem isto, uma linha a subir não diz nada. */
  scale?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="row" style={{ alignItems: 'baseline' }}>
        <div className="section-title" style={{ marginTop: 0 }}>
          {title}
        </div>
        {scale && <span className="chart-scale">{scale}</span>}
      </div>
      {children}
    </div>
  );
}

function Tile({
  value,
  label,
  alert = false,
}: {
  value: string | number;
  label: string;
  alert?: boolean;
}) {
  return (
    <div className="stat-tile">
      <div className="val" style={alert ? { color: 'var(--coral)' } : undefined}>
        {value}
      </div>
      <div className="lab">{label}</div>
    </div>
  );
}

/** Dias seguidos, a contar de hoje para trás, com treino ou jogo registado. */
function computeStreak(logs: Log[]): number {
  const set = new Set(logs.filter((l) => l.didTrain || l.didPlayPadel).map((l) => l.date));
  let streak = 0;
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);
  while (set.has(dateKey(cur))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

function weeklySum(logs: Log[], field: 'padelHours' | 'duration'): number[] {
  const buckets: Record<string, number> = {};
  logs.forEach((l) => {
    const d = parseDateKey(l.date);
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
    const key = `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
    buckets[key] = (buckets[key] ?? 0) + (l[field] ?? 0);
  });
  return Object.keys(buckets)
    .sort()
    .map((k) => buckets[k]);
}
