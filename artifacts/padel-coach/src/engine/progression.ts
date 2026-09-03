/**
 * Progressão gradual dos exercícios.
 *
 * Isto NÃO é aprendizagem. É uma regra simples e previsível: um exercício que
 * seja concluído sem problemas algumas vezes seguidas passa a ser pedido um
 * pouco mais exigente. Um exercício que provoque dor recua.
 *
 * A distinção importa. Com um check-in por dia não há dados que cheguem para
 * um sistema inferir o que quer que seja sobre quem o usa — mas há de sobra
 * para contar até três. O que esta regra faz é mensurável, explicável e
 * reversível, e é isso que a torna honesta.
 *
 * Cada degrau muda uma coisa de cada vez, nunca tudo ao mesmo tempo.
 */

import type { Exercise } from '../data/exercises';

export interface ExerciseProgress {
  /** Conclusões sem problemas desde a última subida de nível. */
  completed: number;
  /** 0 = como está na biblioteca. */
  level: number;
}

/** Conclusões seguidas necessárias para subir um degrau. */
export const SESSIONS_PER_LEVEL = 3;

/**
 * Os degraus. Cada um altera exactamente uma coisa em relação ao anterior:
 * primeiro mais uma série, depois menos descanso, depois outra série.
 *
 * As repetições ficam de fora de propósito: são texto ("12/lado", "30-40s") e
 * incrementá-las por código daria resultados sem sentido.
 */
const LADDER = [
  { sets: 0, rest: 0, label: '' },
  { sets: 1, rest: 0, label: '+1 série' },
  { sets: 1, rest: -5, label: '+1 série, menos 5s de descanso' },
  { sets: 2, rest: -5, label: '+2 séries, menos 5s de descanso' },
];

export const MAX_LEVEL = LADDER.length - 1;

/** Descanso mínimo. Abaixo disto deixa de ser descanso. */
const MIN_REST = 15;

export function levelLabel(level: number): string {
  return LADDER[Math.min(level, MAX_LEVEL)]?.label ?? '';
}

/**
 * O exercício com a progressão aplicada. A duração acompanha as séries, para
 * a estimativa de tempo do plano não ficar a mentir.
 */
export function applyProgression(exercise: Exercise, level: number): Exercise {
  const step = LADDER[Math.min(Math.max(level, 0), MAX_LEVEL)];
  if (!step || (!step.sets && !step.rest)) return exercise;

  const sets = exercise.sets + step.sets;
  // Um exercício sem descanso definido (caminhada, respiração) não passa a ter.
  const rest = exercise.rest > 0 ? Math.max(MIN_REST, exercise.rest + step.rest) : 0;

  return {
    ...exercise,
    sets,
    rest,
    duration: Math.round((exercise.duration * sets) / exercise.sets),
  };
}

export function levelOf(progress: Record<string, ExerciseProgress>, id: string): number {
  return progress[id]?.level ?? 0;
}

export interface SessionOutcome {
  /** Exercícios concluídos sem problemas. */
  done: string[];
  /** Exercícios saltados. */
  skipped: string[];
  /** Exercícios que provocaram dor. */
  painful: string[];
}

/**
 * Actualiza a progressão no fim de um treino e diz o que subiu de nível, para
 * a app o poder mostrar — subir de nível sem ninguém dar por isso não motiva
 * ninguém.
 */
export function recordSession(
  progress: Record<string, ExerciseProgress>,
  outcome: SessionOutcome,
): { progress: Record<string, ExerciseProgress>; leveledUp: string[] } {
  const next = structuredClone(progress);
  const leveledUp: string[] = [];

  const entry = (id: string): ExerciseProgress =>
    (next[id] ??= { completed: 0, level: 0 });

  for (const id of outcome.done) {
    const p = entry(id);
    p.completed++;
    if (p.completed >= SESSIONS_PER_LEVEL && p.level < MAX_LEVEL) {
      p.level++;
      p.completed = 0;
      leveledUp.push(id);
    }
  }

  // Dor faz recuar um degrau. Um exercício que passou a doer estava a pedir
  // demais, e insistir no mesmo nível é a forma mais rápida de piorar.
  for (const id of outcome.painful) {
    const p = entry(id);
    p.level = Math.max(0, p.level - 1);
    p.completed = 0;
  }

  // Saltar não penaliza — só não conta. Pode ter sido falta de tempo.
  for (const id of outcome.skipped) {
    entry(id).completed = 0;
  }

  return { progress: next, leveledUp };
}
