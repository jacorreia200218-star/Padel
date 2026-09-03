import { useState } from 'react';

import { dateKey, todayKey, useStore } from '../store/useStore';
import { StatsTab } from './StatsTab';

export function HistoryTab() {
  const data = useStore();
  const [month, setMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const y = month.getFullYear();
  const m = month.getMonth();
  const startPad = (new Date(y, m, 1).getDay() + 6) % 7; // semana começa à segunda
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const monthLabel = month.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });

  const shiftMonth = (delta: number) =>
    setMonth((cur) => {
      const next = new Date(cur);
      next.setMonth(next.getMonth() + delta);
      return next;
    });

  const markColor = (key: string) => {
    const log = data.logs[key];
    if (!log) return 'transparent';
    if (log.pain > 0) return 'var(--coral)';
    if (log.didPlayPadel) return 'var(--sky)';
    if (log.didTrain) return 'var(--accent)';
    return 'var(--amber)';
  };

  return (
    <>
      <div className="card">
        <div className="row" style={{ marginBottom: 14 }}>
        <button
          className="btn btn-ghost"
          style={{ width: 'auto', padding: '8px 14px' }}
          onClick={() => shiftMonth(-1)}
        >
          ‹
        </button>
        <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{monthLabel}</div>
        <button
          className="btn btn-ghost"
          style={{ width: 'auto', padding: '8px 14px' }}
          onClick={() => shiftMonth(1)}
        >
          ›
        </button>
      </div>

      <div className="cal-grid">
        {Array.from({ length: startPad }, (_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const key = dateKey(new Date(y, m, d));
          return (
            <div key={key} className={`cal-day ${key === todayKey() ? 'today' : ''}`}>
              <span>{d}</span>
              <span className="mark" style={{ background: markColor(key) }} />
            </div>
          );
        })}
      </div>

      <div className="cal-legend">
        <span>
          <span className="legend-dot" style={{ background: 'var(--sky)' }} />
          Jogo
        </span>
        <span>
          <span className="legend-dot" style={{ background: 'var(--accent)' }} />
          Treino
        </span>
        <span>
          <span className="legend-dot" style={{ background: 'var(--amber)' }} />
          Descanso
        </span>
        <span>
          <span className="legend-dot" style={{ background: 'var(--coral)' }} />
          Dor
        </span>
        </div>
      </div>

      <StatsTab />
    </>
  );
}
