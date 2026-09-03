/**
 * Testes ao motor de decisão.
 *
 * O que aqui interessa não são casos bonitos: são as garantias que a app dá a
 * quem a usa. A mais importante é que num dia mau nunca sai um treino pesado —
 * e essa é testada contra centenas de check-ins gerados ao acaso, porque é
 * exactamente o tipo de coisa que uma combinação improvável de respostas parte.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { AGGRESSIVE_CATS, PAIN_ZONES, exerciseById } from '../data/exercises';
import { emptyCheckin, type Checkin, type Injury } from './checkin';
import { generatePlan } from './planner';

const TODAY = '2026-09-03';

function checkin(overrides: Partial<Checkin> = {}): Checkin {
  return { ...emptyCheckin(TODAY), ...overrides };
}

function injury(overrides: Partial<Injury> = {}): Injury {
  return {
    zone: 'elbow',
    intensity: 5,
    onset: 'days',
    when: 'movement',
    trigger: '',
    trend: 'same',
    ...overrides,
  };
}

const catsOf = (plan: { exerciseIds: string[] }) =>
  plan.exerciseIds.flatMap((id) => exerciseById(id)?.cats ?? []);

describe('generatePlan — garantias que valem sempre', () => {
  /**
   * Percorremos o espaço de respostas possíveis em vez de escolher três casos
   * à mão. São estas combinações improváveis que, na versão anterior, deixavam
   * escapar um treino de força num dia em que o corpo estava em baixo.
   */
  const todosOsCheckins = function* () {
    for (const energy of [1, 3, 5]) {
      for (const fatigue of [1, 3, 5]) {
        for (const sleepQuality of [1, 3, 5]) {
          for (const soreness of ['none', 'light', 'strong'] as const) {
            for (const playingToday of ['none', 'casual', 'tournament']) {
              for (const injuries of [[], [injury({ intensity: 3 })], [injury({ intensity: 8 })]]) {
                yield checkin({ energy, fatigue, sleepQuality, soreness, playingToday, injuries });
              }
            }
          }
        }
      }
    }
  };

  it('um dia vermelho nunca produz carga agressiva', () => {
    let vermelhos = 0;
    for (const c of todosOsCheckins()) {
      const plan = generatePlan(c, ['strength', 'explosiveness'], {});
      if (plan.status !== 'red') continue;
      vermelhos++;
      const agressivas = catsOf(plan).filter((cat) => AGGRESSIVE_CATS.has(cat));
      assert.deepEqual(
        agressivas,
        [],
        `dia vermelho devolveu ${agressivas.join(', ')} — check-in: ${JSON.stringify(c)}`,
      );
    }
    assert.ok(vermelhos > 0, 'o varrimento não chegou a produzir dias vermelhos');
  });

  it('um dia amarelo nunca produz saltos, sprints nem explosão', () => {
    const proibidas = ['explosiveness', 'jumps', 'speed'];
    let amarelos = 0;
    for (const c of todosOsCheckins()) {
      const plan = generatePlan(c, ['explosiveness', 'speed'], {});
      if (plan.status !== 'yellow') continue;
      amarelos++;
      const encontradas = catsOf(plan).filter((cat) => proibidas.includes(cat));
      assert.deepEqual(
        encontradas,
        [],
        `dia amarelo devolveu ${encontradas.join(', ')} — check-in: ${JSON.stringify(c)}`,
      );
    }
    assert.ok(amarelos > 0, 'o varrimento não chegou a produzir dias amarelos');
  });

  it('nunca devolve um plano vazio', () => {
    for (const c of todosOsCheckins()) {
      const plan = generatePlan(c, [], {});
      assert.ok(plan.exerciseIds.length > 0, `plano vazio para ${JSON.stringify(c)}`);
    }
  });

  it('nunca sugere exercícios que exijam material que a pessoa não tem', () => {
    for (const c of todosOsCheckins()) {
      const semMaterial = { ...c, equipment: ['bodyweight'] };
      const plan = generatePlan(semMaterial, [], {});
      for (const id of plan.exerciseIds) {
        const e = exerciseById(id)!;
        assert.ok(
          e.equip.every((eq) => eq === 'bodyweight'),
          `${e.name} exige ${e.equip.join('/')} mas só há peso corporal`,
        );
      }
    }
  });

  it('sempre explica a decisão', () => {
    for (const c of todosOsCheckins()) {
      const plan = generatePlan(c, [], {});
      assert.ok(plan.statusReasons.length > 0, 'estado sem razão apresentada');
    }
  });
});

