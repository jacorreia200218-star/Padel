import { BarChart, LineChart } from '../components/Charts';
import { dateKey, parseDateKey, useStore, type Log } from '../store/useStore';

export function StatsTab() {
  const data = useStore();
  const logs = Object.values(data.logs).sort((a, b) => a.date.localeCompare(b.date));
  const last30 = logs.slice(-30);

  const totalHours = last30.reduce((s, l) => s + l.padelHours, 0);
  const trainDays = last30.filter((l) => l.didTrain).length;
  const restDays = last30.filter((l) => !l.didTrain && !l.didPlayPadel).length;

  return (
    <>
      <div className="stat-grid" style={{ marginBottom: 18 }}>
        <Tile value={`${totalHours.toFixed(1)}h`} label="Horas de padel (30d)" />
        <Tile value={trainDays} label="Dias de treino (30d)" />
        <Tile value={restDays} label="Dias de descanso (30d)" />
        <Tile value={computeStreak(logs)} label="Sequência atual" />
      </div>

      <div className="card">
        <div className="section-title" style={{ marginTop: 0 }}>
          Energia ao longo do tempo
        </div>
        <LineChart values={last30.map((l) => l.energy)} min={0} max={5} />
      </div>

      <div className="card">
        <div className="section-title" style={{ marginTop: 0 }}>
          Dor ao longo do tempo
        </div>
        <BarChart values={last30.map((l) => l.pain)} max={7} color="var(--coral)" />
      </div>

      <div className="card">
        <div className="section-title" style={{ marginTop: 0 }}>
          Horas de padel por semana
        </div>
        <BarChart values={weeklyBuckets(last30, 'padelHours')} color="var(--sky)" />
      </div>
    </>
  );
}

function Tile({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="stat-tile">
      <div className="val">{value}</div>
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

function weeklyBuckets(logs: Log[], field: 'padelHours'): number[] {
  const buckets: Record<string, number> = {};
  logs.forEach((l) => {
    const d = parseDateKey(l.date);
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
    const key = `${d.getFullYear()}-W${week}`;
    buckets[key] = (buckets[key] ?? 0) + (l[field] ?? 0);
  });
  return Object.keys(buckets)
    .sort()
    .map((k) => buckets[k]);
}
