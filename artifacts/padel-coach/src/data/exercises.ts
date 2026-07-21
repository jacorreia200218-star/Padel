export type Category = string;
export type Equipment = string;

export interface Exercise {
  id: string;
  name: string;
  desc: string;
  goal: string;
  duration: number;
  sets: number;
  reps: string | number;
  rest: number;
  diff: "beginner" | "intermediate" | "advanced";
  equip: Equipment[];
  cats: Category[];
}

export const CATEGORY_LABEL: Record<string, string> = {
  mobility:"Mobilidade", stretching:"Alongamentos", strength:"Força", core:"Core",
  explosiveness:"Explosão", agility:"Agilidade", footwork:"Footwork", jumps:"Saltos",
  speed:"Velocidade", stability:"Estabilidade", balance:"Equilíbrio",
  injuryPrevention:"Prevenção de Lesões", rehabilitation:"Reabilitação",
  shoulder:"Treino de Ombro", elbow:"Treino de Cotovelo", wrist:"Treino de Punho",
  knee:"Treino de Joelho", recovery:"Recuperação", activation:"Ativação", breathing:"Respiração"
};
export const AGGRESSIVE_CATS = new Set(["strength","explosiveness","jumps","speed","agility"]);

export const PAIN_ZONES = [
  {id:"shoulder", label:"Ombro", rehab:"shoulder"},
  {id:"elbow", label:"Cotovelo", rehab:"elbow"},
  {id:"wrist", label:"Punho", rehab:"wrist"},
  {id:"back", label:"Costas", rehab:"rehabilitation"},
  {id:"calves", label:"Gémeos", rehab:"rehabilitation"},
  {id:"knee", label:"Joelho", rehab:"knee"},
  {id:"hip", label:"Anca", rehab:"rehabilitation"},
];

export const EQUIPMENT = [
  {id:"bands", label:"Elásticos"}, {id:"dumbbells", label:"Halteres"},
  {id:"bike", label:"Bicicleta"}, {id:"medicineBall", label:"Bola medicinal"},
  {id:"ladder", label:"Escadas"}, {id:"fingerBand", label:"Elástico de Dedos"},
  {id:"cones", label:"Cones"}, {id:"foamRoller", label:"Rolo de EVA"},
  {id:"tens", label:"TENS / Eletroestimulador"},
  {id:"bodyweight", label:"Apenas peso corporal"},
];

export const TIME_OPTIONS = [10,20,30,45,60];

export const PLAYING_TODAY = [
  {id:"none", label:"Não"}, {id:"lesson", label:"Aula"}, {id:"casual", label:"Jogo casual"},
  {id:"tournament", label:"Torneio"}, {id:"intense", label:"Treino intenso"},
];

export const YESTERDAY = [
  {id:"none", label:"Não"}, {id:"light", label:"Sim (leve)"}, {id:"intense", label:"Sim (intenso)"},
];

export const GOALS = [
  {id:"explosiveness", label:"Melhorar explosão", favors:["explosiveness","jumps","speed"]},
  {id:"endurance", label:"Melhorar resistência", favors:["agility","footwork","speed"]},
  {id:"injuryPrevention", label:"Evitar lesões", favors:["injuryPrevention","stability","mobility"]},
  {id:"weightLoss", label:"Perder peso", favors:["agility","explosiveness","footwork"]},
  {id:"strength", label:"Ganhar força", favors:["strength","core"]},
  {id:"speed", label:"Melhorar velocidade", favors:["speed","agility","footwork"]},
  {id:"recovery", label:"Melhorar recuperação", favors:["recovery","mobility","stretching"]},
  {id:"mobility", label:"Melhorar mobilidade", favors:["mobility","stretching","balance"]},
];

function ex(id: string, name: string, desc: string, goal: string, duration: number, sets: number, reps: string | number, rest: number, diff: "beginner" | "intermediate" | "advanced", equip: string[], cats: string[]): Exercise {
  return {id,name,desc,goal,duration,sets,reps,rest,diff,equip,cats};
}

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
];

export function exerciseById(id: string): Exercise | undefined { 
  return EXERCISES.find(e => e.id === id); 
}