import { useEffect, useState } from 'react';

interface RestTimerProps {
  seconds: number;
  onDone: () => void;
}

/**
 * Contagem decrescente do descanso entre séries.
 *
 * Conta a partir do relógio e não somando segundos, porque o telemóvel suspende
 * os temporizadores com o ecrã bloqueado — somar ticks daria um descanso muito
 * mais longo do que o real.
 */
export function RestTimer({ seconds, onDone }: RestTimerProps) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    const end = Date.now() + seconds * 1000;
    const tick = () => {
      const remaining = Math.ceil((end - Date.now()) / 1000);
      setLeft(Math.max(0, remaining));
      if (remaining <= 0) onDone();
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
    // Só reinicia se mudar a duração — onDone muda a cada render do pai.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  const pct = seconds > 0 ? 1 - left / seconds : 1;

  return (
    <div className="rest-timer">
      <div className="rest-label">Descanso</div>
      <div className="rest-count">{left}s</div>
      <div className="rest-track">
        <div className="rest-fill" style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  );
}
