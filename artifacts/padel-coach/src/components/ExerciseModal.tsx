import React from 'react';
import { BottomSheet } from './BottomSheet';
import { CATEGORY_LABEL, EQUIPMENT, Exercise } from '../data/exercises';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise | null;
}

export function ExerciseModal({ isOpen, onClose, exercise }: Props) {
  if (!exercise) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-wrap gap-2 mb-2.5">
        {exercise.cats.map(c => (
          <span key={c} className="inline-block text-[0.66rem] font-bold px-2 py-1 rounded-md bg-white/10 text-[#9CB8B4]">
            {CATEGORY_LABEL[c]}
          </span>
        ))}
      </div>
      
      <h2 className="m-0 mb-1">{exercise.name}</h2>
      
      <div className="text-[#6C8985] text-[0.78rem] mb-[18px] capitalize">
        {exercise.diff}
      </div>
      
      <div className="grid grid-cols-2 gap-2.5 mb-[18px]">
        <div className="bg-[#173840] rounded-[12px] p-3.5">
          <div className="font-display text-[1.4rem] font-bold">{exercise.sets}</div>
          <div className="text-[0.72rem] text-[#9CB8B4] mt-0.5">Séries</div>
        </div>
        <div className="bg-[#173840] rounded-[12px] p-3.5">
          <div className="font-display text-[1.4rem] font-bold">{exercise.reps}</div>
          <div className="text-[0.72rem] text-[#9CB8B4] mt-0.5">Repetições</div>
        </div>
        <div className="bg-[#173840] rounded-[12px] p-3.5">
          <div className="font-display text-[1.4rem] font-bold">{exercise.rest}s</div>
          <div className="text-[0.72rem] text-[#9CB8B4] mt-0.5">Descanso</div>
        </div>
        <div className="bg-[#173840] rounded-[12px] p-3.5">
          <div className="font-display text-[1.4rem] font-bold">{exercise.duration}m</div>
          <div className="text-[0.72rem] text-[#9CB8B4] mt-0.5">Duração</div>
        </div>
      </div>
      
      <div className="text-[0.72rem] uppercase tracking-[0.09em] text-[#6C8985] font-bold mb-2.5">Descrição</div>
      <p className="text-[0.88rem] text-[#9CB8B4] m-0 mb-3.5">{exercise.desc}</p>
      
      <div className="text-[0.72rem] uppercase tracking-[0.09em] text-[#6C8985] font-bold mb-2.5">Objetivo</div>
      <p className="text-[0.88rem] text-[#9CB8B4] m-0 mb-3.5">{exercise.goal}</p>
      
      <div className="text-[0.72rem] uppercase tracking-[0.09em] text-[#6C8985] font-bold mb-2.5">Equipamento</div>
      <div className="flex flex-wrap gap-2">
        {exercise.equip.map(eq => (
          <span key={eq} className="inline-block text-[0.66rem] font-bold px-2 py-1 rounded-md bg-white/10 text-[#9CB8B4]">
            {EQUIPMENT.find(x => x.id === eq)?.label || eq}
          </span>
        ))}
      </div>
    </BottomSheet>
  );
}