/**
 * A sessão de treino: fazer o plano, um exercício de cada vez.
 *
 * Fica guardada com o resto dos dados de propósito. Um treino é interrompido
 * a toda a hora — o telemóvel bloqueia, alguém liga, muda-se de separador — e
 * ter de recomeçar do primeiro exercício é a diferença entre usar a app durante
 * o treino e desistir dela ao segundo dia.
 */

import { EXERCISES, exerciseById, type Exercise } from '../data/exercises';

export interface Session {
  /** Dia do plano que está a ser executado. */
  date: string;
  /** Cópia da lista do plano: substituir um exercício muda-a só aqui. */
  exerciseIds: string[];
  index: number;
  done: string[];
  skipped: string[];
  /** Exercícios que provocaram dor, para o plano de amanhã os evitar. */
  painful: string[];
  startedAt: string;
  finishedAt?: string;
}

export function startSession(date: string, exerciseIds: string[]): Session {
  return {
    date,
    exerciseIds: [...exerciseIds],
    index: 0,
    done: [],
    skipped: [],
    painful: [],
    startedAt: new Date().toISOString(),
  };
}

export function currentExercise(s: Session): Exercise | undefined {
  return exerciseById(s.exerciseIds[s.index]);
}

export function isFinished(s: Session): boolean {
  return s.index >= s.exerciseIds.length;
}

/**
 * Um exercício que sirva o mesmo propósito.
 *
 * Procuramos primeiro algo que partilhe categorias e não exija material que a
 * pessoa não tenha. `easier` limita a exercícios de dificuldade mais baixa —
 * é o que responde a "reduzir dificuldade" quando o exercício custa demais.
 */
export function findAlternative(
  exercise: Exercise,
  equipment: string[],
  excludeIds: string[],
  { easier = false }: { easier?: boolean } = {},
): Exercise | undefined {
  const equipSet = new Set(equipment.length ? equipment : ['bodyweight']);
  const rank: Record<Exercise['diff'], number> = { beginner: 0, intermediate: 1, advanced: 2 };

  const candidates = EXERCISES.filter((e) => {
    if (e.id === exercise.id || excludeIds.includes(e.id)) return false;
    if (!e.cats.some((c) => exercise.cats.includes(c))) return false;
    const hasEquipment =
      e.equip.every((eq) => eq === 'bodyweight') || e.equip.some((eq) => equipSet.has(eq));
    if (!hasEquipment) return false;
    if (easier && rank[e.diff] >= rank[exercise.diff]) return false;
    return true;
  });

  if (!candidates.length) return undefined;

  // Entre os candidatos, o que partilha mais categorias com o original.
  return candidates.sort((a, b) => {
    const shared = (e: Exercise) => e.cats.filter((c) => exercise.cats.includes(c)).length;
    return shared(b) - shared(a) || rank[a.diff] - rank[b.diff];
  })[0];
}

/** Quanto do treino já foi feito, de 0 a 1. */
export function progress(s: Session): number {
  if (!s.exerciseIds.length) return 0;
  return Math.min(1, s.index / s.exerciseIds.length);
}
