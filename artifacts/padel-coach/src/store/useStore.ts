import { useState, useEffect } from 'react';
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
}

const STORAGE_KEY = 'padel-coach-ai-data';
const DEFAULT_DATA: AppData = { checkins: {}, plans: {}, logs: {}, goals: ["injuryPrevention"] };

// Create a simple event emitter to sync state across hooks
type Listener = () => void;
const listeners = new Set<Listener>();

let DATA: AppData = structuredClone(DEFAULT_DATA);

try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    DATA = JSON.parse(raw);
  }
} catch (e) {
  // Ignore
}

function notify() {
  listeners.forEach((l) => l());
}

export function saveData(newData: AppData) {
  DATA = newData;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
  } catch (e) {
    // Ignore error
  }
  notify();
}

export function useStore() {
  const [state, setState] = useState(DATA);

  useEffect(() => {
    const listener = () => setState(DATA);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    data: state,
    updateData: saveData,
  };
}

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
