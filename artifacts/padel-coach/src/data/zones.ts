/**
 * Programas por zona do corpo.
 *
 * São listas curadas de exercícios geralmente usados para mobilidade,
 * fortalecimento e prevenção nessa zona. Não são tratamento de coisa nenhuma,
 * não pressupõem diagnóstico e não substituem avaliação profissional.
 *
 * Optámos por listas escritas à mão em vez de as deduzir das categorias: a
 * ordem importa (primeiro soltar, depois fortalecer) e há exercícios que fazem
 * sentido para uma zona sem estarem etiquetados com ela.
 */

export interface ZoneGroup {
  title: string;
  /** Porquê este grupo, nesta ordem. */
  note: string;
  exerciseIds: string[];
}

export interface ZoneProgram {
  zone: string;
  /** O que costuma estar em causa nesta zona, em linguagem corrente. */
  intro: string;
  groups: ZoneGroup[];
}

/**
 * Sinais que justificam parar e procurar avaliação, em vez de continuar a
 * treinar por conta própria. A app mostra-os sempre nesta página.
 */
export const RED_FLAG_SIGNS: string[] = [
  'Dor forte, que te impede de usar a zona normalmente',
  'Pancada, queda ou torção com estalido',
  'Perda de força ou a articulação a ceder',
  'Dormência, formigueiro ou perda de sensibilidade',
  'Inchaço importante ou a zona muito quente',
  'Deformidade visível',
  'Dor intensa em repouso ou que te acorda de noite',
  'Dor que vem a piorar de semana para semana',
];

