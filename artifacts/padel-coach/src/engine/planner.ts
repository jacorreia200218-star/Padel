/**
 * Motor de decisão da Padel Coach AI.
 *
 * Regras 100% locais e determinísticas — não há chamadas a modelos de IA nem a
 * serviços externos. Portado sem alterações de comportamento a partir da versão
 * anterior em index.html.
 */

import {
  AGGRESSIVE_CATS,
  EXERCISES,
  GOALS,
  PAIN_ZONES,
  type Category,
  type Exercise,
} from '../data/exercises';

/** Estado de uma zona do corpo no check-in: cansaço muscular ou dor a sério. */
export type PainState = 'muscular' | 'dor';

export interface Checkin {
  date: string;
  playingToday: string;
  hours: string;
  playedYesterday: string;
  yesterdayTraining: string;
  energy: number;
  soreness: number;
  fatigue: number;
  sleep: number;
  painZones: Record<string, PainState>;
  time: number;
  equipment: string[];
}

export interface Plan {
  date: string;
  planType: string;
  focus: Category[];
  exerciseIds: string[];
  reasoning: string[];
  duration: number;
  completed: boolean;
  realPainZones: string[];
  muscularZones: string[];
}

/** Quantos exercícios cabem no tempo disponível. */
const TARGET_COUNT: Record<number, number> = { 10: 2, 20: 3, 30: 5, 45: 7, 60: 9 };

