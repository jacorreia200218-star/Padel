import { useRef } from 'react';

import { ChipChoice, Field, MultiChip, SegChoice } from '../components/fields';
import { showToast } from '../components/Toast';
import { EQUIPMENT, GOALS, TIME_OPTIONS } from '../data/exercises';
import {
  DEFAULT_PROFILE,
  PADEL_FREQUENCY,
  PADEL_LEVELS,
  WEEK_DAYS,
  type Profile,
} from '../data/profile';
import { isInstalled } from '../pwa';
import { DEFAULT_DATA, migrate, saveData, todayKey, updateData, useStore } from '../store/useStore';

const TIME_CHOICES = TIME_OPTIONS.map((t) => ({ id: t, label: t === 60 ? '60+' : String(t) }));

export function ProfileTab() {
  const data = useStore();
  const profile = data.profile;
  const fileInput = useRef<HTMLInputElement>(null);

  const setProfile = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    updateData((d) => {
      d.profile[key] = value;
    });

  const toggleInProfile = (key: 'equipment' | 'availableDays', id: string) =>
    updateData((d) => {
      const list = d.profile[key];
      d.profile[key] = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    });

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
        // Um backup pode ter sido feito numa versão anterior do formato.
        saveData(
          migrate({ ...structuredClone(DEFAULT_DATA), ...parsed, version: parsed.version ?? 1 }),
        );
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
        Sobre ti
      </div>

      <Field label="Nome">
        <input
          className="lib-search"
          style={{ marginBottom: 0 }}
          placeholder="Como te chamas"
          value={profile.name}
          onChange={(e) => setProfile('name', e.target.value)}
        />
      </Field>

      <div className="measure-row">
        <NumberField
          label="Idade"
          suffix="anos"
          value={profile.age}
          onChange={(v) => setProfile('age', v)}
        />
        <NumberField
          label="Altura"
          suffix="cm"
          value={profile.height}
          onChange={(v) => setProfile('height', v)}
        />
        <NumberField
          label="Peso"
          suffix="kg"
          value={profile.weight}
          onChange={(v) => setProfile('weight', v)}
        />
      </div>

      <div className="section-title">Padel</div>

      <Field label="Nível">
        <ChipChoice
          options={PADEL_LEVELS}
          value={profile.level}
          onChange={(v) => setProfile('level', v)}
        />
      </Field>

      <Field label="Quantas vezes jogas por semana?">
        <SegChoice
          options={PADEL_FREQUENCY}
          value={profile.padelFrequency}
          onChange={(v) => setProfile('padelFrequency', v)}
        />
      </Field>

      <div className="section-title">Objetivos de treino</div>
      <p className="body-text">
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

      <div className="section-title">Disponibilidade</div>
      <p className="body-text">Serve de ponto de partida no check-in — dá sempre para mudar no dia.</p>

      <Field label="Dias em que costumas poder treinar">
        <MultiChip
          options={WEEK_DAYS}
          values={profile.availableDays}
          onToggle={(id) => toggleInProfile('availableDays', id)}
        />
      </Field>

      <Field label="Quanto tempo costumas ter?">
        <SegChoice
          options={TIME_CHOICES}
          value={profile.usualTime}
          onChange={(v) => setProfile('usualTime', v)}
        />
      </Field>

      <Field label="Material que tens">
        <MultiChip
          options={EQUIPMENT}
          values={profile.equipment}
          onToggle={(id) => toggleInProfile('equipment', id)}
        />
      </Field>

      <div className="section-title">Historial</div>
      <Field
        label="Lesões ou queixas antigas relevantes"
        hint="Só para tua memória — a app não usa este texto para decidir nada."
      >
        <textarea
          className="lib-search textarea"
          placeholder="Ex. entorse do tornozelo direito em 2024, cotovelo sensível desde o verão…"
          value={profile.injuryHistory}
          onChange={(e) => setProfile('injuryHistory', e.target.value)}
        />
      </Field>

      <div className="section-title">Dados</div>
      {!isInstalled() && <InstallHint />}
      <div className="card row">
        <span style={{ fontSize: '0.85rem' }}>Check-ins guardados</span>
        <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700 }}>
          {Object.keys(data.checkins).length}
        </span>
      </div>
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
      <button className="btn btn-danger" style={{ marginTop: 10 }} onClick={resetData}>
        Apagar todos os dados
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
          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Web · 2.0</span>
        </div>
        <p className="body-text" style={{ margin: 0 }}>
          App de treino pessoal para padel. Todas as recomendações são geradas por regras locais —
          sem IA online, sem contas, sem servidor. Os dados ficam guardados neste dispositivo.
        </p>
      </div>

      <p className="disclaimer">
        Esta aplicação fornece orientação geral de exercício e não substitui avaliação médica ou
        fisioterapêutica.
      </p>
    </>
  );
}

function NumberField({
  label,
  suffix,
  value,
  onChange,
}: {
  label: string;
  suffix: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="measure-input">
        <input
          type="number"
          inputMode="numeric"
          placeholder="—"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        />
        <span>{suffix}</span>
      </div>
    </div>
  );
}

/**
 * O aviso mais útil da app para quem usa iPhone: sem estar no ecrã principal,
 * o sistema apaga os dados guardados de sites que não são visitados há uns dias.
 */
function InstallHint() {
  return (
    <div className="card alert" style={{ marginBottom: 12 }}>
      <b style={{ color: 'var(--coral)', fontSize: '0.85rem' }}>Adiciona ao ecrã principal</b>
      <p className="body-text" style={{ marginTop: 8, marginBottom: 0 }}>
        Os teus dados ficam só neste telemóvel. Se abrires a app pelo browser e passares alguns
        dias sem entrar, o iPhone pode apagá-los sozinho. No Safari: botão de partilha →{' '}
        <b>Adicionar ao ecrã principal</b>. A partir daí deixa de acontecer, e a app abre sem rede.
      </p>
    </div>
  );
}
