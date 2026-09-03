/**
 * Estado da aplicação, guardado em localStorage.
 *
 * A chave de armazenamento nunca mudou desde a primeira versão. O formato sim,
 * e por isso `AppData` tem um número de versão: ao carregar, dados antigos são
 * convertidos por `migrate.ts` antes de chegarem à app.
 *
 * Atenção: os dados vivem só no browser deste dispositivo. Não há servidor nem
 * base de dados — mudar de telemóvel ou limpar os dados do browser apaga tudo.
 * As Definições têm exportação/importação manual para contornar isso.
 */

import { useEffect, useState } from 'react';

import { DEFAULT_PROFILE, type Profile } from '../data/profile';
import type { Checkin } from '../engine/checkin';
import type { Plan } from '../engine/planner';
import type { Session } from '../engine/session';
import { migrateCheckin, migrateLog } from './migrate';

export interface Log {
  date: string;
  didTrain: boolean;
  didPlayPadel: boolean;
  padelHours: number;
  /** Escalas de 1 a 5, como no check-in. */
  fatigue: number;
  sleep: number;
  energy: number;
  /** Quantas zonas com dor a sério nesse dia. */
  pain: number;
}

/**
 * Versão do formato dos dados guardados.
 * 1 — original: escalas de 1 a 10, zonas de dor com dois estados
 * 2 — check-in completo: escalas de 1 a 5, lesões detalhadas, sono em horas
 * 3 — planos passam a ter o estado do dia (semáforo)
 */
export const DATA_VERSION = 3;

export interface AppData {
  version: number;
  profile: Profile;
  checkins: Record<string, Checkin>;
  plans: Record<string, Plan>;
  logs: Record<string, Log>;
  goals: string[];
  exerciseLastUsed: Record<string, string>;
  /** Treino a decorrer, para sobreviver a fechar a app a meio. */
  session: Session | null;
}

const STORAGE_KEY = 'padel-coach-ai-data';

export const DEFAULT_DATA: AppData = {
  version: DATA_VERSION,
  profile: DEFAULT_PROFILE,
  checkins: {},
  plans: {},
  logs: {},
  goals: ['injuryPrevention'],
  exerciseLastUsed: {},
  session: null,
};

/**
 * Converte dados gravados por uma versão anterior, um degrau de cada vez.
 *
 * Aplicar cada passo só a quem vem de antes dele é o que impede conversões
 * repetidas — correr a conversão das escalas duas vezes sobre os mesmos dados
 * dividiria os valores a dobrar e estragava o histórico em silêncio.
 *
 * Os planos são descartados em vez de convertidos: são derivados do check-in e
 * voltam a ser gerados ao abrir o dia, por isso convertê-los não compensa.
 */
export function migrate(raw: AppData): AppData {
  if (raw.version >= DATA_VERSION) return raw;

  let data = raw;

  if (data.version < 2) {
    const checkins: Record<string, Checkin> = {};
    for (const [key, checkin] of Object.entries(data.checkins ?? {})) {
      checkins[key] = migrateCheckin(checkin as never);
    }
    const logs: Record<string, Log> = {};
    for (const [key, log] of Object.entries(data.logs ?? {})) {
      logs[key] = migrateLog(log);
    }
    data = { ...data, version: 2, checkins, logs };
  }

  if (data.version < 3) {
    // Os planos da versão 2 não têm o estado do dia. Regenerar é trivial.
    data = { ...data, version: 3, plans: {} };
  }

  return { ...data, version: DATA_VERSION };
}

function readFromStorage(): { data: AppData; migrated: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: structuredClone(DEFAULT_DATA), migrated: false };
    const parsed = JSON.parse(raw);
    // A versão tem de sair do que estava gravado, não dos valores por omissão:
    // dados da primeira versão não têm campo `version` e ficariam por migrar.
    const version = parsed.version ?? 1;
    const stored: AppData = {
      ...structuredClone(DEFAULT_DATA),
      ...parsed,
      version,
      // O spread é raso: um perfil gravado por uma versão anterior pode não ter
      // todos os campos, e sem isto ficariam a undefined.
      profile: { ...DEFAULT_PROFILE, ...(parsed.profile ?? {}) },
    };
    return { data: migrate(stored), migrated: version !== DATA_VERSION };
  } catch {
    // Primeira utilização, ou localStorage indisponível neste contexto.
  }
  return { data: structuredClone(DEFAULT_DATA), migrated: false };
}

const initial = readFromStorage();
let DATA: AppData = initial.data;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

/** Substitui o estado inteiro e persiste. Devolve false se não conseguiu gravar. */
export function saveData(next: AppData): boolean {
  DATA = next;
  let ok = true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
  } catch {
    ok = false;
  }
  notify();
  return ok;
}

// Dados convertidos de um formato antigo são gravados já, senão a conversão
// repetia-se a cada arranque e o que ficava em disco continuava a ser o antigo.
if (initial.migrated) saveData(DATA);

/** Aplica uma alteração sobre o estado actual. */
export function updateData(mutate: (draft: AppData) => void): boolean {
  const next = structuredClone(DATA);
  mutate(next);
  return saveData(next);
}

export function getData(): AppData {
  return DATA;
}

export function useStore(): AppData {
  const [state, setState] = useState(DATA);
  useEffect(() => {
    const listener = () => setState(DATA);
    listeners.add(listener);
    listener();
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return state;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Data local no formato AAAA-MM-DD.
 *
 * Usamos os componentes locais em vez de toISOString(), que converte para UTC:
 * a versão anterior fazia isso e, no horário de verão em Portugal (UTC+1),
 * gravava sempre o dia anterior — a 03/09 a chave saía "2026-09-02".
 */
function localDateKey(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export function todayKey(): string {
  return localDateKey(new Date());
}

export function dateKey(d: Date | string | number): string {
  // Uma chave que já vem no formato certo passa tal e qual. Se a convertêssemos
  // para Date, o JavaScript lê-a como meia-noite UTC e em fusos negativos ela
  // voltaria a recuar um dia.
  if (typeof d === 'string' && ISO_DATE.test(d)) return d;
  return localDateKey(new Date(d));
}

/** Converte uma chave AAAA-MM-DD numa data local, sem passar por UTC. */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
