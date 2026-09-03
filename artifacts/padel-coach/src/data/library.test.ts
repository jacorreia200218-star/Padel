/**
 * Integridade da biblioteca de exercícios.
 *
 * São 92 exercícios escritos à mão, referenciados por id em vários sítios:
 * alternativas, programas por zona, planos guardados. Um id trocado numa letra
 * não parte o build nem dá erro — desaparece silenciosamente do sítio onde
 * devia aparecer. Estes testes são o que apanha isso.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CATEGORY_LABEL, EXERCISES, PAIN_TIPS, PAIN_ZONES } from './exercises';
import { ZONE_PROGRAMS } from './zones';

const IDS = new Set(EXERCISES.map((e) => e.id));

describe('biblioteca de exercícios', () => {
  it('não tem ids repetidos', () => {
    assert.equal(IDS.size, EXERCISES.length);
  });

  it('todos os exercícios estão preenchidos', () => {
    for (const e of EXERCISES) {
      assert.ok(e.name.trim(), `${e.id} sem nome`);
      assert.ok(e.muscles.length, `${e.id} sem grupos musculares`);
      assert.ok(e.instructions.length >= 2, `${e.id} com instruções a menos`);
      assert.ok(e.mistakes.length >= 1, `${e.id} sem erros comuns`);
      assert.ok(e.benefits.trim(), `${e.id} sem benefícios`);
      assert.ok(e.cats.length, `${e.id} sem categorias`);
      assert.ok(e.equip.length, `${e.id} sem equipamento`);
    }
  });

  it('todas as categorias usadas têm tradução', () => {
    for (const e of EXERCISES) {
      for (const c of e.cats) {
        assert.ok(CATEGORY_LABEL[c], `categoria "${c}" (em ${e.id}) não tem rótulo`);
      }
    }
  });

  it('as alternativas apontam para exercícios que existem', () => {
    for (const e of EXERCISES) {
      for (const alt of e.alts ?? []) {
        assert.ok(IDS.has(alt), `${e.id} aponta para alternativa inexistente "${alt}"`);
        assert.notEqual(alt, e.id, `${e.id} tem-se a si próprio como alternativa`);
      }
    }
  });

  it('cumpre as contagens mínimas por categoria', () => {
    const alvos: Record<string, number> = {
      strength: 15,
      explosiveness: 10,
      agility: 10,
      mobility: 15,
      core: 10,
      injuryPrevention: 10,
      recovery: 10,
    };
    for (const [cat, minimo] of Object.entries(alvos)) {
      const total = EXERCISES.filter((e) => e.cats.includes(cat)).length;
      assert.ok(total >= minimo, `${cat}: ${total} exercícios, era preciso pelo menos ${minimo}`);
    }
  });

  it('há sempre alternativa sem material para quem só tem peso corporal', () => {
    // Sem isto, alguém sem elásticos nem halteres podia ficar sem plano.
    const semMaterial = EXERCISES.filter((e) => e.equip.every((eq) => eq === 'bodyweight'));
    assert.ok(semMaterial.length >= 40, `só ${semMaterial.length} exercícios sem material`);
  });
});

describe('zonas do corpo', () => {
  it('cada zona com dicas tem uma zona de dor correspondente', () => {
    for (const zona of Object.keys(PAIN_TIPS)) {
      assert.ok(
        PAIN_ZONES.some((z) => z.id === zona),
        `PAIN_TIPS tem "${zona}" mas não existe essa zona`,
      );
    }
  });

  it('cada zona de dor tem dicas de autocuidado', () => {
    for (const z of PAIN_ZONES) {
      assert.ok(PAIN_TIPS[z.id]?.length, `zona "${z.id}" sem dicas`);
    }
  });

  it('a categoria de reabilitação de cada zona tem exercícios', () => {
    for (const z of PAIN_ZONES) {
      const tem = EXERCISES.some((e) => e.cats.includes(z.rehab));
      assert.ok(tem, `zona "${z.id}" aponta para "${z.rehab}", que não tem exercícios`);
    }
  });

  it('os programas por zona só referem exercícios que existem', () => {
    for (const p of ZONE_PROGRAMS) {
      assert.ok(
        PAIN_ZONES.some((z) => z.id === p.zone),
        `programa para zona desconhecida "${p.zone}"`,
      );
      assert.ok(p.intro.trim(), `zona ${p.zone} sem introdução`);
      assert.ok(p.groups.length, `zona ${p.zone} sem grupos`);
      for (const g of p.groups) {
        assert.ok(g.exerciseIds.length, `grupo "${g.title}" de ${p.zone} está vazio`);
        for (const id of g.exerciseIds) {
          assert.ok(IDS.has(id), `zona ${p.zone}, grupo "${g.title}": id inexistente "${id}"`);
        }
      }
    }
  });

  it('nenhum programa repete o mesmo exercício', () => {
    for (const p of ZONE_PROGRAMS) {
      const todos = p.groups.flatMap((g) => g.exerciseIds);
      assert.equal(new Set(todos).size, todos.length, `zona ${p.zone} repete exercícios`);
    }
  });
});
