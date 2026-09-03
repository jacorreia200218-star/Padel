import type { Exercise } from '../data/exercises';

interface ExerciseCardProps {
  exercise: Exercise;
  /** Degrau de progressão, se houver. 0 mostra o exercício como está na biblioteca. */
  level?: number;
  onClick: () => void;
}

export function ExerciseCard({ exercise, level = 0, onClick }: ExerciseCardProps) {
  return (
    <div className="ex-card" onClick={onClick}>
      <div className="ex-badge">{exercise.sets}×</div>
      <div style={{ flex: 1 }}>
        <div className="ex-name">
          {exercise.name}
          {level > 0 && <span className="level-badge">nível {level}</span>}
        </div>
        <div className="ex-meta">
          {exercise.reps} · descanso {exercise.rest}s
        </div>
      </div>
      <div className="ex-time">{exercise.duration}m</div>
    </div>
  );
}
