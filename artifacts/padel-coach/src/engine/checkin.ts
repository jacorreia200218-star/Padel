/**
 * O check-in diário e os sinais que dele se derivam.
 *
 * O formulário recolhe o estado em linguagem humana (escalas de 1 a 5, níveis
 * de dor, o que se fez ontem). O motor de decisão precisa de sinais mais
 * grosseiros — "está cansado?", "jogou intenso ontem?". A tradução entre os
 * dois vive aqui, num sítio só, para o formulário e o motor poderem mudar de
 * forma independente.
 */

import { YESTERDAY_ACTIVITIES, type Category } from '../data/exercises';

export type SorenessLevel = 'none' | 'light' | 'moderate' | 'strong';
export type PainOnset = 'today' | 'days' | 'weeks' | 'months';
export type PainWhen = 'movement' | 'rest';
export type PainTrend = 'better' | 'same' | 'worse';

/** Uma dor que o utilizador diz não ser apenas cansaço muscular. */
export interface Injury {
  zone: string;
  intensity: number; // 0-10
  onset: PainOnset;
  when: PainWhen;
  trigger: string; // movimento que a provoca, texto livre
  trend: PainTrend;
}

export interface YesterdayActivity {
  type: string;
  minutes: number;
  rpe: number; // esforço percebido, 1-10
}

export interface Checkin {
  version: 2;
  date: string;

  // O que vem aí hoje
  playingToday: string;
  hours: string;
  time: number;
  equipment: string[];

  // Sono
  sleepHours: number;
  sleepQuality: number; // 1-5

  // Como se sente
  energy: number; // 1-5
  fatigue: number; // 1-5
  soreness: SorenessLevel;
  sorenessIntensity: number; // 0-10, só conta se soreness !== 'none'
  muscularZones: string[];

  // Dor que não é apenas muscular
  injuries: Injury[];

  // O que fez ontem
  yesterday: YesterdayActivity;
}

export function emptyCheckin(date: string): Checkin {
  return {
    version: 2,
    date,
    playingToday: 'none',
    hours: '1.5',
    time: 30,
    equipment: ['bodyweight'],
    sleepHours: 7,
    sleepQuality: 3,
    energy: 3,
    fatigue: 3,
    soreness: 'none',
    sorenessIntensity: 0,
    muscularZones: [],
    injuries: [],
    yesterday: { type: 'none', minutes: 0, rpe: 5 },
  };
}

/**
 * Sinais derivados do check-in, na forma que o motor de decisão consome.
 * Manter esta camada evita espalhar limiares mágicos pelo código todo.
 */
export interface Signals {
  /** 0-10, quanto maior melhor. */
  readiness: number;
  poorSleep: boolean;
  highFatigue: boolean;
  highSoreness: boolean;
  playsToday: boolean;
  highStakes: boolean;
  playedPadelYesterday: boolean;
  intenseYesterday: boolean;
  /** Categorias já trabalhadas ontem, a variar hoje. */
  yesterdayCats: Category[];
  injuries: Injury[];
  muscularZones: string[];
  /** Dor que justifica parar e procurar avaliação profissional. */
  redFlags: string[];
}

/** Intensidade típica de cada nível, usada como ponto de partida do slider. */
export const SORENESS_WEIGHT: Record<SorenessLevel, number> = {
  none: 0,
  light: 3,
  moderate: 6,
  strong: 9,
};

/** Dor muscular numa escala 0-10, combinando o nível com a intensidade dada. */
export function sorenessScore(c: Checkin): number {
  if (c.soreness === 'none') return 0;
  return c.sorenessIntensity || SORENESS_WEIGHT[c.soreness];
}

/**
 * Situações em que a app não deve limitar-se a aliviar o treino.
 *
 * Não é diagnóstico — é só reconhecer os casos em que continuar a treinar por
 * conta própria não é boa ideia, e dizê-lo.
 */
export function redFlagsFor(c: Checkin): string[] {
  const flags: string[] = [];
  for (const inj of c.injuries) {
    if (inj.intensity >= 7) {
      flags.push('Dor intensa (7 ou mais em 10).');
    }
    if (inj.when === 'rest' && inj.intensity >= 5) {
      flags.push('Dor moderada a forte que aparece mesmo em repouso.');
    }
    if (inj.trend === 'worse' && (inj.onset === 'weeks' || inj.onset === 'months')) {
      flags.push('Dor que dura há semanas ou meses e continua a piorar.');
    }
  }
  return [...new Set(flags)];
}

export function deriveSignals(c: Checkin): Signals {
  const activity = YESTERDAY_ACTIVITIES.find((a) => a.id === c.yesterday.type);
  const soreness = sorenessScore(c);

  // Prontidão de 0 a 10. Energia e sono puxam para cima, cansaço e dor para
  // baixo. As escalas de 1-5 são convertidas para 0-10 para todas pesarem igual.
  const readiness =
    Math.round(
      (((c.energy - 1) / 4) * 10 +
        ((c.sleepQuality - 1) / 4) * 10 +
        (10 - ((c.fatigue - 1) / 4) * 10) +
        (10 - soreness)) /
        4 *
        10,
    ) / 10;

  return {
    readiness,
    poorSleep: c.sleepQuality <= 2 || c.sleepHours < 6,
    highFatigue: c.fatigue >= 4,
    highSoreness: soreness >= 7,
    playsToday: c.playingToday !== 'none',
    highStakes: c.playingToday === 'tournament',
    playedPadelYesterday: Boolean(activity?.padel),
    intenseYesterday: c.yesterday.type !== 'none' && c.yesterday.rpe >= 7,
    yesterdayCats: activity?.cats ?? [],
    injuries: c.injuries,
    muscularZones: c.muscularZones,
    redFlags: redFlagsFor(c),
  };
}
