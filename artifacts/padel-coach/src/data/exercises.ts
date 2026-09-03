/**
 * Dados de domínio da Padel Coach AI.
 *
 * Portado sem alterações a partir da versão anterior em index.html — os textos,
 * ids e categorias são exactamente os mesmos, para que os planos gerados e os
 * dados já guardados em localStorage continuem válidos.
 */

export type Category = string;
export type Equipment = string;
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  desc: string;
  goal: string;
  duration: number;
  sets: number;
  reps: string | number;
  rest: number;
  diff: Difficulty;
  equip: Equipment[];
  cats: Category[];
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

function ex(
  id: string, name: string, desc: string, goal: string,
  duration: number, sets: number, reps: string | number, rest: number,
  diff: Difficulty, equip: Equipment[], cats: Category[],
): Exercise {
  return { id, name, desc, goal, duration, sets, reps, rest, diff, equip, cats };
}

export const CATEGORY_LABEL: Record<string, string> = {
  mobility:"Mobilidade", stretching:"Alongamentos", strength:"Força", core:"Core",
  explosiveness:"Explosão", agility:"Agilidade", footwork:"Footwork", jumps:"Saltos",
  speed:"Velocidade", stability:"Estabilidade", balance:"Equilíbrio",
  injuryPrevention:"Prevenção de Lesões", rehabilitation:"Reabilitação",
  shoulder:"Treino de Ombro", elbow:"Treino de Cotovelo", wrist:"Treino de Punho",
  knee:"Treino de Joelho", recovery:"Recuperação", activation:"Ativação", breathing:"Respiração"
};
export const AGGRESSIVE_CATS: Set<Category> = new Set(["strength","explosiveness","jumps","speed","agility"]);

export const PAIN_ZONES: PainZone[] = [
  {id:"shoulder", label:"Ombro", rehab:"shoulder"},
  {id:"elbow", label:"Cotovelo", rehab:"elbow"},
  {id:"wrist", label:"Punho", rehab:"wrist"},
  {id:"back", label:"Costas/lombar", rehab:"rehabilitation"},
  {id:"hip", label:"Anca", rehab:"rehabilitation"},
  {id:"knee", label:"Joelho", rehab:"knee"},
  {id:"calves", label:"Gémeos", rehab:"rehabilitation"},
  {id:"ankle", label:"Tornozelo", rehab:"rehabilitation"},
  {id:"foot", label:"Pé", rehab:"rehabilitation"},
  {id:"other", label:"Outra", rehab:"rehabilitation"},
];

