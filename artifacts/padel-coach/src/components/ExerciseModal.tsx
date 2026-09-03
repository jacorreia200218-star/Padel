import { CATEGORY_LABEL, EQUIPMENT, type Exercise } from '../data/exercises';
import { Modal } from './Modal';

interface ExerciseModalProps {
  exercise: Exercise;
  onClose: () => void;
}

export function ExerciseModal({ exercise: e, onClose }: ExerciseModalProps) {
  // Uma pesquisa no YouTube em vez de um link fixo: nomes de exercícios mudam
  // de canal para canal e um URL fixo acaba por apontar para vídeo removido.
  const youtubeSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    e.name + ' exercício padel',
  )}`;

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
          marginBottom: 18,
          textTransform: 'capitalize',
        }}
      >
        {e.diff}
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

      <div className="section-title" style={{ marginTop: 0 }}>
        Descrição
      </div>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', margin: '0 0 14px' }}>{e.desc}</p>

      <div className="section-title">Objetivo</div>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', margin: '0 0 14px' }}>{e.goal}</p>

      <div className="section-title">Equipamento</div>
      <div className="chip-row" style={{ marginBottom: 20 }}>
        {e.equip.map((eq) => (
          <span key={eq} className="tag">
            {EQUIPMENT.find((x) => x.id === eq)?.label ?? eq}
          </span>
        ))}
      </div>

      <a
        className="btn btn-ghost"
        style={{ textDecoration: 'none' }}
        target="_blank"
        rel="noopener"
        href={youtubeSearch}
      >
        ▶ Ver exemplos em vídeo
      </a>
    </Modal>
  );
}
