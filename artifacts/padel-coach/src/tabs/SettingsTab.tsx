import React, { useRef } from 'react';
import { useStore, todayKey } from '../store/useStore';
import { GOALS } from '../data/exercises';
import { useToast } from '@/hooks/use-toast';

export function SettingsTab() {
  const { data, updateData } = useStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleGoal = (id: string) => {
    const newData = { ...data };
    if (newData.goals.includes(id)) {
      newData.goals = newData.goals.filter(g => g !== id);
    } else {
      newData.goals.push(id);
    }
    updateData(newData);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `padel-coach-backup-${todayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const resetData = () => {
    if (!window.confirm('Apagar todos os check-ins, planos e histórico?')) return;
    updateData({ checkins: {}, plans: {}, logs: {}, goals: ["injuryPrevention"] });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!parsed.checkins || !parsed.plans || !parsed.logs) {
          throw new Error('formato inválido');
        }
        updateData(parsed);
        toast({
          description: "Dados importados com sucesso.",
          className: "bg-[#1E434C] text-[#EFF6F1] border border-[rgba(216,255,62,0.14)]"
        });
      } catch (err) {
        toast({
          description: "Este ficheiro não é um backup válido do Padel Coach AI.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="text-[0.72rem] uppercase tracking-[0.09em] text-[#6C8985] font-bold m-0 mb-2.5">
        Objetivos de treino
      </div>
      <p className="text-[0.82rem] text-[#9CB8B4] m-0 mb-3.5">
        O plano diário prioriza exercícios alinhados com estes objetivos, sempre que a condição física do dia permitir.
      </p>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {GOALS.map(g => (
          <button 
            key={g.id}
            onClick={() => toggleGoal(g.id)}
            className={`inline-flex items-center px-3.5 py-2 rounded-full text-[0.82rem] font-semibold border ${data.goals.includes(g.id) ? 'bg-[#D8FF3E] text-[#12210A] border-[#D8FF3E]' : 'bg-white/5 text-[#9CB8B4] border-transparent'}`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="text-[0.72rem] uppercase tracking-[0.09em] text-[#6C8985] font-bold mb-2.5">
        Dados
      </div>
      <div className="bg-[#173840] border border-white/5 rounded-[18px] p-4 mb-3 flex items-center justify-between">
        <span className="text-[0.85rem]">Check-ins guardados</span>
        <span className="font-display font-bold">{Object.keys(data.checkins).length}</span>
      </div>
      
      <button 
        onClick={resetData}
        className="w-full bg-[#FF7A66]/10 text-[#FF7A66] font-display font-bold text-[0.92rem] py-3.5 px-5 rounded-full flex items-center justify-center mt-3"
      >
        Apagar todos os dados
      </button>
      
      <button 
        onClick={exportData}
        className="w-full bg-white/5 text-[#EFF6F1] font-display font-bold text-[0.92rem] py-3.5 px-5 rounded-full flex items-center justify-center mt-2.5"
      >
        Exportar dados (backup)
      </button>
      
      <label className="w-full bg-white/5 text-[#EFF6F1] font-display font-bold text-[0.92rem] py-3.5 px-5 rounded-full flex items-center justify-center mt-2.5 cursor-pointer">
        Importar dados
        <input 
          type="file" 
          accept="application/json" 
          ref={fileInputRef}
          onChange={handleImport}
          className="hidden" 
        />
      </label>

      <div className="text-[0.72rem] uppercase tracking-[0.09em] text-[#6C8985] font-bold mt-6 mb-2.5">
        Sobre
      </div>
      <div className="bg-[#173840] border border-white/5 rounded-[18px] p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <b>Padel Coach AI</b>
          <span className="text-[#9CB8B4] text-[0.8rem]">Web · 1.0</span>
        </div>
        <p className="text-[0.8rem] text-[#9CB8B4] m-0">
          App de treino pessoal para padel. Todas as recomendações são geradas por regras locais — sem IA online, sem contas. Os dados ficam guardados neste dispositivo.
        </p>
      </div>
    </>
  );
}