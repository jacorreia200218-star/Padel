import { useState } from 'react';

import {
  EQUIPMENT,
  PAIN_ZONES,
  PLAYING_TODAY,
  TIME_OPTIONS,
  YESTERDAY,
  YESTERDAY_TRAINING,
} from '../data/exercises';
import type { Checkin, PainState } from '../engine/planner';
import { todayKey } from '../store/useStore';
import { Modal } from './Modal';

const HOUR_OPTIONS = ['1', '1.5', '2', '2.5', '3+'];

function emptyForm(date: string): Checkin {
  return {
    date,
    playingToday: 'none',
    hours: '1.5',
    playedYesterday: 'none',
    yesterdayTraining: 'none',
    energy: 5,
    soreness: 2,
    fatigue: 4,
    sleep: 6,
    painZones: {},
    time: 30,
    equipment: ['bodyweight'],
  };
}

/** Ciclo de estados de uma zona: nada → cansaço muscular → dor → nada. */
function nextPainState(cur: PainState | undefined): PainState | undefined {
  if (!cur) return 'muscular';
  if (cur === 'muscular') return 'dor';
  return undefined;
}

interface CheckinModalProps {
  existing: Checkin | null;
  onSubmit: (checkin: Checkin) => void;
  onClose: () => void;
}

export function CheckinModal({ existing, onSubmit, onClose }: CheckinModalProps) {
  const [form, setForm] = useState<Checkin>(() => existing ?? emptyForm(todayKey()));

  const set = <K extends keyof Checkin>(key: K, value: Checkin[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const togglePainZone = (zoneId: string) =>
    setForm((f) => {
      const zones = { ...f.painZones };
      const next = nextPainState(zones[zoneId]);
      if (next) zones[zoneId] = next;
      else delete zones[zoneId];
      return { ...f, painZones: zones };
    });

  const toggleEquipment = (id: string) =>
    setForm((f) => ({
      ...f,
      equipment: f.equipment.includes(id)
        ? f.equipment.filter((x) => x !== id)
        : [...f.equipment, id],
    }));

  const submit = () =>
    onSubmit({
      ...form,
      date: todayKey(),
      equipment: form.equipment.length ? form.equipment : ['bodyweight'],
    });

  const playsToday = form.playingToday !== 'none';

  return (
    <Modal onClose={onClose}>
      <h2 style={{ margin: '0 0 18px' }}>Check-in diário</h2>

      <label className="field-label">Hoje vou jogar padel?</label>
      <div className="chip-row" style={{ marginBottom: 20 }}>
        {PLAYING_TODAY.map((o) => (
          <span
            key={o.id}
            className={`chip ${o.id === form.playingToday ? 'selected' : ''}`}
            onClick={() => set('playingToday', o.id)}
          >
            {o.label}
          </span>
        ))}
      </div>

      {playsToday && (
        <div style={{ marginBottom: 20 }}>
          <label className="field-label">Quantas horas vais jogar hoje?</label>
          <div className="segmented">
            {HOUR_OPTIONS.map((h) => (
              <span
                key={h}
                className={`seg ${h === form.hours ? 'selected' : ''}`}
                onClick={() => set('hours', h)}
              >
                {h}h
              </span>
            ))}
          </div>
        </div>
      )}

      <label className="field-label">Ontem joguei?</label>
      <div className="segmented" style={{ marginBottom: 20 }}>
        {YESTERDAY.map((o) => (
          <span
            key={o.id}
            className={`seg ${o.id === form.playedYesterday ? 'selected' : ''}`}
            onClick={() => set('playedYesterday', o.id)}
          >
            {o.label}
          </span>
        ))}
      </div>

      <label className="field-label">Que tipo de treino fizeste ontem (além do padel)?</label>
      <div className="chip-row" style={{ marginBottom: 20 }}>
        {YESTERDAY_TRAINING.map((o) => (
          <span
            key={o.id}
            className={`chip ${o.id === form.yesterdayTraining ? 'selected' : ''}`}
            onClick={() => set('yesterdayTraining', o.id)}
          >
            {o.label}
          </span>
        ))}
      </div>

      <label className="field-label">Como me sinto hoje</label>
      <SliderRow label="Energia" value={form.energy} onChange={(v) => set('energy', v)} />
      <SliderRow label="Dor muscular" value={form.soreness} onChange={(v) => set('soreness', v)} />
      <SliderRow label="Cansaço" value={form.fatigue} onChange={(v) => set('fatigue', v)} />
      <SliderRow label="Qualidade do sono" value={form.sleep} onChange={(v) => set('sleep', v)} />

      <label className="field-label" style={{ marginTop: 6 }}>
        Dor ou cansaço muscular em alguma zona?
      </label>
      <div style={{ fontSize: '0.74rem', color: 'var(--text-faint)', margin: '-6px 0 10px' }}>
        Toca uma vez para &quot;cansaço muscular&quot;, duas vezes para &quot;dor&quot;. Toca outra
        vez para limpar.
      </div>
      <div className="chip-row pain-zones" style={{ marginBottom: 20 }}>
        {PAIN_ZONES.map((z) => {
          const state = form.painZones[z.id];
          const cls = state === 'dor' ? 'selected' : state === 'muscular' ? 'muscular' : '';
          const suffix = state === 'dor' ? ' · dor' : state === 'muscular' ? ' · cansaço' : '';
          return (
            <span key={z.id} className={`chip ${cls}`} onClick={() => togglePainZone(z.id)}>
              {z.label}
              {suffix}
            </span>
          );
        })}
      </div>

      <label className="field-label">Quanto tempo tenho hoje?</label>
      <div className="segmented" style={{ marginBottom: 20 }}>
        {TIME_OPTIONS.map((t) => (
          <span
            key={t}
            className={`seg ${t === form.time ? 'selected' : ''}`}
            onClick={() => set('time', t)}
          >
            {t === 60 ? '60+' : t}
          </span>
        ))}
      </div>

      <label className="field-label">Material disponível</label>
      <div className="chip-row" style={{ marginBottom: 24 }}>
        {EQUIPMENT.map((eq) => (
          <span
            key={eq.id}
            className={`chip ${form.equipment.includes(eq.id) ? 'selected' : ''}`}
            onClick={() => toggleEquipment(eq.id)}
          >
            {eq.label}
          </span>
        ))}
      </div>

      <button className="btn btn-primary" onClick={submit}>
        Gerar Plano
      </button>
    </Modal>
  );
}

interface SliderRowProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, onChange }: SliderRowProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="row">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{label}</span>
        <span className="slider-value">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
