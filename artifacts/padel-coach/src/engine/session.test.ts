/** Testes à sessão de treino e às trocas de exercício. */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { EXERCISES, exerciseById } from '../data/exercises';
import { currentExercise, findAlternative, isFinished, progress, startSession } from './session';

const byId = (id: string) => exerciseById(id)!;

describe('sessão', () => {
  it('começa no primeiro exercício', () => {
    const s = startSession('2026-09-03', ['mob_ombros', 'core_prancha']);
    assert.equal(currentExercise(s)?.id, 'mob_ombros');
    assert.equal(isFinished(s), false);
    assert.equal(progress(s), 0);
  });

  it('acaba quando passa do último', () => {
    const s = startSession('2026-09-03', ['mob_ombros', 'core_prancha']);
    assert.equal(isFinished({ ...s, index: 2 }), true);
    assert.equal(progress({ ...s, index: 2 }), 1);
  });

  it('guarda uma cópia da lista, para trocas não mexerem no plano', () => {
    const original = ['mob_ombros', 'core_prancha'];
    const s = startSession('2026-09-03', original);
    s.exerciseIds[0] = 'outro';
    assert.equal(original[0], 'mob_ombros');
  });

  it('aguenta um plano vazio sem rebentar', () => {
    const s = startSession('2026-09-03', []);
    assert.equal(isFinished(s), true);
    assert.equal(progress(s), 0);
  });
});

describe('encontrar alternativa', () => {
  it('prefere as alternativas escritas à mão', () => {
    const agachamento = byId('for_agachamento');
    const alt = findAlternative(agachamento, ['bodyweight'], []);
    assert.ok(agachamento.alts!.includes(alt!.id), `escolheu ${alt!.id}, fora das declaradas`);
  });

  it('nunca devolve o próprio exercício', () => {
    for (const e of EXERCISES) {
      const alt = findAlternative(e, ['bodyweight', 'bands', 'dumbbells'], []);
      assert.notEqual(alt?.id, e.id, `${e.id} devolveu-se a si próprio`);
    }
  });

  it('nunca devolve um exercício já excluído', () => {
    const e = byId('for_agachamento');
    const excluidos = e.alts ?? [];
    const alt = findAlternative(e, ['bodyweight'], excluidos);
    assert.ok(!excluidos.includes(alt!.id), `devolveu ${alt!.id}, que estava excluído`);
  });

  it('nunca sugere material que a pessoa não tem', () => {
    for (const e of EXERCISES) {
      const alt = findAlternative(e, ['bodyweight'], []);
      if (!alt) continue;
      assert.ok(
        alt.equip.every((eq) => eq === 'bodyweight'),
        `${e.id} → ${alt.id}, que exige ${alt.equip.join('/')}`,
      );
    }
  });

  it('a versão mais fácil é mesmo mais fácil', () => {
    const rank = { beginner: 0, intermediate: 1, advanced: 2 } as const;
    for (const e of EXERCISES.filter((x) => x.diff === 'advanced')) {
      const alt = findAlternative(e, ['bodyweight', 'bands', 'dumbbells'], [], { easier: true });
      if (!alt) continue;
      assert.ok(rank[alt.diff] < rank[e.diff], `${e.id} (${e.diff}) → ${alt.id} (${alt.diff})`);
    }
  });

  it('quase todos os exercícios têm alguma alternativa só com peso corporal', () => {
    const sem = EXERCISES.filter((e) => !findAlternative(e, ['bodyweight'], []));
    // Um ou outro exercício muito específico pode não ter equivalente; o que
    // não pode é ser comum, senão a opção de trocar deixa de servir para nada.
    assert.ok(sem.length <= 3, `${sem.length} exercícios sem alternativa: ${sem.map((e) => e.id).join(', ')}`);
  });
});
