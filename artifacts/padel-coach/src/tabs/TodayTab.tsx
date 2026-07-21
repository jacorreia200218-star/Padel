import React, { useState, useEffect } from 'react';
import { useStore, todayKey } from '../store/useStore';
import { generatePlan, readinessScore } from '../engine/planner';
import { CATEGORY_LABEL, exerciseById, Exercise } from '../data/exercises';
import { ReadinessRing } from '../components/ReadinessRing';
import { CheckinModal } from '../components/CheckinModal';
import { ExerciseModal } from '../components/ExerciseModal';

export function TodayTab() {
  const { data, updateData } = useStore();
  const [isCheckinOpen, setCheckinOpen] = useState(false);
  const [redoCheckin, setRedoCheckin] = useState(false);
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);

  const key = todayKey();
  const checkin = data.checkins[key];

  // Auto-generate plan if checkin exists but plan doesn't
  useEffect(() => {
    if (checkin && !data.plans[key]) {
      const plan = generatePlan(checkin, data.goals);
      const newData = { ...data };
      newData.plans[key] = plan;
      updateData(newData);
    }
  }, [checkin, data.plans[key]]);

  if (!checkin) {
    return (
      <>
        <div className="bg-[#1E434C] border border-white/5 rounded-[18px] p-4 mb-3 text-center py-[60px] px-5 text-[#9CB8B4]">
          <span className="text-[2.4rem] block mb-3.5 text-[#D8FF3E]">●</span>
          <h3 className="m-0 mb-2 text-[#EFF6F1]">Ainda sem check-in hoje</h3>
          <p className="m-0 mb-5 text-[0.88rem]">Responde a umas perguntas rápidas para gerar o teu plano do dia.</p>
          <button 
            onClick={() => { setRedoCheckin(false); setCheckinOpen(true); }}
            className="w-full bg-[#D8FF3E] text-[#12210A] font-display font-bold text-[0.92rem] py-3.5 px-5 rounded-full flex items-center justify-center"
          >
            Começar Check-in
          </button>
        </div>
        <CheckinModal isOpen={isCheckinOpen} onClose={() => setCheckinOpen(false)} />
      </>
    );
  }

  const plan = data.plans[key];
  if (!plan) {
    return <div className="text-center py-[60px] text-[#9CB8B4]">A gerar plano...</div>;
  }

  const rs = readinessScore(checkin);
  const pct = Math.max(0, Math.min(1, rs / 10));
  const exList = plan.exerciseIds.map(id => exerciseById(id)).filter((e): e is Exercise => Boolean(e));

  const completeToday = () => {
    const newData = { ...data };
    newData.plans[key].completed = true;
    newData.logs[key] = {
      date: key,
      didTrain: true,
      didPlayPadel: checkin.playingToday !== "none",
      padelHours: checkin.playingToday !== "none" ? 1.5 : 0,
      fatigue: checkin.fatigue,
      pain: checkin.pain.length,
      sleep: checkin.sleep,
      energy: checkin.energy
    };
    updateData(newData);
  };

  return (
    <>
      <div className="bg-[#1E434C] border border-white/5 rounded-[18px] p-4 mb-3">
        <div className="flex items-center gap-4">
          <ReadinessRing pct={pct} />
          <div>
            <div className="font-display text-[2rem] font-bold text-[#EFF6F1] leading-tight">{plan.planType}</div>
            <div className="text-[#9CB8B4] text-[0.8rem]">~{plan.duration} min · prontidão {rs}/10</div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5 mt-3.5">
          {plan.focus.map(c => (
            <span key={c} className="inline-block text-[0.66rem] font-bold px-2 py-1 rounded-md bg-white/10 text-[#9CB8B4]">
              {CATEGORY_LABEL[c]}
            </span>
          ))}
        </div>
        
        {plan.reasoning.length > 0 && (
          <>
            <div className="divider-lines" />
            {plan.reasoning.map((r, i) => (
              <div key={i} className="text-[0.78rem] text-[#9CB8B4] mb-1.5">✦ {r}</div>
            ))}
          </>
        )}
      </div>

      <div className="text-[0.72rem] uppercase tracking-[0.09em] text-[#6C8985] font-bold mt-5 mb-2.5 mx-0.5">
        Exercícios de hoje
      </div>
      
      {exList.map(e => (
        <div 
          key={e.id}
          onClick={() => setSelectedEx(e)}
          className="flex gap-3 items-center bg-[#173840] rounded-[12px] p-3 mb-2 cursor-pointer border border-white/5"
        >
          <div className="w-[42px] h-[42px] rounded-[12px] bg-[#D8FF3E]/10 flex items-center justify-center font-display font-bold text-[#D8FF3E] text-[0.95rem] shrink-0">
            {e.sets}×
          </div>
          <div className="flex-1">
            <div className="font-bold text-[0.9rem] text-[#EFF6F1]">{e.name}</div>
            <div className="text-[0.74rem] text-[#9CB8B4] mt-0.5">{e.reps} · descanso {e.rest}s</div>
          </div>
          <div className="text-[0.72rem] text-[#6C8985] font-display">{e.duration}m</div>
        </div>
      ))}

      {plan.completed ? (
        <div className="bg-[#173840] border border-white/5 rounded-[18px] p-4 text-center text-[#D8FF3E] font-bold mt-2">
          ✓ Dia concluído
        </div>
      ) : (
        <button 
          onClick={completeToday}
          className="w-full bg-[#D8FF3E] text-[#12210A] font-display font-bold text-[0.92rem] py-3.5 px-5 rounded-full flex items-center justify-center mt-2"
        >
          Marcar dia como concluído
        </button>
      )}
      
      <button 
        onClick={() => { setRedoCheckin(true); setCheckinOpen(true); }}
        className="w-full bg-white/5 text-[#EFF6F1] font-display font-bold text-[0.92rem] py-3.5 px-5 rounded-full flex items-center justify-center mt-2.5 mb-8"
      >
        Refazer check-in de hoje
      </button>

      <CheckinModal 
        isOpen={isCheckinOpen} 
        onClose={() => setCheckinOpen(false)} 
        existingCheckin={redoCheckin ? checkin : undefined} 
      />
      
      <ExerciseModal 
        isOpen={!!selectedEx} 
        onClose={() => setSelectedEx(null)} 
        exercise={selectedEx} 
      />
    </>
  );
}