describe('generatePlan — decisões concretas', () => {
  it('um dia bom sem jogo dá força e potência', () => {
    const plan = generatePlan(
      checkin({ energy: 5, fatigue: 1, sleepQuality: 5, sleepHours: 8 }),
      [],
      {},
    );
    assert.equal(plan.status, 'green');
    assert.equal(plan.planType, 'Força e Potência');
  });

  it('torneio hoje nunca traz carga nova, mesmo com o corpo em forma', () => {
    const plan = generatePlan(
      checkin({ energy: 5, fatigue: 1, sleepQuality: 5, playingToday: 'tournament' }),
      ['strength'],
      {},
    );
    assert.equal(plan.planType, 'Ativação Pré-Jogo');
    const agressivas = catsOf(plan).filter((c) => AGGRESSIVE_CATS.has(c));
    assert.deepEqual(agressivas, []);
  });

  it('sinais de alerta transformam o plano em cuidado, não em treino', () => {
    const plan = generatePlan(checkin({ injuries: [injury({ intensity: 9 })] }), [], {});
    assert.equal(plan.status, 'red');
    assert.equal(plan.planType, 'Cuidado');
    assert.ok(plan.redFlags.length > 0);
  });

  /**
   * Vale para todas as zonas e só com peso corporal, que é o caso mais apertado.
   * A primeira versão deste teste falhou e tinha razão: as três variantes de
   * reabilitação do cotovelo exigiam material, e quem não o tivesse ficava sem
   * nada específico para a zona que lhe doía.
   */
  it('dor numa zona traz sempre exercícios dessa zona, mesmo sem material', () => {
    for (const zona of PAIN_ZONES) {
      const plan = generatePlan(
        checkin({ injuries: [injury({ zone: zona.id })], equipment: ['bodyweight'] }),
        [],
        {},
      );
      const temDaZona = plan.exerciseIds
        .map((id) => exerciseById(id)!)
        .some((e) => e.cats.includes(zona.rehab));
      assert.ok(temDaZona, `dor em "${zona.label}" não trouxe nada para a zona`);
    }
  });

  it('treino de força ontem faz variar o estímulo hoje', () => {
    const plan = generatePlan(
      checkin({
        energy: 5,
        fatigue: 1,
        sleepQuality: 5,
        yesterday: { type: 'strength', minutes: 60, rpe: 5 },
      }),
      [],
      {},
    );
    assert.ok(!catsOf(plan).includes('strength'), 'repetiu força no dia seguinte a força');
  });

  it('menos tempo disponível dá menos exercícios', () => {
    const bom = { energy: 5, fatigue: 1, sleepQuality: 5 };
    const curto = generatePlan(checkin({ ...bom, time: 10 }), [], {});
    const longo = generatePlan(checkin({ ...bom, time: 60 }), [], {});
    assert.ok(
      curto.exerciseIds.length < longo.exerciseIds.length,
      `10 min deu ${curto.exerciseIds.length} exercícios e 60 min deu ${longo.exerciseIds.length}`,
    );
  });

  it('evita repetir os exercícios que saíram ontem', () => {
    const c = checkin({ energy: 5, fatigue: 1, sleepQuality: 5, time: 20 });
    const ontem = generatePlan(c, [], {});
    const usados = Object.fromEntries(ontem.exerciseIds.map((id) => [id, '2026-09-02']));
    const hoje = generatePlan(c, [], usados);
    const repetidos = hoje.exerciseIds.filter((id) => ontem.exerciseIds.includes(id));
    assert.ok(
      repetidos.length < hoje.exerciseIds.length,
      'o plano de hoje repetiu exactamente o de ontem',
    );
  });
});