export const ZONE_PROGRAMS: ZoneProgram[] = [
  {
    zone: 'shoulder',
    intro:
      'No padel o ombro trabalha muito acima da cabeça e quase sempre do mesmo lado. As queixas costumam vir de falta de amplitude, de a omoplata não acompanhar o movimento, ou de a parte de trás do ombro ser bem mais fraca do que a da frente.',
    groups: [
      {
        title: 'Primeiro, soltar',
        note: 'Ganhar amplitude antes de pedir força a um ombro que não se mexe bem.',
        exerciseIds: ['mob_ombros', 'mob_ombro_toalha', 'alo_peitoral', 'mob_wall_slides'],
      },
      {
        title: 'Depois, a omoplata',
        note: 'A omoplata é a base do ombro. Se ela não segura, o ombro paga a conta.',
        exerciseIds: ['prev_ytw', 'prev_scapular_pushup', 'prev_face_pull'],
      },
      {
        title: 'Por fim, fortalecer',
        note: 'Os rotadores travam o braço no fim do remate. É aí que o ombro sofre.',
        exerciseIds: ['prev_rotadores', 'prev_manguito', 'for_remo'],
      },
      {
        title: 'Quando dói a mexer',
        note: 'Manter a articulação a mexer sem lhe pedir força nenhuma.',
        exerciseIds: ['reab_ombro'],
      },
    ],
  },
  {
    zone: 'elbow',
    intro:
      'A dor na parte de fora do cotovelo é das queixas mais comuns em quem joga padel — costuma vir da carga repetida no antebraço, não do cotovelo em si. Por isso quase tudo o que ajuda se faz no punho e na mão.',
    groups: [
      {
        title: 'Primeiro, aliviar',
        note: 'Contração sem movimento, que costuma ser bem tolerada quando mexer ainda dói.',
        exerciseIds: ['reab_cotovelo', 'alo_antebraco'],
      },
      {
        title: 'Depois, carregar devagar',
        note: 'A descida lenta é o tipo de carga que o antebraço costuma tolerar melhor.',
        exerciseIds: ['reab_cotovelo_excentrico', 'reab_punho'],
      },
      {
        title: 'E equilibrar a mão',
        note: 'No padel a mão só agarra, nunca abre. Isto compensa esse desequilíbrio.',
        exerciseIds: ['reab_dedos', 'mob_pronacao', 'mob_punho'],
      },
    ],
  },
  {
    zone: 'wrist',
    intro:
      'O punho encaixa a vibração de cada bola. As queixas aparecem com raquetes pesadas, punhos de raquete mal dimensionados ou muitas horas de jogo seguidas.',
    groups: [
      {
        title: 'Soltar',
        note: 'Amplitude confortável antes de qualquer carga.',
        exerciseIds: ['mob_punho', 'mob_pronacao', 'alo_antebraco'],
      },
      {
        title: 'Fortalecer',
        note: 'Antebraço forte absorve melhor o impacto de cada bola batida.',
        exerciseIds: ['reab_punho', 'reab_dedos', 'reab_cotovelo_excentrico'],
      },
    ],
  },
  {
    zone: 'back',
    intro:
      'A lombar queixa-se quando a rotação não vem das costas médias e quando a anca está presa — nesses casos é ela que faz o trabalho dos outros. O caminho costuma passar por soltar acima e abaixo, e ensinar o tronco a ficar firme.',
    groups: [
      {
        title: 'Primeiro, soltar',
        note: 'Movimento suave sem carga nenhuma, para desenferrujar.',
        exerciseIds: ['reab_gatocamelo', 'mob_rotacao_deitado', 'alo_lombar'],
      },
      {
        title: 'Dar rotação a quem deve tê-la',
        note: 'Se as costas médias rodarem bem, a lombar deixa de compensar.',
        exerciseIds: ['mob_coluna_toracica', 'alo_flexores_anca'],
      },
      {
        title: 'Ensinar o tronco a segurar',
        note: 'Não é fazer abdominais: é o tronco ficar firme enquanto os membros se mexem.',
        exerciseIds: ['core_deadbug', 'est_birddog', 'for_elevacao_pelvica', 'core_pallof'],
      },
    ],
  },
  {
    zone: 'hip',
    intro:
      'A anca leva com todas as deslocações laterais e afundos. Costuma perder rotação com o tempo, e quando isso acontece a lombar e o joelho compensam.',
    groups: [
      {
        title: 'Recuperar rotação',
        note: 'A rotação da anca é o que dá passos laterais amplos.',
        exerciseIds: ['mob_anca', 'alo_flexores_anca', 'alo_adutores'],
      },
      {
        title: 'Fortalecer os glúteos',
        note: 'O glúteo médio é o que impede o joelho de cair para dentro.',
        exerciseIds: ['reab_anca_concha', 'for_elevacao_pelvica', 'est_unipodal'],
      },
      {
        title: 'Controlo em apoio',
        note: 'Trabalhar a anca como ela funciona no jogo: de pé, numa perna.',
        exerciseIds: ['mob_hip_airplane', 'est_equilibrio_dinamico'],
      },
    ],
  },
  {
    zone: 'knee',
    intro:
      'O joelho raramente é o problema — costuma ser quem paga a conta de uma anca fraca ou de um tornozelo preso. Por isso o trabalho reparte-se por cima e por baixo dele.',
    groups: [
      {
        title: 'Carregar sem impacto',
        note: 'Trabalho isométrico, que costuma ser tolerado mesmo com o joelho sensível.',
        exerciseIds: ['reab_joelho', 'for_wallsit', 'for_spanish_squat'],
      },
      {
        title: 'Fortalecer à volta',
        note: 'Glúteos e posterior tiram carga à frente do joelho.',
        exerciseIds: ['for_elevacao_pelvica', 'reab_anca_concha', 'for_stepup'],
      },
      {
        title: 'Controlo e equilíbrio',
        note: 'É o joelho a cair para dentro que magoa, e isso treina-se.',
        exerciseIds: ['est_unipodal', 'est_equilibrio_dinamico', 'for_gemeos'],
      },
    ],
  },
  {
    zone: 'calves',
    intro:
      'Os gémeos dão o primeiro impulso de cada arranque e absorvem cada travagem. Queixam-se com volume de jogo alto, desidratação, ou falta de mobilidade no tornozelo.',
    groups: [
      {
        title: 'Soltar',
        note: 'Aliviar a tensão acumulada depois do jogo.',
        exerciseIds: ['alo_gemeos', 'rec_rolo_eva', 'mob_knee_to_wall'],
      },
      {
        title: 'Fortalecer',
        note: 'Gémeos fortes queixam-se menos, e a frente da perna também conta.',
        exerciseIds: ['for_gemeos', 'for_tibialis'],
      },
    ],
  },
  {
    zone: 'ankle',
    intro:
      'O tornozelo é a articulação que mais entorses sofre no padel, e uma entorse mal recuperada deixa-o vulnerável durante anos. Equilíbrio e força de fora são o que mais protege.',
    groups: [
      {
        title: 'Recuperar amplitude',
        note: 'Tornozelo com boa flexão trava melhor e passa menos carga ao joelho.',
        exerciseIds: ['mob_tornozelo', 'mob_knee_to_wall', 'alo_gemeos'],
      },
      {
        title: 'Fortalecer nas quatro direções',
        note: 'A força para fora é a que trava a torção mais comum.',
        exerciseIds: ['prev_tornozelo_elastico', 'for_gemeos', 'for_tibialis'],
      },
      {
        title: 'Equilíbrio',
        note: 'Depois de uma entorse, é o equilíbrio que fica pior — e é o que mais protege.',
        exerciseIds: ['est_unipodal', 'est_equilibrio_dinamico', 'exp_bound_lateral'],
      },
    ],
  },
  {
    zone: 'foot',
    intro:
      'As queixas no pé costumam vir do calçado, do piso, ou de um aumento rápido de horas de jogo. Verifica primeiro a sola dos ténis — muitas vezes o problema está aí.',
    groups: [
      {
        title: 'Aliviar',
        note: 'Soltar a planta do pé e a cadeia de trás, que puxa por ela.',
        exerciseIds: ['rec_rolo_eva', 'alo_gemeos', 'mob_tornozelo'],
      },
      {
        title: 'Fortalecer o apoio',
        note: 'Pé e tornozelo firmes distribuem melhor a carga a cada passo.',
        exerciseIds: ['for_gemeos', 'for_tibialis', 'est_unipodal'],
      },
    ],
  },
];

export function programForZone(zone: string): ZoneProgram | undefined {
  return ZONE_PROGRAMS.find((p) => p.zone === zone);
}
