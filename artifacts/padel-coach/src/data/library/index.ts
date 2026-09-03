/**
 * A biblioteca de exercícios, junta a partir dos ficheiros por família.
 *
 * Cada exercício tem um id estável: planos antigos e `exerciseLastUsed`
 * guardam ids, por isso um id nunca deve ser reaproveitado com outro
 * significado — acrescenta-se um novo.
 */

import type { Exercise } from '../types';
import { CORE } from './core';
import { MOBILITY } from './mobility';
import { POWER } from './power';
import { PREVENTION } from './prevention';
import { RECOVERY } from './recovery';
import { STRENGTH } from './strength';

export const EXERCISES: Exercise[] = [
  ...MOBILITY,
  ...STRENGTH,
  ...CORE,
  ...POWER,
  ...PREVENTION,
  ...RECOVERY,
];