export function generatePlan(
  checkin: Checkin,
  goalIds: string[],
  recentUsage: Record<string, string> = {},
): Plan {
  const reasoning: string[] = [];
  const excluded = new Set<Category>();
  const forced = new Set<Category>();

  const zoneEntries = Object.entries(checkin.painZones || {});
  const realPainZones = zoneEntries.filter(([, t]) => t === 'dor').map(([id]) => id);
  const muscularZones = zoneEntries.filter(([, t]) => t === 'muscular').map(([id]) => id);

  const zoneLabel = (id: string) => PAIN_ZONES.find((z) => z.id === id)!.label;

  if (realPainZones.length) {
    reasoning.push(
      `Dor (não apenas cansaço) em ${realPainZones.map(zoneLabel).join(', ')}: a evitar exercícios agressivos, priorizando reabilitação.`,
    );
    AGGRESSIVE_CATS.forEach((c) => excluded.add(c));
    realPainZones.forEach((id) => forced.add(PAIN_ZONES.find((z) => z.id === id)!.rehab));
  }
  if (muscularZones.length) {
    reasoning.push(
      `Cansaço muscular em ${muscularZones.map(zoneLabel).join(', ')}: incluímos alongamentos/recuperação extra para essas zonas, sem eliminar o treino do dia.`,
    );
  }

  const highFatigue = checkin.fatigue >= 8;
  const highSoreness = checkin.soreness >= 8;
  const poorSleep = checkin.sleep <= 3;
  if (highFatigue || highSoreness || poorSleep) {
    reasoning.push('Sinais de fadiga elevada, dor muscular alta ou sono fraco: prioridade para recuperação.');
    AGGRESSIVE_CATS.forEach((c) => excluded.add(c));
  }
  if (checkin.yesterdayTraining === 'strength') {
    excluded.add('strength');
    excluded.add('explosiveness');
    reasoning.push(
      'Treino de força/explosão ontem: hoje variamos o estímulo para dar tempo de recuperação a esses grupos musculares.',
    );
  }

  let planType: string;
  let focus: Category[];
  const playsToday = checkin.playingToday !== 'none';
  const highStakes = checkin.playingToday === 'tournament';

  if (highStakes) {
    planType = 'Ativação Pré-Jogo';
    focus = ['mobility', 'activation', 'stretching', 'breathing'];
    reasoning.push('Torneio hoje: apenas mobilidade, ativação, alongamentos e respiração — sem carga nova.');
  } else if (realPainZones.length) {
    planType = 'Reabilitação';
    focus = ['rehabilitation', 'mobility', 'stretching', ...forced];
    if (playsToday) focus.push('activation');
  } else if (muscularZones.length && !playsToday && checkin.playedYesterday !== 'none') {
    planType = 'Recuperação';
    focus = ['stretching', 'recovery', 'mobility'];
    reasoning.push('Cansaço muscular localizado e sem jogo hoje: dia de recuperação focado nessas zonas.');
  } else if (checkin.playedYesterday === 'intense' && playsToday) {
    planType = 'Recuperação';
    focus = ['mobility', 'stretching', 'recovery', 'activation'];
    reasoning.push('Jogaste intenso ontem e voltas a jogar hoje: recuperação ativa e ativação — sem força.');
  } else if (highFatigue || highSoreness || poorSleep) {
    planType = 'Recuperação';
    focus = ['recovery', 'mobility', 'stretching', 'breathing'];
  } else if (checkin.playedYesterday === 'none' && !playsToday && checkin.energy >= 7) {
    planType = 'Força e Potência';
    focus = ['strength', 'explosiveness', 'core', 'balance'];
    reasoning.push('Descansaste ontem, não jogas hoje e a energia está alta: dia ideal para força, explosão e core.');
  } else if (playsToday) {
    planType = 'Manutenção Leve';
    focus = ['mobility', 'activation', 'footwork', 'stretching'];
    reasoning.push('Vais jogar hoje: ativação leve e footwork, mantendo o corpo fresco.');
  } else {
    planType = 'Treino Equilibrado';
    focus = ['mobility', 'core', 'stability', 'agility'];
    reasoning.push('Dia sem jogo nem sinais de alarme: treino equilibrado.');
  }

  if (planType === 'Treino Equilibrado' || planType === 'Força e Potência') {
    const goalsChosen = GOALS.filter((g) => goalIds.includes(g.id));
    goalsChosen.forEach((g) =>
      g.favors.forEach((c) => {
        if (!excluded.has(c) && !focus.includes(c)) focus.push(c);
      }),
    );
    if (goalsChosen.length) {
      reasoning.push('Ajustado aos objetivos definidos: ' + goalsChosen.map((g) => g.label).join(', ') + '.');
    }
  }

  focus = [...new Set(focus)].filter((c) => !excluded.has(c));
  if (!focus.length) focus = ['mobility', 'stretching', 'breathing'];

  const equipSet = new Set(checkin.equipment.length ? checkin.equipment : ['bodyweight']);
  const pool = EXERCISES.filter(
    (e) =>
      e.cats.some((c) => focus.includes(c)) &&
      !e.cats.some((c) => excluded.has(c)) &&
      (e.equip.every((eq) => eq === 'bodyweight') || e.equip.some((eq) => equipSet.has(eq))),
  );

  const selected: Exercise[] = [];
  if (realPainZones.length) {
    realPainZones.forEach((p) => {
      const rehabCat = PAIN_ZONES.find((z) => z.id === p)!.rehab;
      const match = pool.find((e) => e.cats.includes(rehabCat) && !selected.includes(e));
      if (match) selected.push(match);
    });
  }

  const targetCount = TARGET_COUNT[checkin.time] || 5;

  // Preferimos exercícios que não saem há mais tempo, para o plano não repetir
  // sempre os mesmos. O jitter desempata para haver variedade entre dias iguais.
  const daysSince = (id: string) => {
    if (!recentUsage[id]) return 999;
    const diff = (new Date(checkin.date).getTime() - new Date(recentUsage[id]).getTime()) / 86400000;
    return Math.max(0, diff);
  };
  const rest = pool
    .filter((e) => !selected.includes(e))
    .map((e) => {
      const r = focus.findIndex((c) => e.cats.includes(c));
      return { e, rank: r < 0 ? 99 : r, jitter: Math.random() };
    })
    .sort((a, b) => a.rank - b.rank || daysSince(b.e.id) - daysSince(a.e.id) || a.jitter - b.jitter)
    .map((x) => x.e);

  for (const e of rest) {
    if (selected.length >= targetCount) break;
    selected.push(e);
  }

  let chosen = selected;
  if (!chosen.length) {
    chosen = EXERCISES.filter(
      (e) =>
        (e.cats.includes('mobility') || e.cats.includes('stretching')) &&
        e.equip.every((x) => x === 'bodyweight'),
    ).slice(0, targetCount);
  }

  return {
    date: checkin.date,
    planType,
    focus,
    exerciseIds: chosen.map((e) => e.id),
    reasoning,
    duration: chosen.reduce((s, e) => s + e.duration, 0),
    completed: false,
    realPainZones,
    muscularZones,
  };
}

/** Prontidão de 0 a 10, média de fadiga/dor invertidas com energia e sono. */
export function readinessScore(c: Checkin): number {
  return Math.round((((10 - c.fatigue) + (10 - c.soreness) + c.energy + c.sleep) / 4) * 10) / 10;
}
