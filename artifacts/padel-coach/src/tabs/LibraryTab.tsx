import React, { useState } from 'react';
import { CATEGORY_LABEL, EXERCISES, Exercise } from '../data/exercises';
import { ExerciseModal } from '../components/ExerciseModal';

export function LibraryTab() {
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);

  const cats = Object.keys(CATEGORY_LABEL);
  const filtered = EXERCISES.filter(e => {
    const matchCat = !filter || e.cats.includes(filter);
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <input 
        placeholder="Procurar exercício" 
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full p-3 px-3.5 rounded-[12px] border border-white/5 bg-[#173840] text-[#EFF6F1] text-[0.88rem] mb-3 outline-none focus:border-[#D8FF3E]/50 transition-colors"
      />
      
      <div className="flex gap-2 mb-4 overflow-x-auto flex-nowrap pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <button 
          onClick={() => setFilter(null)}
          className={`shrink-0 inline-flex items-center px-3.5 py-2 rounded-full text-[0.82rem] font-semibold border ${!filter ? 'bg-[#D8FF3E] text-[#12210A] border-[#D8FF3E]' : 'bg-white/5 text-[#9CB8B4] border-transparent'}`}
        >
          Todos
        </button>
        {cats.map(c => (
          <button 
            key={c}
            onClick={() => setFilter(c)}
            className={`shrink-0 inline-flex items-center px-3.5 py-2 rounded-full text-[0.82rem] font-semibold border ${filter === c ? 'bg-[#D8FF3E] text-[#12210A] border-[#D8FF3E]' : 'bg-white/5 text-[#9CB8B4] border-transparent'}`}
          >
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-[60px] px-5 text-[#9CB8B4]">Sem resultados.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(e => (
            <div 
              key={e.id}
              onClick={() => setSelectedEx(e)}
              className="flex gap-3 items-center bg-[#173840] rounded-[12px] p-3 cursor-pointer border border-white/5"
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
        </div>
      )}

      <ExerciseModal 
        isOpen={!!selectedEx} 
        onClose={() => setSelectedEx(null)} 
        exercise={selectedEx} 
      />
    </>
  );
}