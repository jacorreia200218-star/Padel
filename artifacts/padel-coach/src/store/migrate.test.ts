/**
 * Testes à conversão de dados guardados.
 *
 * É o código mais perigoso da app: corre uma vez, sobre dados que não se podem
 * recuperar, e uma conversão errada estraga o histórico em silêncio. O caso que
 * mais interessa é o de correr duas vezes sobre os mesmos dados — foi assim que
 * a primeira versão desta função dividia os valores a dobrar.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { migrateCheckin, migrateLog } from './migrate';
import { DATA_VERSION, DEFAULT_DATA, migrate, type AppData } from './useStore';

/** Dados tal como a primeira versão da app os gravava. */
const V1 = {
  checkins: {
    '2026-08-30': {
      date: '2026-08-30',
      playingToday: 'casual',
      hours: '2',
      playedYesterday: 'intense',
      yesterdayTraining: 'strength',
      energy: 8,
      soreness: 6,
      fatigue: 4,
      sleep: 7,
      painZones: { elbow: 'dor', calves: 'muscular' },
      time: 45,
      equipment: ['bands', 'bodyweight'],
    },
  },
  plans: { '2026-08-30': { date: '2026-08-30', planType: 'Reabilitação', completed: true } },
  logs: {
    '2026-08-30': {
      date: '2026-08-30',
      didTrain: true,
      didPlayPadel: true,
      padelHours: 2,
      fatigue: 4,
      pain: 1,
      sleep: 7,
      energy: 8,
    },
  },
  goals: ['strength', 'injuryPrevention'],
  exerciseLastUsed: { reab_cotovelo: '2026-08-30' },
};

const comoV1 = () =>
  ({ ...structuredClone(DEFAULT_DATA), ...structuredClone(V1), version: 1 }) as unknown as AppData;

describe('conversão de um check-in da primeira versão', () => {
  const c = migrateCheckin(structuredClone(V1.checkins['2026-08-30']) as never);

  it('converte as escalas de 1-10 para 1-5', () => {
    assert.equal(c.energy, 4);
    assert.equal(c.fatigue, 2);
    assert.equal(c.sleepQuality, 4);
  });

  it('separa dor de cansaço muscular', () => {
    assert.deepEqual(c.injuries.map((i) => i.zone), ['elbow']);
    assert.deepEqual(c.muscularZones, ['calves']);
  });

  it('não inventa uma dor mais grave nem mais ligeira do que a registada', () => {
    // A versão antiga não guardava intensidade. 5 é o meio da escala: não
    // desvaloriza a dor nem dispara sozinho os avisos de procurar ajuda.
    assert.equal(c.injuries[0].intensity, 5);
  });

  it('junta os dois campos antigos sobre ontem num só', () => {
    assert.equal(c.yesterday.type, 'padelMatch');
    assert.ok(c.yesterday.rpe >= 7, 'jogo intenso devia ficar com esforço alto');
  });

  it('mantém o que já existia', () => {
    assert.equal(c.time, 45);
    assert.deepEqual(c.equipment, ['bands', 'bodyweight']);
    assert.equal(c.hours, '2');
  });

  it('nunca deixa campos por preencher', () => {
    for (const [campo, valor] of Object.entries(c)) {
      assert.notEqual(valor, undefined, `campo "${campo}" ficou por preencher`);
    }
  });
});

describe('migrate', () => {
  it('leva dados da primeira versão até à actual', () => {
    const d = migrate(comoV1());
    assert.equal(d.version, DATA_VERSION);
    assert.equal(d.checkins['2026-08-30'].version, 2);
  });

  it('preserva objetivos e histórico de exercícios usados', () => {
    const d = migrate(comoV1());
    assert.deepEqual(d.goals, ['strength', 'injuryPrevention']);
    assert.deepEqual(d.exerciseLastUsed, { reab_cotovelo: '2026-08-30' });
  });

  it('converte também os registos do histórico', () => {
    const d = migrate(comoV1());
    const log = d.logs['2026-08-30'];
    assert.equal(log.energy, 4);
    assert.equal(log.sleep, 4);
    assert.equal(log.fatigue, 2);
    assert.equal(log.padelHours, 2, 'as horas de padel não são uma escala e não deviam mudar');
  });

  it('descarta os planos, que voltam a ser gerados', () => {
    assert.deepEqual(migrate(comoV1()).plans, {});
  });

  it('preenche os campos novos do histórico sem inventar nada', () => {
    const log = migrate(comoV1()).logs['2026-08-30'];
    // Um dia antigo não tinha estado do dia nem tipo de plano registados.
    // Ficam vazios de propósito, para o histórico não afirmar o que não sabe.
    assert.equal(log.planType, '');
    assert.equal(log.duration, 0);
    assert.equal(log.exercisesDone, 0);
    assert.equal(log.painMax, 0);
    assert.equal(log.sleepHours, 0);
  });

  it('correr duas vezes dá o mesmo que correr uma', () => {
    const uma = migrate(comoV1());
    const duas = migrate(structuredClone(uma));
    assert.deepEqual(duas, uma);
  });

  it('não mexe em dados que já estão na versão actual', () => {
    const actual = { ...structuredClone(DEFAULT_DATA), goals: ['speed'] };
    assert.deepEqual(migrate(actual), actual);
  });

  it('aguenta dados vazios sem rebentar', () => {
    const vazio = { ...structuredClone(DEFAULT_DATA), version: 1 };
    const d = migrate(vazio);
    assert.equal(d.version, DATA_VERSION);
  });
});

describe('conversão de um registo do histórico', () => {
  it('converte as escalas mas não as horas', () => {
    const log = migrateLog(structuredClone(V1.logs['2026-08-30']));
    assert.equal(log.energy, 4);
    assert.equal(log.padelHours, 2);
    assert.equal(log.pain, 1, 'a contagem de zonas com dor não é uma escala');
  });
});
