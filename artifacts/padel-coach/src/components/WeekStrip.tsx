import { STATUS_DOT } from '../engine/checkin';
import { dateKey, type Log } from '../store/useStore';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Os últimos sete dias, com o que foi feito em cada um.
 *
 * O pedido original trazia uma semana-modelo (segunda força, terça padel...).
 * Isso não serve: o que interessa não é o plano que se fez na cabeça, é o que
 * aconteceu de facto — e é sobre isso que o motor decide o dia seguinte.
 */
export function WeekStrip({ logs }: { logs: Record<string, Log> }) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoje);
    d.setDate(d.getDate() - (6 - i));
    return { data: d, log: logs[dateKey(d)] };
  });

  return (
    <>
      <div className="week-strip">
      {dias.map(({ data, log }, i) => {
        const ehHoje = i === 6;
        return (
          <div key={data.toISOString()} className={`week-day ${ehHoje ? 'hoje' : ''}`}>
            <div className="week-dow">{DIAS[data.getDay()]}</div>
            <div className="week-mark">
              {log ? STATUS_DOT[log.status] : <span className="week-empty">·</span>}
            </div>
            <div className="week-what">
              {log ? (log.didPlayPadel ? '🎾' : '💪') : ''}
            </div>
          </div>
        );
      })}
      </div>
      <div className="week-legend">
        A cor é o estado do dia · 🎾 jogo · 💪 treino
      </div>
    </>
  );
}
