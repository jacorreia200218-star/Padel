/** Testes à progressão gradual. */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { exerciseById } from '../data/exercises';
import {
  MAX_LEVEL,
  SESSIONS_PER_LEVEL,
  applyProgression,
  levelOf,
  recordSession,
  type ExerciseProgress,
} from './progression';

const AGACHAMENTO = exerciseById('for_agachamento')!;
const semDescanso = exerciseById('rec_caminhada')!;

const vazio = (): Record<string, ExerciseProgress> => ({});

/** Conclui o mesmo exercício n vezes seguidas. */
function concluir(n: number, id = 'for_agachamento') {
  let progress = vazio();
  const subidas: string[][] = [];
  for (let i = 0; i < n; i++) {
    const r = recordSession(progress, { done: [id], skipped: [], painful: [] });
    progress = r.progress;
    subidas.push(r.leveledUp);
  }
  return { progress, subidas };
}

describe('aplicar progressão', () => {
  it('o nível 0 não muda nada', () => {
    assert.deepEqual(applyProgression(AGACHAMENTO, 0), AGACHAMENTO);
  });

  it('o primeiro degrau acrescenta uma série e mais nada', () => {
    const e = applyProgression(AGACHAMENTO, 1);
    assert.equal(e.sets, AGACHAMENTO.sets + 1);
    assert.equal(e.rest, AGACHAMENTO.rest, 'o descanso não devia mudar no primeiro degrau');
    assert.equal(e.reps, AGACHAMENTO.reps);
  });

  it('o segundo degrau tira descanso, mantendo as séries', () => {
    const um = applyProgression(AGACHAMENTO, 1);
    const dois = applyProgression(AGACHAMENTO, 2);
    assert.equal(dois.sets, um.sets, 'só uma coisa deve mudar de cada vez');
    assert.ok(dois.rest < um.rest);
  });

  it('a duração acompanha as séries, para a estimativa não mentir', () => {
    const e = applyProgression(AGACHAMENTO, 3);
    assert.ok(e.duration > AGACHAMENTO.duration);
  });

  it('nunca desce o descanso abaixo do razoável', () => {
    for (let level = 0; level <= MAX_LEVEL; level++) {
      const e = applyProgression(AGACHAMENTO, level);
      assert.ok(e.rest >= 15, `descanso de ${e.rest}s no nível ${level}`);
    }
  });

  it('um exercício sem descanso continua sem descanso', () => {
    assert.equal(applyProgression(semDescanso, MAX_LEVEL).rest, 0);
  });

  it('acima do último degrau não continua a subir', () => {
    const topo = applyProgression(AGACHAMENTO, MAX_LEVEL);
    assert.deepEqual(applyProgression(AGACHAMENTO, MAX_LEVEL + 5), topo);
  });

  it('um nível negativo é tratado como zero', () => {
    assert.deepEqual(applyProgression(AGACHAMENTO, -1), AGACHAMENTO);
  });
});

describe('registar o treino', () => {
  it('sobe de nível ao fim das sessões definidas, não antes', () => {
    const antes = concluir(SESSIONS_PER_LEVEL - 1);
    assert.equal(levelOf(antes.progress, 'for_agachamento'), 0);
    assert.deepEqual(antes.subidas.flat(), []);

    const depois = concluir(SESSIONS_PER_LEVEL);
    assert.equal(levelOf(depois.progress, 'for_agachamento'), 1);
    assert.deepEqual(depois.subidas.flat(), ['for_agachamento']);
  });

  it('não passa do último degrau, por muitas sessões que sejam', () => {
    const { progress } = concluir(SESSIONS_PER_LEVEL * (MAX_LEVEL + 5));
    assert.equal(levelOf(progress, 'for_agachamento'), MAX_LEVEL);
  });

  it('dor faz recuar um degrau', () => {
    const { progress } = concluir(SESSIONS_PER_LEVEL * 2);
    assert.equal(levelOf(progress, 'for_agachamento'), 2);

    const depois = recordSession(progress, {
      done: [],
      skipped: [],
      painful: ['for_agachamento'],
    });
    assert.equal(levelOf(depois.progress, 'for_agachamento'), 1);
  });

  it('dor no nível zero não faz descer abaixo de zero', () => {
    const r = recordSession(vazio(), { done: [], skipped: [], painful: ['for_agachamento'] });
    assert.equal(levelOf(r.progress, 'for_agachamento'), 0);
  });

  it('saltar não penaliza, só não avança', () => {
    const { progress } = concluir(SESSIONS_PER_LEVEL - 1);
    const r = recordSession(progress, { done: [], skipped: ['for_agachamento'], painful: [] });
    assert.equal(levelOf(r.progress, 'for_agachamento'), 0);
    assert.equal(r.progress['for_agachamento'].completed, 0, 'devia ter reposto a contagem');
  });

  it('não mexe no estado que recebe', () => {
    const original = vazio();
    recordSession(original, { done: ['for_agachamento'], skipped: [], painful: [] });
    assert.deepEqual(original, {}, 'recordSession alterou o objeto original');
  });

  it('cada exercício progride por si', () => {
    let progress = vazio();
    for (let i = 0; i < SESSIONS_PER_LEVEL; i++) {
      progress = recordSession(progress, {
        done: ['for_agachamento'],
        skipped: [],
        painful: [],
      }).progress;
    }
    assert.equal(levelOf(progress, 'for_agachamento'), 1);
    assert.equal(levelOf(progress, 'core_prancha'), 0);
  });

  it('um exercício desconhecido começa no nível zero', () => {
    assert.equal(levelOf(vazio(), 'nao_existe'), 0);
  });
});
