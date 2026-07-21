import React, { useState } from 'react';
import { useStore, todayKey, dateKey } from '../store/useStore';

export function HistoryTab() {
  const { data } = useStore();
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const shiftMonth = (delta: number) => {
    const newD = new Date(calMonth);
    newD.setMonth(newD.getMonth() + delta);
    setCalMonth(newD);
  };

  const y = calMonth.getFullYear();
  const m = calMonth.getMonth();
  const first = new Date(y, m, 1);
  const startPad = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const monthLabel = calMonth.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });

  const cells = [];
  for (let i = 0; i < startPad; i++) {
    cells.push(<div key={`pad-${i}`} />);
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(y, m, d);
    const key = dateKey(dateObj);
    const log = data.logs[key];
    const isToday = key === todayKey();
    
    let color = "transparent";
    if (log) {
      if (log.pain > 0) color = "var(--coral)";
      else if (log.didPlayPadel) color = "var(--sky)";
      else if (log.didTrain) color = "var(--accent)";
      else color = "var(--amber)";
    }
    
    cells.push(
      <div key={key} className={`aspect-square rounded-[10px] flex flex-col items-center justify-center text-[0.72rem] text-[#9CB8B4] bg-white/5 relative ${isToday ? 'outline outline-[1.5px] outline-[#D8FF3E]' : ''}`}>
        <span>{d}</span>
        <span className="w-[7px] h-[7px] rounded-full mt-[3px]" style={{ background: color }} />
      </div>
    );
  }

  return (
    <div className="bg-[#173840] border border-white/5 rounded-[18px] p-4 mb-3">
      <div className="flex items-center justify-between gap-2.5 mb-3.5">
        <button 
          onClick={() => shiftMonth(-1)}
          className="bg-white/5 text-[#EFF6F1] font-display font-bold text-[0.92rem] py-2 px-3.5 rounded-full flex items-center justify-center border-none"
        >
          ‹
        </button>
        <div className="font-bold capitalize">{monthLabel}</div>
        <button 
          onClick={() => shiftMonth(1)}
          className="bg-white/5 text-[#EFF6F1] font-display font-bold text-[0.92rem] py-2 px-3.5 rounded-full flex items-center justify-center border-none"
        >
          ›
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1.5">
        <div className="text-center text-[0.65rem] text-[#6C8985] font-bold mb-1">S</div>
        <div className="text-center text-[0.65rem] text-[#6C8985] font-bold mb-1">T</div>
        <div className="text-center text-[0.65rem] text-[#6C8985] font-bold mb-1">Q</div>
        <div className="text-center text-[0.65rem] text-[#6C8985] font-bold mb-1">Q</div>
        <div className="text-center text-[0.65rem] text-[#6C8985] font-bold mb-1">S</div>
        <div className="text-center text-[0.65rem] text-[#6C8985] font-bold mb-1">S</div>
        <div className="text-center text-[0.65rem] text-[#6C8985] font-bold mb-1">D</div>
        {cells}
      </div>
      
      <div className="flex flex-wrap gap-3.5 mt-4 text-[0.72rem] text-[#9CB8B4]">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#5AC0FF]"></span>Jogo</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#D8FF3E]"></span>Treino</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FFBB55]"></span>Descanso</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FF7A66]"></span>Dor</span>
      </div>
    </div>
  );
}