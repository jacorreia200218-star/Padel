import type { Exercise } from '../data/exercises';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: () => void;
}

export function ExerciseCard({ exercise, onClick }: ExerciseCardProps) {
  return (
    <div className="ex-card" onClick={onClick}>
      <div className="ex-badge">{exercise.sets}×</div>
      <div style={{ flex: 1 }}>
        <div className="ex-name">{exercise.name}</div>
        <div className="ex-meta">
          {exercise.reps} · descanso {exercise.rest}s
        </div>
      </div>
      <div className="ex-time">{exercise.duration}m</div>
    </div>
  );
}
