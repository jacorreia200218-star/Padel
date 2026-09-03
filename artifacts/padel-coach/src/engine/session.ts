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

const DIFF_RANK: Record<Exercise['diff'], number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

/**
 * Um exercício que sirva o mesmo propósito.
 *
 * Preferimos sempre as alternativas escritas à mão em `alts`: foram escolhidas
 * por quem conhece o movimento e são melhores do que qualquer coincidência de
 * categorias. Só quando nenhuma serve é que procuramos na biblioteca inteira.
 *
 * `easier` limita a dificuldades mais baixas — é o que responde a "reduzir
 * dificuldade" quando o exercício custa demais mas não dói.
 */
export function findAlternative(
  exercise: Exercise,
  equipment: string[],
  excludeIds: string[],
  { easier = false }: { easier?: boolean } = {},
): Exercise | undefined {
  const equipSet = new Set(equipment.length ? equipment : ['bodyweight']);

  const usable = (e: Exercise) => {
    if (e.id === exercise.id || excludeIds.includes(e.id)) return false;
    const hasEquipment =
      e.equip.every((eq) => eq === 'bodyweight') || e.equip.some((eq) => equipSet.has(eq));
    if (!hasEquipment) return false;
    if (easier && DIFF_RANK[e.diff] >= DIFF_RANK[exercise.diff]) return false;
    return true;
  };

  const declared = (exercise.alts ?? [])
    .map((id) => EXERCISES.find((e) => e.id === id))
    .filter((e): e is Exercise => Boolean(e) && usable(e!));
  if (declared.length) return declared[0];

  const candidates = EXERCISES.filter(
    (e) => usable(e) && e.cats.some((c) => exercise.cats.includes(c)),
  );
  if (!candidates.length) return undefined;

  // Entre os candidatos, o que partilha mais categorias com o original.
  return candidates.sort((a, b) => {
    const shared = (e: Exercise) => e.cats.filter((c) => exercise.cats.includes(c)).length;
    return shared(b) - shared(a) || DIFF_RANK[a.diff] - DIFF_RANK[b.diff];
  })[0];
}

/** Quanto do treino já foi feito, de 0 a 1. */
export function progress(s: Session): number {
  if (!s.exerciseIds.length) return 0;
  return Math.min(1, s.index / s.exerciseIds.length);
}
