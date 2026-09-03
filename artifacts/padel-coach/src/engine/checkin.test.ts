/** Testes ao estado do dia e à triagem de dor. */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  deriveSignals,
  emptyCheckin,
  redFlagsFor,
  type Checkin,
  type Injury,
} from './checkin';

const TODAY = '2026-09-03';

function checkin(overrides: Partial<Checkin> = {}): Checkin {
  return { ...emptyCheckin(TODAY), ...overrides };
}

function injury(overrides: Partial<Injury> = {}): Injury {
  return {
    zone: 'shoulder',
    intensity: 3,
    onset: 'days',
    when: 'movement',
    trigger: '',
    trend: 'same',
    ...overrides,
  };
}

describe('sinais de alerta', () => {
  it('dor de 7 ou mais dispara', () => {
    assert.ok(redFlagsFor(checkin({ injuries: [injury({ intensity: 7 })] })).length > 0);
  });

  it('dor moderada em repouso dispara', () => {
    const flags = redFlagsFor(checkin({ injuries: [injury({ intensity: 5, when: 'rest' })] }));
    assert.ok(flags.some((f) => f.includes('repouso')));
  });

  it('dor ligeira em repouso não dispara', () => {
    assert.deepEqual(redFlagsFor(checkin({ injuries: [injury({ intensity: 3, when: 'rest' })] })), []);
  });

  it('dor de semanas a piorar dispara', () => {
    const flags = redFlagsFor(
      checkin({ injuries: [injury({ intensity: 3, onset: 'weeks', trend: 'worse' })] }),
    );
    assert.ok(flags.some((f) => f.includes('semanas')));
  });

  it('dor de semanas a melhorar não dispara', () => {
    assert.deepEqual(
      redFlagsFor(checkin({ injuries: [injury({ intensity: 3, onset: 'weeks', trend: 'better' })] })),
      [],
    );
  });

  it('sem dor não há sinais', () => {
    assert.deepEqual(redFlagsFor(checkin()), []);
  });

  it('não repete o mesmo aviso duas vezes com duas dores iguais', () => {
    const flags = redFlagsFor(
      checkin({
        injuries: [injury({ intensity: 8 }), injury({ zone: 'knee', intensity: 9 })],
      }),
    );
    assert.equal(new Set(flags).size, flags.length);
  });
});

describe('estado do dia', () => {
  const estado = (c: Checkin) => deriveSignals(c).status;

  it('tudo bem dá verde', () => {
    assert.equal(estado(checkin({ energy: 5, fatigue: 1, sleepQuality: 5, sleepHours: 8 })), 'green');
  });

  it('cansaço elevado dá amarelo', () => {
    assert.equal(estado(checkin({ energy: 4, fatigue: 4, sleepQuality: 4, sleepHours: 8 })), 'yellow');
  });

  it('dormir mal dá amarelo', () => {
    assert.equal(estado(checkin({ energy: 5, fatigue: 1, sleepQuality: 5, sleepHours: 4 })), 'yellow');
  });

  it('energia no fundo com cansaço alto dá vermelho', () => {
    assert.equal(estado(checkin({ energy: 1, fatigue: 5 })), 'red');
  });

  it('dor localizada de 5 ou mais dá vermelho', () => {
    assert.equal(estado(checkin({ energy: 5, fatigue: 1, injuries: [injury({ intensity: 5 })] })), 'red');
  });

  it('dor localizada ligeira dá amarelo, não vermelho', () => {
    assert.equal(
      estado(checkin({ energy: 5, fatigue: 1, sleepQuality: 5, injuries: [injury({ intensity: 2 })] })),
      'yellow',
    );
  });

  it('dores musculares fortes dão vermelho', () => {
    assert.equal(estado(checkin({ soreness: 'strong', sorenessIntensity: 9 })), 'red');
  });
});

describe('prontidão', () => {
  it('o melhor dia possível dá 10', () => {
    const s = deriveSignals(checkin({ energy: 5, fatigue: 1, sleepQuality: 5, soreness: 'none' }));
    assert.equal(s.readiness, 10);
  });

  it('o pior dia possível dá 0', () => {
    const s = deriveSignals(
      checkin({ energy: 1, fatigue: 5, sleepQuality: 1, soreness: 'strong', sorenessIntensity: 10 }),
    );
    assert.equal(s.readiness, 0);
  });

  it('nunca sai fora de 0 a 10', () => {
    for (const energy of [1, 2, 3, 4, 5]) {
      for (const fatigue of [1, 3, 5]) {
        for (const sorenessIntensity of [0, 5, 10]) {
          const s = deriveSignals(
            checkin({ energy, fatigue, soreness: sorenessIntensity ? 'moderate' : 'none', sorenessIntensity }),
          );
          assert.ok(s.readiness >= 0 && s.readiness <= 10, `prontidão fora de escala: ${s.readiness}`);
        }
      }
    }
  });
});

describe('atividade de ontem', () => {
  it('jogo de padel conta como padel', () => {
    const s = deriveSignals(checkin({ yesterday: { type: 'padelMatch', minutes: 90, rpe: 6 } }));
    assert.equal(s.playedPadelYesterday, true);
  });

  it('esforço de 7 ou mais conta como intenso', () => {
    const s = deriveSignals(checkin({ yesterday: { type: 'run', minutes: 30, rpe: 7 } }));
    assert.equal(s.intenseYesterday, true);
  });

  it('não ter feito nada nunca conta como intenso', () => {
    const s = deriveSignals(checkin({ yesterday: { type: 'none', minutes: 0, rpe: 10 } }));
    assert.equal(s.intenseYesterday, false);
  });
});
