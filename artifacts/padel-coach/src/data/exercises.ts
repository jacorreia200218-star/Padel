/**
 * Dados de domínio da Padel Coach AI.
 *
 * Este módulo é a porta de entrada: reexporta os tipos, a biblioteca de
 * exercícios (em `library/`, dividida por família) e as listas de opções que
 * o formulário de check-in e o motor de decisão usam.
 */

export type {
  Category,
  Difficulty,
  Equipment,
  Exercise,
  Goal,
  Option,
  PainZone,
} from './types';

import type { Category, Goal, Option, PainZone } from './types';
export { EXERCISES } from './library';

import { EXERCISES } from './library';

export function exerciseById(id: string) {
  return EXERCISES.find((e) => e.id === id);
}

export const CATEGORY_LABEL: Record<string, string> = {
  mobility: 'Mobilidade',
  stretching: 'Alongamentos',
  strength: 'Força',
  core: 'Core',
  explosiveness: 'Explosão',
  agility: 'Agilidade',
  footwork: 'Footwork',
  jumps: 'Saltos',
  speed: 'Velocidade',
  stability: 'Estabilidade',
  balance: 'Equilíbrio',
  injuryPrevention: 'Prevenção de Lesões',
  rehabilitation: 'Reabilitação',
  shoulder: 'Treino de Ombro',
  elbow: 'Treino de Cotovelo',
  wrist: 'Treino de Punho',
  knee: 'Treino de Joelho',
  ankle: 'Treino de Tornozelo',
  recovery: 'Recuperação',
  activation: 'Ativação',
  breathing: 'Respiração',
};

export const DIFF_LABEL: Record<string, string> = {
  beginner: 'Iniciado',
  intermediate: 'Intermédio',
  advanced: 'Avançado',
};

/** Categorias que ficam de fora em dias vermelhos ou com dor. */
export const AGGRESSIVE_CATS: Set<Category> = new Set([
  'strength',
  'explosiveness',
  'jumps',
  'speed',
  'agility',
]);

export const PAIN_ZONES: PainZone[] = [
  { id: 'shoulder', label: 'Ombro', rehab: 'shoulder' },
  { id: 'elbow', label: 'Cotovelo', rehab: 'elbow' },
  { id: 'wrist', label: 'Punho', rehab: 'wrist' },
  { id: 'back', label: 'Costas/lombar', rehab: 'rehabilitation' },
  { id: 'hip', label: 'Anca', rehab: 'rehabilitation' },
  { id: 'knee', label: 'Joelho', rehab: 'knee' },
  { id: 'calves', label: 'Gémeos', rehab: 'rehabilitation' },
  { id: 'ankle', label: 'Tornozelo', rehab: 'ankle' },
  { id: 'foot', label: 'Pé', rehab: 'rehabilitation' },
  { id: 'other', label: 'Outra', rehab: 'rehabilitation' },
];

// Dicas gerais de autocuidado. Informação geral de desporto, não é
// aconselhamento médico — nunca substitui avaliação por um profissional.
export const MUSCULAR_TIPS: string[] = [
  'Caminhada leve de 15-20 min ajuda a circulação e reduz a rigidez.',
  'Duche ou banho de contraste (água quente/fria alternada) alivia o cansaço muscular.',
  'Creme ou gel mentolado/frio pode aliviar a sensação de peso muscular.',
  'Hidrata bem e reforça a proteína nas refeições seguintes para recuperar melhor.',
];

export const PAIN_TIPS: Record<string, string[]> = {
  shoulder: [
    'Gelo (ou spray de frio) 15 min, 2-3x/dia, nas primeiras 48h.',
    'Evita movimentos acima da cabeça enquanto a dor não passar.',
    'Se for aguda, limitante, ou não melhorar em poucos dias, consulta um fisioterapeuta.',
  ],
  elbow: [
    'Gelo local 10-15 min após o jogo/treino.',
    'Reduz temporariamente a preensão forte (aperto de mão, carregar peso) do lado afetado.',
    'Persistindo mais de alguns dias, vale a pena avaliação profissional (pode ser epicondilite).',
  ],
  wrist: [
    'Gelo local 10-15 min, várias vezes ao dia.',
    'Evita apoiar peso sobre o punho em extensão (ex. flexões) enquanto dói.',
    'Considera uma munhequeira/ligadura leve durante o jogo, se tiveres.',
  ],
  back: [
    'Nas primeiras 24-48h, gelo; depois disso, calor local costuma ajudar mais em dores lombares.',
    'Evita cargas na coluna e movimentos de torção bruscos.',
    'Se houver dor a irradiar para a perna, ou dormência, procura avaliação médica.',
  ],
  calves: [
    'Gelo 15 min após o esforço, pernas elevadas por uns minutos.',
    'Alongamento suave, sem forçar — nunca alongar contra dor aguda.',
    'Hidratação e eletrólitos ajudam a prevenir cãibras.',
  ],
  knee: [
    'Gelo 15 min, algumas vezes ao dia, especialmente após treino/jogo.',
    'Evita impacto (saltos, mudanças bruscas de direção) enquanto dói.',
    'Dor persistente, inchaço ou instabilidade → consulta um profissional.',
  ],
  hip: [
    'Gelo ou calor local, o que sentires que alivia mais.',
    'Mobilidade suave sem forçar amplitude máxima.',
    'Evita afundos/saltos profundos enquanto a dor não passar.',
  ],
  ankle: [
    'Gelo 15 min e pé elevado, sobretudo nas primeiras 48h.',
    'Evita terreno irregular e mudanças bruscas de direção.',
    'Se houve torção com inchaço ou não aguentas o peso, procura avaliação.',
  ],
  foot: [
    'Gelo ou rolar o pé sobre uma bola/garrafa fria, uns minutos por dia.',
    'Verifica o calçado — sola gasta ou pouco amortecimento agrava.',
    'Dor no calcanhar aos primeiros passos da manhã merece avaliação.',
  ],
  other: [
    'Reduz a carga sobre a zona enquanto doer.',
    'Gelo nas primeiras 48h costuma ajudar; depois disso, calor.',
    'Se não melhorar em poucos dias, procura avaliação profissional.',
  ],
};

