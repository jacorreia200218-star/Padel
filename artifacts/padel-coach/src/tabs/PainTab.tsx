import { useState } from 'react';

import { ExerciseCard } from '../components/ExerciseCard';
import { ExerciseModal } from '../components/ExerciseModal';
import { PAIN_TIPS, PAIN_ZONES, exerciseById, type Exercise } from '../data/exercises';
import { RED_FLAG_SIGNS, programForZone } from '../data/zones';

export function PainTab() {
  const [zone, setZone] = useState<string | null>(null);
  const [open, setOpen] = useState<Exercise | null>(null);

  const program = zone ? programForZone(zone) : undefined;
  const zoneLabel = PAIN_ZONES.find((z) => z.id === zone)?.label;

  return (
    <>
      <div className="section-title" style={{ marginTop: 0 }}>
        Onde te dói?
      </div>
      <p className="body-text">
        Escolhe uma zona para ver exercícios geralmente usados para mobilidade, fortalecimento e
        prevenção nessa área.
      </p>
      <div className="chip-row" style={{ marginBottom: 20 }}>
        {PAIN_ZONES.filter((z) => programForZone(z.id)).map((z) => (
          <span
            key={z.id}
            className={`chip ${zone === z.id ? 'selected' : ''}`}
            onClick={() => setZone(zone === z.id ? null : z.id)}
          >
            {z.label}
          </span>
        ))}
      </div>

      <RedFlags />

      {!program && (
        <div className="empty">
          <span className="big-emoji">🩹</span>
          Escolhe uma zona acima.
        </div>
      )}

      {program && zone && (
        <>
          <div className="section-title">{zoneLabel}</div>
          <div className="card">
            <p className="body-text" style={{ margin: 0 }}>
              {program.intro}
            </p>
          </div>

          {program.groups.map((group) => {
            const exercises = group.exerciseIds
              .map(exerciseById)
              .filter((e): e is Exercise => Boolean(e));
            if (!exercises.length) return null;
            return (
              <div key={group.title}>
                <div className="section-title">{group.title}</div>
                <p className="body-text" style={{ marginTop: -4 }}>
                  {group.note}
                </p>
                {exercises.map((e) => (
                  <ExerciseCard key={e.id} exercise={e} onClick={() => setOpen(e)} />
                ))}
              </div>
            );
          })}

          {PAIN_TIPS[zone] && (
            <>
              <div className="section-title">Autocuidado</div>
              <div className="card">
                {PAIN_TIPS[zone].map((tip, i) => (
                  <div
                    key={i}
                    style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: 8 }}
                  >
                    ❄ {tip}
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="disclaimer">
            Esta página não faz diagnósticos nem substitui avaliação médica ou de fisioterapia.
            Nenhum destes exercícios cura seja o que for — servem para manter a zona a mexer e a
            ganhar força, quando isso é seguro. Se algum provocar dor, para.
          </p>
        </>
      )}

      {open && <ExerciseModal exercise={open} onClose={() => setOpen(null)} onOpen={setOpen} />}
    </>
  );
}

/**
 * Sempre visível, escolhida ou não uma zona. É a informação mais importante
 * desta página e não deve depender de a pessoa navegar até ela.
 */
function RedFlags() {
  return (
    <div className="card alert">
      <b style={{ color: 'var(--coral)', fontSize: '0.88rem' }}>Quando não é caso para exercícios</b>
      <p className="body-text" style={{ marginTop: 8 }}>
        Se tiveres algum destes sinais, procura avaliação médica ou de fisioterapia antes de
        continuar a treinar:
      </p>
      <ul className="bullets">
        {RED_FLAG_SIGNS.map((sign) => (
          <li key={sign}>{sign}</li>
        ))}
      </ul>
    </div>
  );
}
