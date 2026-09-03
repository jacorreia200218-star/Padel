/** O perfil de quem usa a app. */

import type { Option } from './types';

export interface Profile {
  name: string;
  /** Vazio quando não foi preenchido — nunca inventamos um valor. */
  age: number | null;
  height: number | null;
  weight: number | null;
  level: string;
  padelFrequency: string;
  /** Dias em que costuma ter disponibilidade para treinar. */
  availableDays: string[];
  /** Minutos que costuma ter. Serve de valor inicial no check-in. */
  usualTime: number;
  /** Material que tem em casa. Também serve de valor inicial no check-in. */
  equipment: string[];
  /** Lesões ou queixas antigas relevantes, em texto livre. */
  injuryHistory: string;
}

export const DEFAULT_PROFILE: Profile = {
  name: '',
  age: null,
  height: null,
  weight: null,
  level: 'intermediate',
  padelFrequency: '2',
  availableDays: [],
  usualTime: 30,
  equipment: ['bodyweight'],
  injuryHistory: '',
};

export const PADEL_LEVELS: Option[] = [
  { id: 'beginner', label: 'Iniciado' },
  { id: 'intermediate', label: 'Intermédio' },
  { id: 'advanced', label: 'Avançado' },
  { id: 'competition', label: 'Competição' },
];

export const PADEL_FREQUENCY: Option[] = [
  { id: '1', label: '1x' },
  { id: '2', label: '2x' },
  { id: '3', label: '3x' },
  { id: '4', label: '4x+' },
];

export const WEEK_DAYS: Option[] = [
  { id: 'mon', label: 'Seg' },
  { id: 'tue', label: 'Ter' },
  { id: 'wed', label: 'Qua' },
  { id: 'thu', label: 'Qui' },
  { id: 'fri', label: 'Sex' },
  { id: 'sat', label: 'Sáb' },
  { id: 'sun', label: 'Dom' },
];
