/**
 * Estado da aplicação, guardado em localStorage.
 *
 * A chave e o formato são exactamente os da versão anterior, para que quem já
 * usava a app não perca o histórico ao passar para esta versão.
 *
 * Atenção: os dados vivem só no browser deste dispositivo. Não há servidor nem
 * base de dados — mudar de telemóvel ou limpar os dados do browser apaga tudo.
 * As Definições têm exportação/importação manual para contornar isso.
 */

import { useEffect, useState } from 'react';

import type { Checkin, Plan } from '../engine/planner';

export interface Log {
  date: string;
  didTrain: boolean;
  didPlayPadel: boolean;
  padelHours: number;
  fatigue: number;
  pain: number;
  sleep: number;
  energy: number;
}

export interface AppData {
  checkins: Record<string, Checkin>;
  plans: Record<string, Plan>;
  logs: Record<string, Log>;
  goals: string[];
  exerciseLastUsed: Record<string, string>;
}

const STORAGE_KEY = 'padel-coach-ai-data';

export const DEFAULT_DATA: AppData = {
  checkins: {},
  plans: {},
  logs: {},
  goals: ['injuryPrevention'],
  exerciseLastUsed: {},
};

function readFromStorage(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...structuredClone(DEFAULT_DATA), ...JSON.parse(raw) };
  } catch {
    // Primeira utilização, ou localStorage indisponível neste contexto.
  }
  return structuredClone(DEFAULT_DATA);
}

let DATA: AppData = readFromStorage();

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
