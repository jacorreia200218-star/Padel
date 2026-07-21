import { EXERCISES, PAIN_ZONES, AGGRESSIVE_CATS, GOALS } from '../data/exercises';
import type { Exercise } from '../data/exercises';

export interface Checkin {
  date: string;
  playingToday: string;
  playedYesterday: string;
  energy: number;
  soreness: number;
  fatigue: number;
  sleep: number;
  pain: string[];
  time: number;
  equipment: string[];
}

export interface Plan {
  date: string;
  planType: string;
  focus: string[];
  exerciseIds: string[];
  reasoning: string[];
  duration: number;
  completed: boolean;
}

export function generatePlan(checkin: Checkin, goalIds: string[]): Plan {
  const reasoning: string[] = [];
  let excluded = new Set<string>();
  let forced = new Set<string>();

  if(checkin.pain.length){
    const zoneLabels = checkin.pain.map(p => PAIN_ZONES.find(z => z.id === p)?.label).join(", ");
    reasoning.push(`Dor reportada em ${zoneLabels}: a evitar exercícios agressivos, priorizando reabilitação.`);
    AGGRESSIVE_CATS.forEach(c => excluded.add(c));
    checkin.pain.forEach(p => {
      const z = PAIN_ZONES.find(z => z.id === p);
      if (z) forced.add(z.rehab);
    });
  }
  
  const highFatigue = checkin.fatigue >= 8, highSoreness = checkin.soreness >= 8, poorSleep = checkin.sleep <= 3;
  if(highFatigue || highSoreness || poorSleep){
    reasoning.push("Sinais de fadiga elevada, dor muscular alta ou sono fraco: prioridade para recuperação.");
    AGGRESSIVE_CATS.forEach(c => excluded.add(c));
  }

  let planType = "Treino Equilibrado";
  let focus: string[] = [];
  const playsToday = checkin.playingToday !== "none";
  const highStakes = checkin.playingToday === "tournament";

  if(highStakes){
    planType = "Ativação Pré-Jogo";
    focus = ["mobility","activation","stretching","breathing"];
    reasoning.push("Torneio hoje: apenas mobilidade, ativação, alongamentos e respiração — sem carga nova.");
  } else if(checkin.pain.length){
    planType = "Reabilitação";
    focus = ["rehabilitation","mobility","stretching", ...Array.from(forced)];
    if(playsToday) focus.push("activation");
  } else if(checkin.playedYesterday === "intense" && playsToday){
    planType = "Recuperação";
    focus = ["mobility","stretching","recovery","activation"];
    reasoning.push("Jogaste intenso ontem e voltas a jogar hoje: recuperação ativa e ativação — sem força.");
  } else if(highFatigue || highSoreness || poorSleep){
    planType = "Recuperação";
    focus = ["recovery","mobility","stretching","breathing"];
  } else if(checkin.playedYesterday === "none" && !playsToday && checkin.energy >= 7){
    planType = "Força e Potência";
    focus = ["strength","explosiveness","core","balance"];
    reasoning.push("Descansaste ontem, não jogas hoje e a energia está alta: dia ideal para força, explosão e core.");
  } else if(playsToday){
    planType = "Manutenção Leve";
    focus = ["mobility","activation","footwork","stretching"];
    reasoning.push("Vais jogar hoje: ativação leve e footwork, mantendo o corpo fresco.");
  } else {
    planType = "Treino Equilibrado";
    focus = ["mobility","core","stability","agility"];
    reasoning.push("Dia sem jogo nem sinais de alarme: treino equilibrado.");
  }

  if(planType === "Treino Equilibrado" || planType === "Força e Potência"){
    const goalsChosen = GOALS.filter(g => goalIds.includes(g.id));
    goalsChosen.forEach(g => {
      g.favors.forEach(c => {
        if(!excluded.has(c) && !focus.includes(c)) focus.push(c);
      });
    });
    if(goalsChosen.length){
      reasoning.push("Ajustado aos objetivos definidos: " + goalsChosen.map(g => g.label).join(", ") + ".");
    }
  }

  focus = [...new Set(focus)].filter(c => !excluded.has(c));
  if(!focus.length) focus = ["mobility","stretching","breathing"];

  const equipSet = new Set(checkin.equipment.length ? checkin.equipment : ["bodyweight"]);
  let pool = EXERCISES.filter(e =>
    e.cats.some(c => focus.includes(c)) &&
    !e.cats.some(c => excluded.has(c)) &&
    (e.equip.every(eq => eq === "bodyweight") || e.equip.some(eq => equipSet.has(eq)))
  );

  let selected: Exercise[] = [];
  if(checkin.pain.length){
    checkin.pain.forEach(p => {
      const z = PAIN_ZONES.find(z => z.id === p);
      if (z) {
        const rehabCat = z.rehab;
        const match = pool.find(e => e.cats.includes(rehabCat) && !selected.includes(e));
        if(match) selected.push(match);
      }
    });
  }
  
  const targetCountMap: Record<number, number> = {10:2, 20:3, 30:5, 45:7, 60:9};
  const targetCount = targetCountMap[checkin.time] || 5;
  
  const restPool = pool.filter(e => !selected.includes(e)).sort((a,b) => {
    const ra = focus.findIndex(c => a.cats.includes(c)); 
    const rb = focus.findIndex(c => b.cats.includes(c));
    return (ra < 0 ? 99 : ra) - (rb < 0 ? 99 : rb);
  });
  
  for(const e of restPool){ 
    if(selected.length >= targetCount) break; 
    selected.push(e); 
  }
  
  if(!selected.length){
    selected = EXERCISES.filter(e => (e.cats.includes("mobility") || e.cats.includes("stretching")) && e.equip.every(x => x === "bodyweight")).slice(0, targetCount);
  }

  const duration = selected.reduce((s, e) => s + e.duration, 0);
  return {
    date: checkin.date,
    planType,
    focus,
    exerciseIds: selected.map(e => e.id),
    reasoning,
    duration,
    completed: false
  };
}

export function readinessScore(c: Checkin): number {
  return Math.round((((10 - c.fatigue) + (10 - c.soreness) + c.energy + c.sleep) / 4) * 10) / 10;
}
