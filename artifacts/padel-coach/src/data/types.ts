/** Tipos partilhados da biblioteca de exercícios. */

export type Category = string;
export type Equipment = string;
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  /** Grupos musculares principais, em linguagem corrente. */
  muscles: string[];
  /** Uma frase sobre o que é o movimento. */
  desc: string;
  /** Para que serve, do ponto de vista de quem joga padel. */
  goal: string;
  /** Como executar, passo a passo. */
  instructions: string[];
  /** Erros comuns que tiram eficácia ou aumentam o risco. */
  mistakes: string[];
  benefits: string;
  /**
   * Cuidados a ter. Ausente quando não há nada de especial a assinalar.
   * Nunca é uma contraindicação clínica — só bom senso de execução e o aviso
   * de parar e procurar avaliação quando dói.
   */
  cautions?: string;
  duration: number;
  sets: number;
  reps: string | number;
  rest: number;
  diff: Difficulty;
  equip: Equipment[];
  cats: Category[];
  /** Exercícios equivalentes, por id, para trocar durante o treino. */
  alts?: string[];
}

export interface PainZone {
  id: string;
  label: string;
  rehab: Category;
}

export interface Goal {
  id: string;
  label: string;
  favors: Category[];
}

export interface Option {
  id: string;
  label: string;
}