// Dicas gerais de autocuidado. Informação geral de desporto, não é
// aconselhamento médico — nunca substitui avaliação por um profissional.
export const MUSCULAR_TIPS: string[] = [
  "Caminhada leve de 15-20 min ajuda a circulação e reduz a rigidez.",
  "Duche ou banho de contraste (água quente/fria alternada) alivia o cansaço muscular.",
  "Creme ou gel mentolado/frio pode aliviar a sensação de peso muscular.",
  "Hidrata bem e reforça a proteína nas refeições seguintes para recuperar melhor.",
];
export const PAIN_TIPS: Record<string, string[]> = {
  shoulder: ["Gelo (ou spray de frio) 15 min, 2-3x/dia, nas primeiras 48h.", "Evita movimentos acima da cabeça enquanto a dor não passar.", "Se for aguda, limitante, ou não melhorar em poucos dias, consulta um fisioterapeuta."],
  elbow: ["Gelo local 10-15 min após o jogo/treino.", "Reduz temporariamente a preensão forte (aperto de mão, carregar peso) do lado afetado.", "Persistindo mais de alguns dias, vale a pena avaliação profissional (pode ser epicondilite)."],
  wrist: ["Gelo local 10-15 min, várias vezes ao dia.", "Evita apoiar peso sobre o punho em extensão (ex. flexões) enquanto dói.", "Considera uma munhequeira/ligadura leve durante o jogo, se tiveres."],
  back: ["Nas primeiras 24-48h, gelo; depois disso, calor local costuma ajudar mais em dores lombares.", "Evita cargas na coluna e movimentos de torção bruscos.", "Se houver dor a irradiar para a perna, ou dormência, procura avaliação médica."],
  calves: ["Gelo 15 min após o esforço, pernas elevadas por uns minutos.", "Alongamento suave, sem forçar — nunca alongar contra dor aguda.", "Hidratação e eletrólitos ajudam a prevenir cãibras."],
  knee: ["Gelo 15 min, algumas vezes ao dia, especialmente após treino/jogo.", "Evita impacto (saltos, mudanças bruscas de direção) enquanto dói.", "Dor persistente, inchaço ou instabilidade → consulta um profissional."],
  hip: ["Gelo ou calor local, o que sentires que alivia mais.", "Mobilidade suave sem forçar amplitude máxima.", "Evita afundos/saltos profundos enquanto a dor não passar."],
  ankle: ["Gelo 15 min e pé elevado, sobretudo nas primeiras 48h.", "Evita terreno irregular e mudanças bruscas de direção.", "Se houve torção com inchaço ou não aguentas o peso, procura avaliação."],
  foot: ["Gelo ou rolar o pé sobre uma bola/garrafa fria, uns minutos por dia.", "Verifica o calçado — sola gasta ou pouco amortecimento agrava.", "Dor no calcanhar aos primeiros passos da manhã merece avaliação."],
  other: ["Reduz a carga sobre a zona enquanto doer.", "Gelo nas primeiras 48h costuma ajudar; depois disso, calor.", "Se não melhorar em poucos dias, procura avaliação profissional."],
};
export const EQUIPMENT: Option[] = [
  {id:"bands", label:"Elásticos"}, {id:"dumbbells", label:"Halteres"},
  {id:"bike", label:"Bicicleta"}, {id:"medicineBall", label:"Bola medicinal"},
  {id:"ladder", label:"Escadas"}, {id:"fingerBand", label:"Elástico de Dedos"},
  {id:"cones", label:"Cones"}, {id:"foamRoller", label:"Rolo de EVA"},
  {id:"tens", label:"TENS / Eletroestimulador"},
  {id:"bodyweight", label:"Apenas peso corporal"},
];
export const TIME_OPTIONS: number[] = [10,20,30,45,60];
export const PLAYING_TODAY: Option[] = [
  {id:"none", label:"Não"}, {id:"lesson", label:"Aula"}, {id:"casual", label:"Jogo casual"},
  {id:"tournament", label:"Torneio"}, {id:"intense", label:"Treino intenso"},
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
  {id:"explosiveness", label:"Melhorar explosão", favors:["explosiveness","jumps","speed"]},
  {id:"endurance", label:"Melhorar resistência", favors:["agility","footwork","speed"]},
  {id:"injuryPrevention", label:"Evitar lesões", favors:["injuryPrevention","stability","mobility"]},
  {id:"weightLoss", label:"Perder peso", favors:["agility","explosiveness","footwork"]},
  {id:"strength", label:"Ganhar força", favors:["strength","core"]},
  {id:"speed", label:"Melhorar velocidade", favors:["speed","agility","footwork"]},
  {id:"recovery", label:"Melhorar recuperação", favors:["recovery","mobility","stretching"]},
  {id:"mobility", label:"Melhorar mobilidade", favors:["mobility","stretching","balance"]},

];
export const EXERCISES: Exercise[] = [
  ex("mob_ombros","Círculos de Ombro","Círculos amplos e controlados com os braços.","Mobilizar o ombro antes do jogo.",3,2,"15/direção",15,"beginner",["bodyweight"],["mobility","activation"]),
  ex("mob_tronco","Rotação de Tronco","Rodar o tronco de um lado para o outro.","Preparar a rotação do golpe.",3,2,"12/lado",15,"beginner",["bodyweight"],["mobility","activation"]),
  ex("mob_anca","Mobilidade de Anca 90/90","Alternar a rotação da anca sentado no chão.","Melhorar rotação de anca para deslocações.",4,2,"8/lado",20,"intermediate",["bodyweight"],["mobility"]),
  ex("mob_tornozelo","Mobilidade de Tornozelo","Círculos e flexão do tornozelo em apoio unipodal.","Preparar mudanças de direção rápidas.",3,2,"10/pé",15,"beginner",["bodyweight"],["mobility"]),
  ex("mob_punho","Mobilidade de Punho e Cotovelo","Flexão, extensão e círculos lentos de punho.","Preparar para o impacto repetido da raquete.",3,2,"12",15,"beginner",["bodyweight"],["mobility","wrist","elbow"]),
  ex("alo_isquios","Alongamento de Isquiotibiais","Inclinar o tronco à frente com a perna esticada.","Reduzir tensão posterior da coxa.",3,2,"30s/perna",10,"beginner",["bodyweight"],["stretching","recovery"]),
  ex("alo_gemeos","Alongamento de Gémeos","Contra a parede, perna esticada atrás.","Aliviar tensão nos gémeos.",3,2,"30s/perna",10,"beginner",["bodyweight"],["stretching","recovery"]),
  ex("alo_peitoral","Alongamento de Peitoral e Ombro","Braço apoiado numa parede, rodar o tronco.","Libertar tensão do ombro dominante.",3,2,"30s/lado",10,"beginner",["bodyweight"],["stretching","recovery","shoulder"]),
  ex("alo_lombar","Postura da Criança","Sentar sobre os calcanhares, braços à frente.","Descomprimir a zona lombar.",3,1,"60s",0,"beginner",["bodyweight"],["stretching","recovery"]),
  ex("for_agachamento","Agachamento","Agachamento controlado com peso corporal.","Força de pernas para deslocações e saltos.",6,3,"12",60,"beginner",["bodyweight"],["strength"]),
  ex("for_afundo","Afundo (Lunge)","Passo em frente com descida controlada.","Força unilateral para alcance lateral.",6,3,"10/perna",60,"intermediate",["bodyweight"],["strength"]),
  ex("for_remo","Remada com Elástico","Puxar o elástico em direção ao tronco.","Fortalecer costas e equilibrar o ombro dominante.",5,3,"15",45,"beginner",["bands"],["strength","injuryPrevention"]),
  ex("for_ombro","Desenvolvimento de Ombro","Elevar halteres acima da cabeça.","Força de ombro para potência no smash.",6,3,"10",60,"intermediate",["dumbbells"],["strength"]),
  ex("for_gemeos","Elevação de Gémeos","Elevar os calcanhares do chão.","Força para arranques e travagens rápidas.",4,3,"15",30,"beginner",["bodyweight"],["strength","knee"]),
  ex("core_prancha","Prancha Frontal","Manter o corpo alinhado nos antebraços.","Estabilidade do tronco.",3,3,"30-40s",30,"beginner",["bodyweight"],["core","stability"]),
  ex("core_lateral","Prancha Lateral","Apoio lateral no antebraço, quadril elevado.","Força oblíqua para rotação e golpes laterais.",3,3,"25-30s/lado",30,"intermediate",["bodyweight"],["core","stability"]),
  ex("core_rotacao","Rotação de Tronco c/ Bola Medicinal","Rodar o tronco com a bola, sentado.","Potência rotacional específica do padel.",5,3,"12/lado",40,"intermediate",["medicineBall"],["core","explosiveness"]),
  ex("core_deadbug","Dead Bug","Estender braço e perna opostos, deitado.","Controlo lombopélvico.",4,3,"10/lado",30,"beginner",["bodyweight"],["core","injuryPrevention","rehabilitation"]),
  ex("exp_squatjump","Squat Jump","Agachar e saltar explosivamente.","Potência de pernas para arranques.",5,4,"8",60,"advanced",["bodyweight"],["explosiveness","jumps"]),
  ex("exp_lateral","Saltos Laterais","Saltar lateralmente de um pé para o outro.","Explosão lateral para cobrir o campo.",5,4,"10/lado",45,"intermediate",["bodyweight"],["explosiveness","agility","jumps"]),
  ex("exp_arranques","Arranques Curtos","Sprints de 5-10m a partir de posição parada.","Velocidade de reação para bolas curtas.",6,5,"1 sprint",40,"advanced",["bodyweight"],["explosiveness","speed"]),
  ex("agi_escada","Escada de Agilidade","Passos rápidos por dentro da escada.","Rapidez e coordenação de pés.",6,4,"1 passagem",30,"intermediate",["ladder"],["agility","footwork"]),
  ex("agi_splitstep","Split Step","Pequeno salto de preparação antes da reação.","Padrão de movimento fundamental do padel.",5,4,"10",30,"beginner",["bodyweight"],["agility","footwork"]),
  ex("agi_lateral","Deslocação Lateral entre Cones","Deslocação lateral rápida.","Footwork lateral específico do padel.",6,4,"30s",30,"intermediate",["bodyweight"],["agility","footwork","speed"]),
  ex("est_unipodal","Apoio Unipodal","Equilíbrio numa perna, olhos abertos/fechados.","Estabilidade de tornozelo e joelho.",3,3,"30s/perna",20,"beginner",["bodyweight"],["stability","balance","injuryPrevention","knee"]),
  ex("est_birddog","Bird Dog","Estender braço e perna opostos, de quatro apoios.","Estabilidade lombar e coordenação cruzada.",4,3,"10/lado",30,"beginner",["bodyweight"],["stability","core","injuryPrevention"]),
  ex("prev_rotadores","Rotação Externa de Ombro","Rodar o antebraço para fora contra o elástico.","Fortalecer rotadores externos do ombro.",4,3,"15/braço",30,"beginner",["bands"],["injuryPrevention","shoulder"]),
  ex("prev_nordic","Nordic Curl Assistido","Descida controlada e lenta, joelhos fixos.","Prevenção de lesões nos isquiotibiais.",5,3,"6",60,"advanced",["bodyweight"],["injuryPrevention"]),
  ex("prev_copenhagen","Copenhagen Plank","Prancha lateral com a perna de cima apoiada.","Fortalecer adutores.",4,3,"20-25s/lado",40,"advanced",["bodyweight"],["injuryPrevention"]),
  ex("reab_cotovelo","Isometria de Extensores do Punho","Segurar o punho em extensão contra resistência leve.","Aliviar e fortalecer em caso de dor no cotovelo.",5,3,"20-30s",30,"beginner",["bands"],["rehabilitation","elbow"]),
  ex("reab_punho","Fortalecimento de Flexores do Punho","Flexão e extensão lenta do punho.","Reabilitação e prevenção de dor no punho.",4,3,"15",30,"beginner",["dumbbells"],["rehabilitation","wrist"]),
  ex("reab_ombro","Exercício Pendular de Ombro","Deixar o braço balançar suavemente.","Aliviar dor aguda no ombro.",3,2,"20 balanços",20,"beginner",["bodyweight"],["rehabilitation","shoulder"]),
  ex("reab_joelho","Isometria de Quadríceps","Costas na parede, joelhos a ângulo confortável.","Manter força do quadríceps com dor no joelho.",4,3,"20-30s",40,"beginner",["bodyweight"],["rehabilitation","knee"]),
  ex("reab_gatocamelo","Gato-Camelo","Alternar flexão/extensão suave da coluna.","Aliviar tensão e rigidez lombar.",3,2,"12",15,"beginner",["bodyweight"],["rehabilitation","mobility"]),
  ex("rec_caminhada","Caminhada Leve","Caminhar em ritmo confortável.","Recuperação ativa, promover circulação.",10,1,"10 min",0,"beginner",["bodyweight"],["recovery"]),
  ex("rec_bicicleta","Bicicleta Leve","Pedalar a ritmo baixo e constante.","Recuperação ativa de baixo impacto.",15,1,"15 min",0,"beginner",["bike"],["recovery"]),
  ex("ativ_skipping","Skipping Baixo","Corrida no lugar com joelhos baixos.","Elevar a temperatura corporal antes do jogo.",3,2,"30s",20,"beginner",["bodyweight"],["activation"]),
  ex("ativ_toques","Toques de Raquete em Vazio","Simular golpes sem bola, ritmo lento.","Ativar o padrão de movimento antes do jogo.",3,1,"20/lado",0,"beginner",["bodyweight"],["activation"]),
  ex("resp_diafragmatica","Respiração Diafragmática","Inspirar enchendo o abdómen, expirar devagar.","Reduzir ativação nervosa, acelerar recuperação.",5,1,"10 respirações",0,"beginner",["bodyweight"],["breathing","recovery"]),
  ex("resp_caixa","Respiração em Caixa (4-4-4-4)","Inspirar, reter, expirar, reter — 4s cada.","Acalmar e focar antes de um torneio.",4,1,"6 ciclos",0,"beginner",["bodyweight"],["breathing"]),
  ex("reab_dedos","Fortalecimento de Preensão com Elástico de Dedos","Abrir os dedos contra a resistência do elástico, de forma controlada.","Fortalecer dedos e antebraço, protegendo punho e cotovelo do impacto da raquete.",4,3,"15",30,"beginner",["fingerBand"],["rehabilitation","wrist","elbow","injuryPrevention"]),
  ex("agi_cones_zigzag","Deslocação em Zigue-Zague entre Cones","Deslocação rápida em zigue-zague, contornando os cones.","Footwork multidirecional específico do padel.",6,4,"1 passagem",30,"intermediate",["cones"],["agility","footwork","speed"]),
  ex("rec_rolo_eva","Automassagem com Rolo de EVA","Rolar lentamente gémeos, quadríceps e costas sobre o rolo.","Libertar tensão muscular e acelerar a recuperação.",8,1,"2 min/zona",0,"beginner",["foamRoller"],["recovery"]),
  ex("rec_tens","Eletroestimulação de Recuperação (TENS)","Colocar os elétrodos na zona fatigada ou dolorida, sessão de baixa intensidade.","Aliviar dor muscular e acelerar a recuperação entre jogos.",15,1,"15-20 min",0,"beginner",["tens"],["recovery","rehabilitation"]),

  // --- Conteúdo adicional ---
  ex("mob_coluna_toracica","Rotação Torácica em Quadrupedia","De quatro apoios, uma mão atrás da cabeça, rodar o tronco para cima e para baixo.","Melhorar a rotação torácica usada no golpe.",4,2,"10/lado",20,"beginner",["bodyweight"],["mobility"]),
  ex("mob_isquios_dinamico","Leg Swings (Balanço de Perna)","Balançar a perna para a frente e para trás de forma controlada, apoiado numa parede.","Mobilizar a anca e isquiotibiais antes do jogo.",3,2,"12/perna",15,"beginner",["bodyweight"],["mobility","activation"]),
  ex("alo_adutores","Alongamento de Adutores (Borboleta)","Sentado, solas dos pés unidas, pressionar os joelhos suavemente para baixo.","Aliviar tensão na virilha após deslocações laterais.",3,2,"30s",10,"beginner",["bodyweight"],["stretching","recovery"]),
  ex("alo_flexores_anca","Alongamento de Flexores da Anca","Posição de afundo, bacia à frente, tronco ereto.","Libertar tensão nos flexores da anca após muitas corridas curtas.",3,2,"30s/lado",10,"beginner",["bodyweight"],["stretching","recovery"]),
  ex("for_peso_morto_unilateral","Peso Morto Unilateral (Halteres)","Numa perna, inclinar o tronco à frente mantendo as costas direitas.","Força de posterior de coxa e estabilidade unipodal.",6,3,"8/perna",60,"advanced",["dumbbells"],["strength","stability"]),
  ex("for_elevacao_pelvica","Elevação Pélvica (Hip Thrust)","Ombros apoiados num banco, elevar a bacia contraindo os glúteos.","Força de glúteos, importante para explosão e proteção do joelho.",6,3,"12",50,"intermediate",["bodyweight"],["strength","knee","injuryPrevention"]),
  ex("core_pallof","Pallof Press com Elástico","De pé, empurrar o elástico à frente do peito resistindo à rotação do tronco.","Estabilidade anti-rotação do core.",4,3,"10/lado",30,"intermediate",["bands"],["core","stability","injuryPrevention"]),
  ex("core_prancha_dinamica","Prancha com Toque no Ombro","Em prancha alta, tocar alternadamente no ombro oposto sem rodar a bacia.","Anti-rotação e estabilidade de ombro/core.",4,3,"12/lado",30,"intermediate",["bodyweight"],["core","stability"]),
  ex("exp_bound_lateral","Bound Lateral com Aterragem Estável","Saltar para o lado e estabilizar 2s antes do próximo salto.","Explosão lateral com controlo de aterragem, prevenção de entorses.",5,4,"6/lado",50,"advanced",["bodyweight"],["explosiveness","jumps","stability"]),
  ex("exp_saltos_caixa","Saltos para Caixa/Step Baixo","Saltar para uma superfície baixa e elevada, aterrar suavemente.","Potência vertical e técnica de aterragem.",5,4,"6",60,"advanced",["bodyweight"],["explosiveness","jumps"]),
  ex("agi_reacao_bola","Reação a Sinal (Bola/Palma)","Parceiro dá um sinal (som ou lançamento), reagir com arranque curto.","Tempo de reação específico para bolas rápidas do adversário.",5,5,"1 repetição",30,"intermediate",["bodyweight"],["agility","speed"]),
  ex("agi_carioca","Passada Cruzada (Carioca)","Deslocação lateral cruzando os pés alternadamente à frente e atrás.","Coordenação e footwork lateral.",5,3,"20m",30,"intermediate",["bodyweight"],["agility","footwork"]),
  ex("est_prancha_bola","Prancha com Pés na Bola Medicinal","Prancha frontal com os pés apoiados sobre a bola medicinal.","Estabilidade avançada de core e ombro.",4,3,"20-30s",40,"advanced",["medicineBall"],["stability","core"]),
  ex("est_equilibrio_dinamico","Equilíbrio Dinâmico com Alcance","Numa perna, tocar com a mão oposta em pontos à frente/lado/atrás.","Equilíbrio dinâmico e controlo de tornozelo/joelho.",4,3,"8/direção",25,"intermediate",["bodyweight"],["stability","balance","knee"]),
  ex("prev_manguito","Rotação Interna e Externa de Ombro Combinada","Sequência de rotação interna e externa com elástico, ritmo lento.","Equilibrar toda a musculatura do manguito rotador.",5,3,"12/direção",30,"intermediate",["bands"],["injuryPrevention","shoulder"]),
  ex("prev_tornozelo_elastico","Fortalecimento de Tornozelo com Elástico","Mover o pé contra a resistência do elástico em várias direções.","Prevenção de entorses de tornozelo.",4,3,"15/direção",30,"beginner",["bands"],["injuryPrevention"]),
  ex("reab_anca_concha","Exercício da Concha (Clamshell)","Deitado de lado, joelhos dobrados, abrir o joelho de cima como uma concha.","Reabilitação e fortalecimento dos glúteos médios, protege a anca e o joelho.",4,3,"15/lado",30,"beginner",["bands"],["rehabilitation","knee"]),
  ex("rec_alongamento_completo","Rotina de Alongamento Completo Pós-Jogo","Sequência de alongamentos para pernas, tronco e braços, ritmo calmo.","Fechar a sessão de padel com o corpo relaxado.",10,1,"10 min",0,"beginner",["bodyweight"],["stretching","recovery"]),
];

export function exerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}
