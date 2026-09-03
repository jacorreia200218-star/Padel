import { STATUS_DOT, STATUS_LABEL, type Status } from '../engine/checkin';

interface StatusBannerProps {
  status: Status;
  reasons: string[];
}

/**
 * O estado do dia, em destaque no topo. É a primeira coisa a ler — o plano
 * que vem a seguir é a consequência dele, não o contrário.
 */
export function StatusBanner({ status, reasons }: StatusBannerProps) {
  return (
    <div className={`status-banner status-${status}`}>
      <div className="status-head">
        <span className="status-dot">{STATUS_DOT[status]}</span>
        <span className="status-label">{STATUS_LABEL[status]}</span>
      </div>
      {reasons.map((r, i) => (
        <div key={i} className="status-reason">
          {r}
        </div>
      ))}
    </div>
  );
}
