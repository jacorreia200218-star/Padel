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

/**
 * BUG CONHECIDO (herdado da versão anterior, mantido de propósito nesta fase):
 * pôr a hora local a 00:00 e depois converter para ISO devolve a data em UTC.
 * Em Portugal no horário de verão (UTC+1) isso dá o dia anterior — a 03/09
 * a chave gerada é "2026-09-02".
 *
 * Como todas as chaves (check-ins, planos, logs e o calendário) sofrem o mesmo
 * desvio, a app é internamente coerente e o utilizador não nota. Mas as datas
 * guardadas estão erradas, e o desvio muda quando acaba o horário de verão.
 *
 * Corrigir implica migrar os dados já guardados, por isso fica para uma fase
 * própria — não para a migração para React, que não deve alterar comportamento.
 */
export function todayKey(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function dateKey(d: Date | string | number): string {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}
