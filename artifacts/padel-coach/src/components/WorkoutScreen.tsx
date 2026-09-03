import { useState } from 'react';

import { CATEGORY_LABEL, EQUIPMENT, type Exercise } from '../data/exercises';
import { applyProgression, levelLabel, levelOf, type ExerciseProgress } from '../engine/progression';
import {
  currentExercise,
  findAlternative,
  isFinished,
  progress,
  type Session,
} from '../engine/session';
import { RestTimer } from './RestTimer';
import { showToast } from './Toast';

type Phase = 'ready' | 'doing' | 'resting';

interface WorkoutScreenProps {
  session: Session;
  equipment: string[];
  progress: Record<string, ExerciseProgress>;
  onUpdate: (next: Session) => void;
  onFinish: (session: Session) => void;
  onClose: () => void;
}

export function WorkoutScreen({
  session,
  equipment,
  progress: exerciseProgress,
  onUpdate,
  onFinish,
  onClose,
}: WorkoutScreenProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [menuOpen, setMenuOpen] = useState(false);

  const base = currentExercise(session);
  const level = base ? levelOf(exerciseProgress, base.id) : 0;
  const exercise = base ? applyProgression(base, level) : undefined;
  const total = session.exerciseIds.length;

  if (isFinished(session) || !exercise || !base) {
    return <WorkoutDone session={session} onClose={onClose} />;
  }

  const advance = (patch: Partial<Session>) => {
    const next = { ...session, ...patch, index: session.index + 1 };
    setPhase('ready');
    setMenuOpen(false);
    if (next.index >= next.exerciseIds.length) onFinish(next);
    else onUpdate(next);
  };

  const replaceCurrent = (opts: { easier?: boolean; painful?: boolean }) => {
    const alternative = findAlternative(exercise, equipment, session.exerciseIds, {
      easier: opts.easier,
    });
    if (!alternative) {
      showToast('Não encontrei alternativa com o material que tens. Salta este exercício.');
      setMenuOpen(false);
      return;
    }
    const exerciseIds = [...session.exerciseIds];
    exerciseIds[session.index] = alternative.id;
    onUpdate({
      ...session,
      exerciseIds,
      painful: opts.painful ? [...session.painful, exercise.id] : session.painful,
    });
    setPhase('ready');
    setMenuOpen(false);
    showToast(`Trocado por: ${alternative.name}`);
  };

  return (
    <div className="workout">
      <div className="workout-top">
        <button className="workout-close" onClick={onClose} aria-label="Sair do treino">
          ✕
        </button>
        <div className="workout-count">
          {session.index + 1} / {total}
        </div>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress(session) * 100}%` }} />
      </div>

      <div className="workout-body">
        <div className="chip-row" style={{ justifyContent: 'center', marginBottom: 14 }}>
          {exercise.cats.slice(0, 3).map((c) => (
            <span key={c} className="tag">
              {CATEGORY_LABEL[c]}
            </span>
          ))}
        </div>

        <h2 className="workout-name">{exercise.name}</h2>
        <div className="workout-dose">
          {exercise.sets} × {exercise.reps}
        </div>
        {level > 0 && <div className="workout-level">nível {level} · {levelLabel(level)}</div>}
        <p className="workout-desc">{exercise.desc}</p>

        {exercise.equip.some((e) => e !== 'bodyweight') && (
          <div className="workout-equip">
            {exercise.equip
              .map((eq) => EQUIPMENT.find((x) => x.id === eq)?.label ?? eq)
              .join(' · ')}
          </div>
        )}

        {/* Antes de começar mostramos como se faz; durante o exercício isso já
            não interessa e só rouba espaço ao que importa. */}
        {phase === 'ready' && (
          <ol className="steps workout-steps">
            {exercise.instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        )}

        {phase === 'ready' && exercise.cautions && (
          <div className="workout-caution">⚠ {exercise.cautions}</div>
        )}

        {phase === 'resting' && (
          <RestTimer seconds={exercise.rest} onDone={() => advance({ done: [...session.done, exercise.id] })} />
        )}
      </div>

      <div className="workout-actions">
        {phase === 'ready' && (
          <>
            <a
              className="btn btn-ghost"
              style={{ textDecoration: 'none' }}
              target="_blank"
              rel="noopener"
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + ' exercício padel')}`}
            >
              ▶ Ver execução
            </a>
            <button className="btn btn-primary" onClick={() => setPhase('doing')}>
              Começar
            </button>
          </>
        )}

        {phase === 'doing' && (
          <button
            className="btn btn-primary"
            onClick={() => {
              // Sem descanso definido, não vale a pena mostrar um cronómetro de 0s.
              if (exercise.rest > 0) setPhase('resting');
              else advance({ done: [...session.done, exercise.id] });
            }}
          >
            Concluído
          </button>
        )}

        {phase === 'resting' && (
          <button
            className="btn btn-ghost"
            onClick={() => advance({ done: [...session.done, exercise.id] })}
          >
            Saltar descanso
          </button>
        )}

        <button className="btn btn-ghost workout-problem" onClick={() => setMenuOpen(true)}>
          Este exercício está a custar
        </button>
      </div>

      {menuOpen && (
        <ProblemMenu
          exercise={exercise}
          onReplace={() => replaceCurrent({ painful: true })}
          onEasier={() => replaceCurrent({ easier: true })}
          onSkip={() => advance({ skipped: [...session.skipped, exercise.id] })}
          onStop={() => onFinish({ ...session, index: session.exerciseIds.length })}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}

interface ProblemMenuProps {
  exercise: Exercise;
  onReplace: () => void;
  onEasier: () => void;
  onSkip: () => void;
  onStop: () => void;
  onClose: () => void;
}

/**
 * O que fazer quando um exercício dói ou custa demais. Sair a meio é uma opção
 * legítima e está aqui à vista — esconder isso só leva a treinar contra a dor.
 */
function ProblemMenu({ exercise, onReplace, onEasier, onSkip, onStop, onClose }: ProblemMenuProps) {
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <h2 style={{ margin: '0 0 6px' }}>{exercise.name}</h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-dim)', margin: '0 0 20px' }}>
          O que se passa?
        </p>

        <button className="btn btn-ghost" style={{ marginBottom: 10 }} onClick={onReplace}>
          Provoca dor — trocar por outro
        </button>
        <button className="btn btn-ghost" style={{ marginBottom: 10 }} onClick={onEasier}>
          É difícil demais — versão mais fácil
        </button>
        <button className="btn btn-ghost" style={{ marginBottom: 10 }} onClick={onSkip}>
          Saltar este exercício
        </button>
        <button className="btn btn-danger" style={{ marginBottom: 10 }} onClick={onStop}>
          Terminar o treino aqui
        </button>
        <button className="btn btn-ghost" onClick={onClose}>
          Voltar
        </button>

        <p style={{ fontSize: '0.74rem', color: 'var(--text-faint)', margin: '16px 0 0' }}>
          Dor durante o exercício não é para aguentar. Se persistir depois de parar, procura
          avaliação profissional.
        </p>
      </div>
    </div>
  );
}

function WorkoutDone({ session, onClose }: { session: Session; onClose: () => void }) {
  const feitos = session.done.length;
  const saltados = session.skipped.length;

  return (
    <div className="workout">
      <div className="workout-body" style={{ justifyContent: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎾</div>
        <h2 className="workout-name">Treino concluído</h2>
        <div className="workout-dose">
          {feitos} {feitos === 1 ? 'exercício feito' : 'exercícios feitos'}
          {saltados > 0 && ` · ${saltados} saltado${saltados === 1 ? '' : 's'}`}
        </div>
      </div>
      <div className="workout-actions">
        <button className="btn btn-primary" onClick={onClose}>
          Voltar
        </button>
      </div>
    </div>
  );
}
