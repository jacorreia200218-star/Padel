import { sorenessScore, type Checkin } from '../engine/checkin';

/** Saudação conforme a hora, com o nome se ele lá estiver. */
export function Greeting({ name }: { name: string }) {
  const hora = new Date().getHours();
  const saudacao = hora < 13 ? 'Bom dia' : hora < 20 ? 'Boa tarde' : 'Boa noite';
  const primeiro = name.trim().split(' ')[0];

  return (
    <div className="greeting">
      <div className="greeting-hello">
        {saudacao}
        {primeiro ? `, ${primeiro}` : ''} 👋
      </div>
    </div>
  );
}

/**
 * Os números do check-in de hoje, num relance.
 *
 * Serve para conferir o que foi respondido sem ter de reabrir o formulário —
 * quando o plano surpreende, a primeira pergunta é sempre "o que é que eu disse
 * hoje de manhã?".
 */
export function DailySnapshot({ checkin }: { checkin: Checkin }) {
  const dor = sorenessScore(checkin);
  const lesao = checkin.injuries.reduce((max, i) => Math.max(max, i.intensity), 0);

  return (
    <div className="snapshot">
      <Item emoji="😴" label="Sono" value={`${checkin.sleepHours}h`} sub={`${checkin.sleepQuality}/5`} />
      <Item emoji="🔋" label="Energia" value={`${checkin.energy}/5`} />
      <Item emoji="😓" label="Cansaço" value={`${checkin.fatigue}/5`} />
      <Item
        emoji={lesao > 0 ? '🩹' : '💪'}
        label={lesao > 0 ? 'Dor' : 'Dor muscular'}
        value={`${lesao > 0 ? lesao : dor}/10`}
        alert={lesao > 0}
      />
    </div>
  );
}

function Item({
  emoji,
  label,
  value,
  sub,
  alert = false,
}: {
  emoji: string;
  label: string;
  value: string;
  sub?: string;
  alert?: boolean;
}) {
  return (
    <div className="snapshot-item">
      <div className="snapshot-emoji">{emoji}</div>
      <div className={`snapshot-value ${alert ? 'alerta' : ''}`}>{value}</div>
      <div className="snapshot-label">
        {label}
        {sub && <span className="snapshot-sub"> · {sub}</span>}
      </div>
    </div>
  );
}