export const EQUIPMENT: Option[] = [
  { id: 'bands', label: 'Elásticos' },
  { id: 'dumbbells', label: 'Halteres' },
  { id: 'bike', label: 'Bicicleta' },
  { id: 'medicineBall', label: 'Bola medicinal' },
  { id: 'ladder', label: 'Escadas' },
  { id: 'fingerBand', label: 'Elástico de Dedos' },
  { id: 'cones', label: 'Cones' },
  { id: 'foamRoller', label: 'Rolo de EVA' },
  { id: 'tens', label: 'TENS / Eletroestimulador' },
  { id: 'bodyweight', label: 'Apenas peso corporal' },
];

export const TIME_OPTIONS: number[] = [10, 20, 30, 45, 60];

export const PLAYING_TODAY: Option[] = [
  { id: 'none', label: 'Não' },
  { id: 'lesson', label: 'Aula' },
  { id: 'casual', label: 'Jogo casual' },
  { id: 'tournament', label: 'Torneio' },
  { id: 'intense', label: 'Treino intenso' },
];

/**
 * Atividade de ontem. `padel` diz se conta como jogo de padel e `cats` são as
 * categorias que ficaram carregadas — o motor usa-as para variar o estímulo.
 */
export interface ActivityOption extends Option {
  padel: boolean;
  cats: Category[];
}

export const YESTERDAY_ACTIVITIES: ActivityOption[] = [
  { id: 'none', label: 'Não fiz nada', padel: false, cats: [] },
  { id: 'padelLesson', label: 'Aula de padel', padel: true, cats: ['agility', 'footwork'] },
  { id: 'padelMatch', label: 'Jogo de padel', padel: true, cats: ['agility', 'footwork', 'speed'] },
  { id: 'strength', label: 'Treino de força', padel: false, cats: ['strength', 'explosiveness'] },
  { id: 'bike', label: 'Bicicleta', padel: false, cats: ['recovery'] },
  { id: 'run', label: 'Corrida', padel: false, cats: ['speed'] },
  { id: 'mobility', label: 'Mobilidade', padel: false, cats: ['mobility', 'stretching'] },
  { id: 'other', label: 'Outro', padel: false, cats: [] },
];

export const DURATION_OPTIONS: number[] = [15, 30, 45, 60, 90, 120];

/** Escalas de 1 a 5 com rótulo, como pedido — mais claras do que um 1-10. */
export const SLEEP_QUALITY: Option[] = [
  { id: '1', label: '😴 Muito má' },
  { id: '2', label: '😕 Má' },
  { id: '3', label: '😐 Normal' },
  { id: '4', label: '🙂 Boa' },
  { id: '5', label: '😍 Excelente' },
];

export const ENERGY_LEVELS: Option[] = [
  { id: '1', label: 'Sem energia' },
  { id: '2', label: 'Baixa' },
  { id: '3', label: 'Normal' },
  { id: '4', label: 'Boa' },
  { id: '5', label: 'Excelente' },
];

export const FATIGUE_LEVELS: Option[] = [
  { id: '1', label: 'Nada cansado' },
  { id: '2', label: 'Pouco' },
  { id: '3', label: 'Moderado' },
  { id: '4', label: 'Muito' },
  { id: '5', label: 'Exausto' },
];

export const SORENESS_LEVELS: Option[] = [
  { id: 'none', label: 'Não' },
  { id: 'light', label: 'Ligeiras' },
  { id: 'moderate', label: 'Moderadas' },
  { id: 'strong', label: 'Fortes' },
];

export const PAIN_ONSET: Option[] = [
  { id: 'today', label: 'Hoje' },
  { id: 'days', label: 'Há dias' },
  { id: 'weeks', label: 'Há semanas' },
  { id: 'months', label: 'Há meses' },
];

export const PAIN_WHEN: Option[] = [
  { id: 'movement', label: 'Só em movimento' },
  { id: 'rest', label: 'Também em repouso' },
];

export const PAIN_TREND: Option[] = [
  { id: 'better', label: 'A melhorar' },
  { id: 'same', label: 'Igual' },
  { id: 'worse', label: 'A piorar' },
];

export const GOALS: Goal[] = [
  { id: 'explosiveness', label: 'Melhorar explosão', favors: ['explosiveness', 'jumps', 'speed'] },
  { id: 'endurance', label: 'Melhorar resistência', favors: ['agility', 'footwork', 'speed'] },
  {
    id: 'injuryPrevention',
    label: 'Evitar lesões',
    favors: ['injuryPrevention', 'stability', 'mobility'],
  },
  { id: 'weightLoss', label: 'Perder peso', favors: ['agility', 'explosiveness', 'footwork'] },
  { id: 'strength', label: 'Ganhar força', favors: ['strength', 'core'] },
  { id: 'speed', label: 'Melhorar velocidade', favors: ['speed', 'agility', 'footwork'] },
  { id: 'recovery', label: 'Melhorar recuperação', favors: ['recovery', 'mobility', 'stretching'] },
  { id: 'mobility', label: 'Melhorar mobilidade', favors: ['mobility', 'stretching', 'balance'] },
];
