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
/**
 * Estado do dia.
 * - `green`: treinar normalmente
 * - `yellow`: treinar com moderação — menos volume, sem saltos nem sprints
 * - `red`: recuperação e cuidado — nada de carga, e às vezes procurar ajuda
 */
export type Status = 'green' | 'yellow' | 'red';

export interface Signals {
  status: Status;
  /** Porque é que o dia ficou neste estado, em linguagem corrente. */
  statusReasons: string[];
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

/** A dor mais forte reportada hoje, 0 se não houver nenhuma. */
export function worstPain(c: Checkin): number {
  return c.injuries.reduce((max, i) => Math.max(max, i.intensity), 0);
}

/**
 * Estado do dia e as razões que o justificam.
 *
 * A ordem importa: basta uma condição de vermelho para o dia ser vermelho,
 * mesmo que tudo o resto esteja bem. Recolhemos à mesma todas as razões, para
 * a app poder explicar a decisão em vez de a impor.
 */
function computeStatus(
  c: Checkin,
  readiness: number,
  soreness: number,
  redFlags: string[],
  poorSleep: boolean,
): { status: Status; statusReasons: string[] } {
  const pain = worstPain(c);
  const red: string[] = [];
  const yellow: string[] = [];

  if (redFlags.length) red.push('Há sinais que merecem avaliação profissional.');
  if (pain >= 5) red.push(`Dor de ${pain}/10 numa zona localizada.`);
  if (soreness >= 8) red.push('Dores musculares muito fortes.');
  if (c.energy <= 2 && c.fatigue >= 4) red.push('Energia no fundo e cansaço elevado.');
  if (readiness < 4) red.push('A prontidão de hoje está muito baixa.');

  if (pain > 0) yellow.push(`Dor de ${pain}/10 — evitamos o que possa agravar a zona.`);
  if (soreness >= 4) yellow.push('Dores musculares a contar.');
  if (poorSleep) yellow.push('Dormiste pouco ou mal.');
  if (c.fatigue >= 4) yellow.push('Cansaço elevado.');
  if (c.energy <= 2) yellow.push('Energia baixa.');
  if (readiness < 6.5) yellow.push('A prontidão de hoje está abaixo do habitual.');

  if (red.length) return { status: 'red', statusReasons: red };
  if (yellow.length) return { status: 'yellow', statusReasons: yellow };
  return { status: 'green', statusReasons: ['Boa recuperação: podes treinar normalmente.'] };
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

  const poorSleep = c.sleepQuality <= 2 || c.sleepHours < 6;
  const redFlags = redFlagsFor(c);
  const { status, statusReasons } = computeStatus(c, readiness, soreness, redFlags, poorSleep);

  return {
    status,
    statusReasons,
    readiness,
    poorSleep,
    highFatigue: c.fatigue >= 4,
    highSoreness: soreness >= 7,
    playsToday: c.playingToday !== 'none',
    highStakes: c.playingToday === 'tournament',
    playedPadelYesterday: Boolean(activity?.padel),
    intenseYesterday: c.yesterday.type !== 'none' && c.yesterday.rpe >= 7,
    yesterdayCats: activity?.cats ?? [],
    injuries: c.injuries,
    muscularZones: c.muscularZones,
    redFlags,
  };
}

export const STATUS_LABEL: Record<Status, string> = {
  green: 'Treinar normalmente',
  yellow: 'Treinar com moderação',
  red: 'Recuperação e cuidado',
};

export const STATUS_DOT: Record<Status, string> = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
};
