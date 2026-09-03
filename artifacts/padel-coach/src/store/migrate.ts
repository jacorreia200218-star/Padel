/**
 * Migração dos dados guardados entre versões do formato.
 *
 * Corre uma vez, ao carregar. Quem usava a versão anterior mantém o histórico:
 * as escalas antigas de 1 a 10 são convertidas para as de 1 a 5, e as zonas
 * marcadas como "dor" passam a lesões com os campos novos preenchidos com os
 * valores mais conservadores possíveis — nunca inventamos uma dor mais grave
 * nem mais ligeira do que a que foi registada.
 */

import type { Checkin, Injury, SorenessLevel } from '../engine/checkin';
import type { Log } from './useStore';

/** Formato antigo do check-in, tal como ficou gravado em localStorage. */
interface CheckinV1 {
  date: string;
  playingToday: string;
  hours?: string;
  playedYesterday?: string;
  yesterdayTraining?: string;
  energy: number; // 1-10
  soreness: number; // 1-10
  fatigue: number; // 1-10
  sleep: number; // 1-10, qualidade
  painZones?: Record<string, 'muscular' | 'dor'>;
  time: number;
  equipment: string[];
}

/** 1-10 para 1-5, sem nunca sair dos limites. */
function toFive(value: number): number {
  return Math.min(5, Math.max(1, Math.round(value / 2)));
}

function sorenessLevel(value: number): SorenessLevel {
  if (value <= 2) return 'none';
  if (value <= 4) return 'light';
  if (value <= 7) return 'moderate';
  return 'strong';
}

/**
 * A versão antiga registava a atividade de ontem em dois campos separados:
 * se jogou padel (e com que intensidade) e que treino fez além disso.
 */
function yesterdayFrom(old: CheckinV1): Checkin['yesterday'] {
  const played = old.playedYesterday ?? 'none';
  const training = old.yesterdayTraining ?? 'none';

  const type =
    played !== 'none'
      ? 'padelMatch'
      : training === 'strength'
        ? 'strength'
        : training === 'cardio'
          ? 'run'
          : training === 'mobility'
            ? 'mobility'
            : 'none';

  if (type === 'none') return { type: 'none', minutes: 0, rpe: 5 };
  return { type, minutes: 60, rpe: played === 'intense' ? 8 : 5 };
}

function injuriesFrom(old: CheckinV1): Injury[] {
  return Object.entries(old.painZones ?? {})
    .filter(([, state]) => state === 'dor')
    .map(([zone]) => ({
      zone,
      // A versão antiga não registava intensidade. 5 é o meio da escala: nem
      // desvaloriza a dor, nem dispara os avisos de procurar um profissional.
      intensity: 5,
      onset: 'days' as const,
      when: 'movement' as const,
      trigger: '',
      trend: 'same' as const,
    }));
}

export function migrateCheckin(old: CheckinV1): Checkin {
  return {
    version: 2,
    date: old.date,
    playingToday: old.playingToday ?? 'none',
    hours: old.hours ?? '1.5',
    time: old.time ?? 30,
    equipment: old.equipment?.length ? old.equipment : ['bodyweight'],
    // O sono em horas nunca foi perguntado. 7h é o valor por omissão do
    // formulário — assumimos o normal, não um extremo.
    sleepHours: 7,
    sleepQuality: toFive(old.sleep ?? 6),
    energy: toFive(old.energy ?? 5),
    fatigue: toFive(old.fatigue ?? 4),
    soreness: sorenessLevel(old.soreness ?? 0),
    sorenessIntensity: old.soreness ?? 0,
    muscularZones: Object.entries(old.painZones ?? {})
      .filter(([, state]) => state === 'muscular')
      .map(([zone]) => zone),
    injuries: injuriesFrom(old),
    yesterday: yesterdayFrom(old),
  };
}

/** Os registos do histórico guardavam energia, sono e cansaço de 1 a 10. */
export function migrateLog(old: Log & { scale?: number }): Log {
  return {
    ...old,
    energy: toFive(old.energy),
    sleep: toFive(old.sleep),
    fatigue: toFive(old.fatigue),
  };
}
