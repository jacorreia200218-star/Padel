import type { Status } from '../engine/checkin';

const STATUS_COLOR: Record<Status, string> = {
  green: 'var(--accent)',
  yellow: 'var(--amber)',
  red: 'var(--coral)',
};

/** Anel de prontidão: 0 a 1 do círculo preenchido, na cor do estado do dia. */
export function ReadinessRing({ pct, status = 'green' }: { pct: number; status?: Status }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <svg width="84" height="84" viewBox="0 0 84 84" style={{ flexShrink: 0 }}>
      <circle cx="42" cy="42" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="7" fill="none" />
      <circle
        cx="42"
        cy="42"
        r={r}
        stroke={STATUS_COLOR[status]}
        strokeWidth="7"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - clamped)}
        strokeLinecap="round"
        transform="rotate(-90 42 42)"
      />
    </svg>
  );
}
