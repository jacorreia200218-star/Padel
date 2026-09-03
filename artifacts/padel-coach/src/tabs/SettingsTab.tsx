import { useRef } from 'react';

import { showToast } from '../components/Toast';
import { GOALS } from '../data/exercises';
import { DEFAULT_DATA, saveData, todayKey, updateData, useStore } from '../store/useStore';

export function SettingsTab() {
  const data = useStore();
  const fileInput = useRef<HTMLInputElement>(null);

  const toggleGoal = (id: string) =>
    updateData((d) => {
      d.goals = d.goals.includes(id) ? d.goals.filter((g) => g !== id) : [...d.goals, id];
    });

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

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed.checkins || !parsed.plans || !parsed.logs) throw new Error('formato inválido');
        saveData({ ...structuredClone(DEFAULT_DATA), ...parsed });
        showToast('Dados importados com sucesso.');
      } catch {
        showToast('Este ficheiro não é um backup válido do Padel Coach AI.');
      }
    };
    reader.readAsText(file);
  };

  const resetData = () => {
    if (!confirm('Apagar todos os check-ins, planos e histórico?')) return;
    saveData(structuredClone(DEFAULT_DATA));
  };

  return (
    <>
      <div className="section-title" style={{ marginTop: 0 }}>
        Objetivos de treino
      </div>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: '0 0 14px' }}>
        O plano diário prioriza exercícios alinhados com estes objetivos, sempre que a condição
        física do dia permitir.
      </p>
      <div className="chip-row" style={{ marginBottom: 24 }}>
        {GOALS.map((g) => (
          <span
            key={g.id}
            className={`chip ${data.goals.includes(g.id) ? 'selected' : ''}`}
            onClick={() => toggleGoal(g.id)}
          >
            {g.label}
          </span>
        ))}
      </div>

      <div className="section-title">Dados</div>
      <div className="card row">
        <span style={{ fontSize: '0.85rem' }}>Check-ins guardados</span>
        <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700 }}>
          {Object.keys(data.checkins).length}
        </span>
      </div>
      <button className="btn btn-danger" style={{ marginTop: 12 }} onClick={resetData}>
        Apagar todos os dados
      </button>
      <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={exportData}>
        Exportar dados (backup)
      </button>
      <button
        className="btn btn-ghost"
        style={{ marginTop: 10 }}
        onClick={() => fileInput.current?.click()}
      >
        Importar dados
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) importData(file);
          e.target.value = '';
        }}
      />

      <div className="section-title">Sobre</div>
      <div className="card">
        <div className="row" style={{ marginBottom: 8 }}>
          <b>Padel Coach AI</b>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Web · 1.0</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>
          App de treino pessoal para padel. Todas as recomendações são geradas por regras locais —
          sem IA online, sem contas. Os dados ficam guardados neste dispositivo, neste Safari.
        </p>
      </div>
    </>
  );
}
