import {
  CATEGORY_LABEL,
  DIFF_LABEL,
  EQUIPMENT,
  exerciseById,
  type Exercise,
} from '../data/exercises';
import { Modal } from './Modal';

interface ExerciseModalProps {
  exercise: Exercise;
  onClose: () => void;
  /** Permite saltar de um exercício para uma alternativa dentro da mesma ficha. */
  onOpen?: (exercise: Exercise) => void;
}

export function ExerciseModal({ exercise: e, onClose, onOpen }: ExerciseModalProps) {
  // Uma pesquisa no YouTube em vez de um link fixo: nomes de exercícios mudam
  // de canal para canal e um URL fixo acaba por apontar para vídeo removido.
  const youtubeSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    e.name + ' exercício padel',
  )}`;

  const alternatives = (e.alts ?? [])
    .map(exerciseById)
    .filter((x): x is Exercise => Boolean(x));

  return (
    <Modal onClose={onClose}>
      <div className="chip-row" style={{ marginBottom: 10 }}>
        {e.cats.map((c) => (
          <span key={c} className="tag">
            {CATEGORY_LABEL[c]}
          </span>
        ))}
      </div>
      <h2 style={{ margin: '0 0 4px' }}>{e.name}</h2>
      <div
        style={{
          color: 'var(--text-faint)',
          fontSize: '0.78rem',
          marginBottom: 4,
        }}
      >
        {DIFF_LABEL[e.diff] ?? e.diff}
      </div>
      <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: 18 }}>
        {e.muscles.join(' · ')}
      </div>

      <div className="stat-grid" style={{ marginBottom: 18 }}>
        <div className="stat-tile">
          <div className="val">{e.sets}</div>
          <div className="lab">Séries</div>
        </div>
        <div className="stat-tile">
          <div className="val">{e.reps}</div>
          <div className="lab">Repetições</div>
        </div>
        <div className="stat-tile">
          <div className="val">{e.rest}s</div>
          <div className="lab">Descanso</div>
        </div>
        <div className="stat-tile">
          <div className="val">{e.duration}m</div>
          <div className="lab">Duração</div>
        </div>
      </div>

      <a
        className="btn btn-ghost"
        style={{ textDecoration: 'none', marginBottom: 4 }}
        target="_blank"
        rel="noopener"
        href={youtubeSearch}
      >
        ▶ Ver execução no YouTube
      </a>

      <Section title="Como fazer">
        <ol className="steps">
          {e.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </Section>

      <Section title="Erros comuns">
        <ul className="bullets">
          {e.mistakes.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </Section>

      <Section title="Para que serve">
        <p className="body-text">{e.benefits}</p>
        <p className="body-text" style={{ color: 'var(--text-faint)' }}>
          {e.goal}
        </p>
      </Section>

      {e.cautions && (
        <div className="card alert" style={{ marginTop: 14 }}>
          <b style={{ color: 'var(--coral)', fontSize: '0.82rem' }}>Cuidados</b>
          <p className="body-text" style={{ marginTop: 6 }}>
            {e.cautions}
          </p>
        </div>
      )}

      <Section title="Equipamento">
        <div className="chip-row">
          {e.equip.map((eq) => (
            <span key={eq} className="tag">
              {EQUIPMENT.find((x) => x.id === eq)?.label ?? eq}
            </span>
          ))}
        </div>
      </Section>

      {alternatives.length > 0 && (
        <Section title="Alternativas">
          <div className="chip-row">
            {alternatives.map((alt) => (
              <span key={alt.id} className="chip" onClick={() => onOpen?.(alt)}>
                {alt.name}
              </span>
            ))}
          </div>
        </Section>
      )}

      <p className="disclaimer">
        Estes são exercícios geralmente usados para mobilidade, fortalecimento e prevenção. Não
        substituem avaliação médica ou de fisioterapia.
      </p>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <div className="section-title">{title}</div>
      {children}
    </>
  );
}
