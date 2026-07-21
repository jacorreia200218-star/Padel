import React, { useState, useEffect } from 'react';
import { BottomSheet } from './BottomSheet';
import { PLAYING_TODAY, YESTERDAY, PAIN_ZONES, TIME_OPTIONS, EQUIPMENT } from '../data/exercises';
import { useStore, todayKey } from '../store/useStore';
import { generatePlan } from '../engine/planner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  existingCheckin?: any;
}

export function CheckinModal({ isOpen, onClose, existingCheckin }: Props) {
  const { data, updateData } = useStore();
  
  const [form, setForm] = useState({
    playingToday: "none",
    playedYesterday: "none",
    energy: 5,
    soreness: 2,
    fatigue: 4,
    sleep: 6,
    pain: [] as string[],
    time: 30,
    equipment: ["bodyweight"],
  });

  useEffect(() => {
    if (isOpen) {
      if (existingCheckin) {
        setForm(existingCheckin);
      } else {
        setForm({
          playingToday: "none",
          playedYesterday: "none",
          energy: 5,
          soreness: 2,
          fatigue: 4,
          sleep: 6,
          pain: [],
          time: 30,
          equipment: ["bodyweight"],
        });
      }
    }
  }, [isOpen, existingCheckin]);

  const togglePain = (id: string) => {
    setForm(prev => ({
      ...prev,
      pain: prev.pain.includes(id) ? prev.pain.filter(p => p !== id) : [...prev.pain, id]
    }));
  };

  const toggleEquipment = (id: string) => {
    setForm(prev => ({
      ...prev,
      equipment: prev.equipment.includes(id) ? prev.equipment.filter(e => e !== id) : [...prev.equipment, id]
    }));
  };

  const submit = () => {
    const key = todayKey();
    const equipment = form.equipment.length ? form.equipment : ["bodyweight"];
    const checkin = { ...form, date: key, equipment };
    
    const newData = { ...data };
    newData.checkins[key] = checkin;
    newData.plans[key] = generatePlan(checkin, data.goals);
    
    updateData(newData);
    onClose();
  };

  const SliderRow = ({ field, label, val }: { field: keyof typeof form, label: string, val: number }) => (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[0.85rem] text-[#9CB8B4]">{label}</span>
        <span className="font-display font-bold text-[#D8FF3E]">{val}</span>
      </div>
      <input 
        type="range" 
        min="1" 
        max="10" 
        value={val} 
        onChange={(e) => setForm(prev => ({ ...prev, [field]: parseInt(e.target.value) }))}
      />
    </div>
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h2 className="m-0 mb-[18px]">Check-in diário</h2>

      <label className="block text-[0.86rem] font-semibold text-[#EFF6F1] mb-2.5">Hoje vou jogar padel?</label>
      <div className="flex flex-wrap gap-2 mb-5">
        {PLAYING_TODAY.map(o => (
          <button 
            key={o.id}
            onClick={() => setForm(prev => ({ ...prev, playingToday: o.id }))}
            className={`inline-flex items-center px-3.5 py-2 rounded-full text-[0.82rem] font-semibold border ${form.playingToday === o.id ? 'bg-[#D8FF3E] text-[#12210A] border-[#D8FF3E]' : 'bg-white/5 text-[#9CB8B4] border-transparent'}`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <label className="block text-[0.86rem] font-semibold text-[#EFF6F1] mb-2.5">Ontem joguei?</label>
      <div className="flex bg-white/5 rounded-full p-1 gap-0.5 mb-5">
        {YESTERDAY.map(o => (
          <button 
            key={o.id}
            onClick={() => setForm(prev => ({ ...prev, playedYesterday: o.id }))}
            className={`flex-1 text-center py-2 px-1 rounded-full text-[0.76rem] font-semibold ${form.playedYesterday === o.id ? 'bg-[#D8FF3E] text-[#12210A]' : 'text-[#9CB8B4] hover:bg-white/5'}`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <label className="block text-[0.86rem] font-semibold text-[#EFF6F1] mb-2.5">Como me sinto hoje</label>
      <SliderRow field="energy" label="Energia" val={form.energy} />
      <SliderRow field="soreness" label="Dor muscular" val={form.soreness} />
      <SliderRow field="fatigue" label="Cansaço" val={form.fatigue} />
      <SliderRow field="sleep" label="Qualidade do sono" val={form.sleep} />

      <label className="block text-[0.86rem] font-semibold text-[#EFF6F1] mt-1.5 mb-2.5">Dor em alguma zona?</label>
      <div className="flex flex-wrap gap-2 mb-5">
        {PAIN_ZONES.map(z => (
          <button 
            key={z.id}
            onClick={() => togglePain(z.id)}
            className={`inline-flex items-center px-3.5 py-2 rounded-full text-[0.82rem] font-semibold border ${form.pain.includes(z.id) ? 'bg-[#D8FF3E] text-[#12210A] border-[#D8FF3E]' : 'bg-white/5 text-[#9CB8B4] border-transparent'}`}
          >
            {z.label}
          </button>
        ))}
      </div>

      <label className="block text-[0.86rem] font-semibold text-[#EFF6F1] mb-2.5">Quanto tempo tenho hoje?</label>
      <div className="flex bg-white/5 rounded-full p-1 gap-0.5 mb-5">
        {TIME_OPTIONS.map(t => (
          <button 
            key={t}
            onClick={() => setForm(prev => ({ ...prev, time: t }))}
            className={`flex-1 text-center py-2 px-1 rounded-full text-[0.76rem] font-semibold ${form.time === t ? 'bg-[#D8FF3E] text-[#12210A]' : 'text-[#9CB8B4] hover:bg-white/5'}`}
          >
            {t === 60 ? '60+' : t}
          </button>
        ))}
      </div>

      <label className="block text-[0.86rem] font-semibold text-[#EFF6F1] mb-2.5">Material disponível</label>
      <div className="flex flex-wrap gap-2 mb-6">
        {EQUIPMENT.map(eq => (
          <button 
            key={eq.id}
            onClick={() => toggleEquipment(eq.id)}
            className={`inline-flex items-center px-3.5 py-2 rounded-full text-[0.82rem] font-semibold border ${form.equipment.includes(eq.id) ? 'bg-[#D8FF3E] text-[#12210A] border-[#D8FF3E]' : 'bg-white/5 text-[#9CB8B4] border-transparent'}`}
          >
            {eq.label}
          </button>
        ))}
      </div>

      <button onClick={submit} className="w-full bg-[#D8FF3E] text-[#12210A] font-display font-bold text-[0.92rem] py-3.5 px-5 rounded-full flex items-center justify-center">
        Gerar Plano
      </button>
    </BottomSheet>
  );
}