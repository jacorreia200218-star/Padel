/**
 * Motor de decisão da Padel Coach AI.
 *
 * Regras 100% locais e determinísticas — não há chamadas a modelos de IA nem a
 * serviços externos. As decisões são as mesmas da versão anterior; o que mudou
 * foi a origem dos sinais, agora derivados do check-in em `checkin.ts`.
 */

import {
  AGGRESSIVE_CATS,
  EXERCISES,
  GOALS,
  PAIN_ZONES,
  type Category,
  type Exercise,
} from '../data/exercises';
import { deriveSignals, type Checkin, type Signals } from './checkin';

export type { Checkin } from './checkin';

export interface Plan {
  date: string;
  planType: string;
  focus: Category[];
  exerciseIds: string[];
  reasoning: string[];
  duration: number;
  completed: boolean;
  /** Zonas com dor a sério, para as dicas de recuperação. */
  realPainZones: string[];
  muscularZones: string[];
  redFlags: string[];
}

/** Quantos exercícios cabem no tempo disponível. */
const TARGET_COUNT: Record<number, number> = { 10: 2, 20: 3, 30: 5, 45: 7, 60: 9 };

const zoneLabel = (id: string) => PAIN_ZONES.find((z) => z.id === id)?.label ?? id;

export function generatePlan(
  checkin: Checkin,
  goalIds: string[],
  recentUsage: Record<string, string> = {},
): Plan {
  const s = deriveSignals(checkin);
  const reasoning: string[] = [];
  const excluded = new Set<Category>();
  const forced = new Set<Category>();

  const painZones = s.injuries.map((i) => i.zone);

  if (painZones.length) {
    reasoning.push(
      `Dor (não apenas cansaço) em ${painZones.map(zoneLabel).join(', ')}: a evitar exercícios agressivos, priorizando reabilitação.`,
    );
    AGGRESSIVE_CATS.forEach((c) => excluded.add(c));
    painZones.forEach((id) => {
      const zone = PAIN_ZONES.find((z) => z.id === id);
      if (zone) forced.add(zone.rehab);
    });
  }
  if (s.muscularZones.length) {
    reasoning.push(
      `Cansaço muscular em ${s.muscularZones.map(zoneLabel).join(', ')}: incluímos alongamentos/recuperação extra para essas zonas, sem eliminar o treino do dia.`,
    );
  }
  if (s.highFatigue || s.highSoreness || s.poorSleep) {
    reasoning.push('Sinais de fadiga elevada, dor muscular alta ou sono fraco: prioridade para recuperação.');
    AGGRESSIVE_CATS.forEach((c) => excluded.add(c));
  }
  if (s.yesterdayCats.includes('strength')) {
    excluded.add('strength');
    excluded.add('explosiveness');
    reasoning.push(
      'Treino de força/explosão ontem: hoje variamos o estímulo para dar tempo de recuperação a esses grupos musculares.',
    );
  }

  const { planType, focus: initialFocus } = choosePlanType(s, forced, reasoning);
  let focus = initialFocus;

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

  const chosen = pickExercises(checkin, s, focus, excluded, painZones, recentUsage);

  return {
    date: checkin.date,
    planType,
    focus,
    exerciseIds: chosen.map((e) => e.id),
    reasoning,
    duration: chosen.reduce((sum, e) => sum + e.duration, 0),
    completed: false,
    realPainZones: painZones,
    muscularZones: s.muscularZones,
    redFlags: s.redFlags,
  };
}

function choosePlanType(
  s: Signals,
  forced: Set<Category>,
  reasoning: string[],
): { planType: string; focus: Category[] } {
  if (s.highStakes) {
    reasoning.push('Torneio hoje: apenas mobilidade, ativação, alongamentos e respiração — sem carga nova.');
    return { planType: 'Ativação Pré-Jogo', focus: ['mobility', 'activation', 'stretching', 'breathing'] };
  }
  if (s.injuries.length) {
    const focus: Category[] = ['rehabilitation', 'mobility', 'stretching', ...forced];
    if (s.playsToday) focus.push('activation');
    return { planType: 'Reabilitação', focus };
  }
  if (s.muscularZones.length && !s.playsToday && s.playedPadelYesterday) {
    reasoning.push('Cansaço muscular localizado e sem jogo hoje: dia de recuperação focado nessas zonas.');
    return { planType: 'Recuperação', focus: ['stretching', 'recovery', 'mobility'] };
  }
  if (s.intenseYesterday && s.playsToday) {
    reasoning.push('Esforçaste-te bastante ontem e voltas a jogar hoje: recuperação ativa e ativação — sem força.');
    return { planType: 'Recuperação', focus: ['mobility', 'stretching', 'recovery', 'activation'] };
  }
  if (s.highFatigue || s.highSoreness || s.poorSleep) {
    return { planType: 'Recuperação', focus: ['recovery', 'mobility', 'stretching', 'breathing'] };
  }
  if (!s.intenseYesterday && !s.playsToday && s.readiness >= 7) {
    reasoning.push('Descansaste ontem, não jogas hoje e a energia está alta: dia ideal para força, explosão e core.');
    return { planType: 'Força e Potência', focus: ['strength', 'explosiveness', 'core', 'balance'] };
  }
  if (s.playsToday) {
    reasoning.push('Vais jogar hoje: ativação leve e footwork, mantendo o corpo fresco.');
    return { planType: 'Manutenção Leve', focus: ['mobility', 'activation', 'footwork', 'stretching'] };
  }
  reasoning.push('Dia sem jogo nem sinais de alarme: treino equilibrado.');
  return { planType: 'Treino Equilibrado', focus: ['mobility', 'core', 'stability', 'agility'] };
}

function pickExercises(
  checkin: Checkin,
  s: Signals,
  focus: Category[],
  excluded: Set<Category>,
  painZones: string[],
  recentUsage: Record<string, string>,
): Exercise[] {
  const equipSet = new Set(checkin.equipment.length ? checkin.equipment : ['bodyweight']);
  const pool = EXERCISES.filter(
    (e) =>
      e.cats.some((c) => focus.includes(c)) &&
      !e.cats.some((c) => excluded.has(c)) &&
      (e.equip.every((eq) => eq === 'bodyweight') || e.equip.some((eq) => equipSet.has(eq))),
  );

  const selected: Exercise[] = [];

  // Cada zona com dor traz primeiro o seu exercício de reabilitação.
  painZones.forEach((id) => {
    const rehabCat = PAIN_ZONES.find((z) => z.id === id)?.rehab;
    if (!rehabCat) return;
    const match = pool.find((e) => e.cats.includes(rehabCat) && !selected.includes(e));
    if (match) selected.push(match);
  });

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

  if (selected.length) return selected;

  // Rede de segurança: se nada passou nos filtros, algo suave e sem material.
  return EXERCISES.filter(
    (e) =>
      (e.cats.includes('mobility') || e.cats.includes('stretching')) &&
      e.equip.every((x) => x === 'bodyweight'),
  ).slice(0, targetCount);
}

/** Prontidão de 0 a 10, para mostrar no anel. */
export function readinessScore(c: Checkin): number {
  return deriveSignals(c).readiness;
}
