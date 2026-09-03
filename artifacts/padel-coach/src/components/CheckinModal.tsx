import { useState } from 'react';

import {
  DURATION_OPTIONS,
  ENERGY_LEVELS,
  EQUIPMENT,
  FATIGUE_LEVELS,
  PAIN_ONSET,
  PAIN_TREND,
  PAIN_WHEN,
  PAIN_ZONES,
  PLAYING_TODAY,
  SLEEP_QUALITY,
  SORENESS_LEVELS,
  TIME_OPTIONS,
  YESTERDAY_ACTIVITIES,
} from '../data/exercises';
import {
  SORENESS_WEIGHT,
  emptyCheckin,
  redFlagsFor,
  type Checkin,
  type Injury,
  type SorenessLevel,
} from '../engine/checkin';
import { todayKey, useStore } from '../store/useStore';
import { Modal } from './Modal';
import { ChipChoice, Field, MultiChip, SegChoice, Slider } from './fields';

const HOUR_OPTIONS = ['1', '1.5', '2', '2.5', '3+'].map((h) => ({ id: h, label: `${h}h` }));
const SLEEP_HOURS = [4, 5, 6, 7, 8, 9, 10].map((h) => ({ id: h, label: `${h}h` }));
const TIME_CHOICES = TIME_OPTIONS.map((t) => ({ id: t, label: t === 60 ? '60+' : String(t) }));
const DURATION_CHOICES = DURATION_OPTIONS.map((m) => ({ id: m, label: `${m}m` }));

function newInjury(zone: string): Injury {
  return { zone, intensity: 5, onset: 'days', when: 'movement', trigger: '', trend: 'same' };
}

interface CheckinModalProps {
  existing: Checkin | null;
  onSubmit: (checkin: Checkin) => void;
  onClose: () => void;
}

export function CheckinModal({ existing, onSubmit, onClose }: CheckinModalProps) {
  const { profile } = useStore();
  const [form, setForm] = useState<Checkin>(
    () =>
      existing ??
      emptyCheckin(todayKey(), { time: profile.usualTime, equipment: profile.equipment }),
  );

  const set = <K extends keyof Checkin>(key: K, value: Checkin[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggle = (key: 'muscularZones' | 'equipment', id: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(id) ? f[key].filter((x) => x !== id) : [...f[key], id],
    }));

  const toggleInjuryZone = (zone: string) =>
    setForm((f) => ({
      ...f,
      injuries: f.injuries.some((i) => i.zone === zone)
        ? f.injuries.filter((i) => i.zone !== zone)
        : [...f.injuries, newInjury(zone)],
    }));

  const updateInjury = (zone: string, patch: Partial<Injury>) =>
    setForm((f) => ({
      ...f,
      injuries: f.injuries.map((i) => (i.zone === zone ? { ...i, ...patch } : i)),
    }));

  const setSoreness = (level: SorenessLevel) =>
    setForm((f) => ({
      ...f,
      soreness: level,
      // A intensidade acompanha o nível escolhido, senão dizer "fortes" e
      // deixar o slider a meio dava respostas contraditórias. Continua a poder
      // ser afinada à mão a seguir.
      sorenessIntensity: SORENESS_WEIGHT[level],
      // Voltar a "não tenho dores" limpa as zonas, para não ficarem dados de
      // uma resposta que já não se aplica.
      muscularZones: level === 'none' ? [] : f.muscularZones,
    }));

  const submit = () =>
    onSubmit({
      ...form,
      date: todayKey(),
      equipment: form.equipment.length ? form.equipment : ['bodyweight'],
    });

  const playsToday = form.playingToday !== 'none';
  const hasSoreness = form.soreness !== 'none';
  const didSomethingYesterday = form.yesterday.type !== 'none';
  const redFlags = redFlagsFor(form);

  return (
    <Modal onClose={onClose}>
      <h2 style={{ margin: '0 0 18px' }}>Check-in diário</h2>

      <Field label="Hoje vou jogar padel?">
        <ChipChoice
          options={PLAYING_TODAY}
          value={form.playingToday}
          onChange={(v) => set('playingToday', v)}
        />
      </Field>

      {playsToday && (
        <Field label="Quantas horas vais jogar hoje?">
          <SegChoice options={HOUR_OPTIONS} value={form.hours} onChange={(v) => set('hours', v)} />
        </Field>
      )}

      <div className="section-title">Sono</div>

      <Field label="Quantas horas dormiste?">
        <SegChoice
          options={SLEEP_HOURS}
          value={form.sleepHours}
          onChange={(v) => set('sleepHours', v)}
        />
      </Field>

      <Field label="Como classificas a qualidade do sono?">
        <ChipChoice
          options={SLEEP_QUALITY.map((o) => ({ id: Number(o.id), label: o.label }))}
          value={form.sleepQuality}
          onChange={(v) => set('sleepQuality', v)}
        />
      </Field>

      <div className="section-title">Como te sentes</div>

      <Field label="Como está a tua energia hoje?">
        <ChipChoice
          options={ENERGY_LEVELS.map((o) => ({ id: Number(o.id), label: o.label }))}
          value={form.energy}
          onChange={(v) => set('energy', v)}
        />
      </Field>

      <Field label="Quão cansado estás hoje?">
        <ChipChoice
          options={FATIGUE_LEVELS.map((o) => ({ id: Number(o.id), label: o.label }))}
          value={form.fatigue}
          onChange={(v) => set('fatigue', v)}
        />
      </Field>

      <Field label="Tens dores musculares?">
        <ChipChoice options={SORENESS_LEVELS} value={form.soreness} onChange={setSoreness} />
      </Field>

      {hasSoreness && (
        <>
          <Slider
            label="Intensidade da dor muscular"
            value={form.sorenessIntensity}
            suffix="/10"
            onChange={(v) => set('sorenessIntensity', v)}
          />
          <Field label="Em que zonas?" hint="Opcional — ajuda a escolher alongamentos certos.">
            <MultiChip
              className="muscular-zones"
              options={PAIN_ZONES}
              values={form.muscularZones}
              onToggle={(id) => toggle('muscularZones', id)}
            />
          </Field>
        </>
      )}

      <div className="section-title">Ontem</div>

      <Field label="Fizeste alguma atividade física ontem?">
        <ChipChoice
          options={YESTERDAY_ACTIVITIES}
          value={form.yesterday.type}
          onChange={(v) =>
            set('yesterday', {
              ...form.yesterday,
              type: v,
              minutes: v === 'none' ? 0 : form.yesterday.minutes || 60,
            })
          }
        />
      </Field>

      {didSomethingYesterday && (
        <>
          <Field label="Durante quanto tempo?">
            <SegChoice
              options={DURATION_CHOICES}
              value={form.yesterday.minutes}
              onChange={(v) => set('yesterday', { ...form.yesterday, minutes: v })}
            />
          </Field>
          <Slider
            label="Quão intenso foi?"
            value={form.yesterday.rpe}
            min={1}
            suffix="/10"
            onChange={(v) => set('yesterday', { ...form.yesterday, rpe: v })}
          />
        </>
      )}

      <div className="section-title">Dor</div>

      <Field
        label="Tens alguma dor que não pareça apenas dor muscular?"
        hint="Escolhe as zonas onde sentes esse tipo de dor. Se não tiveres, não escolhas nenhuma."
      >
        <MultiChip
          className="pain-zones"
          options={PAIN_ZONES}
          values={form.injuries.map((i) => i.zone)}
          onToggle={toggleInjuryZone}
        />
      </Field>

      {form.injuries.map((injury) => (
        <InjuryDetail
          key={injury.zone}
          injury={injury}
          onChange={(patch) => updateInjury(injury.zone, patch)}
        />
      ))}

      {redFlags.length > 0 && <RedFlagWarning flags={redFlags} />}

      <div className="section-title">Hoje</div>

      <Field label="Quanto tempo tenho hoje?">
        <SegChoice options={TIME_CHOICES} value={form.time} onChange={(v) => set('time', v)} />
      </Field>

      <Field label="Material disponível">
        <MultiChip
          options={EQUIPMENT}
          values={form.equipment}
          onToggle={(id) => toggle('equipment', id)}
        />
      </Field>

      <button className="btn btn-primary" onClick={submit}>
        Gerar Plano
      </button>
    </Modal>
  );
}

function InjuryDetail({
  injury,
  onChange,
}: {
  injury: Injury;
  onChange: (patch: Partial<Injury>) => void;
}) {
  const label = PAIN_ZONES.find((z) => z.id === injury.zone)?.label ?? injury.zone;

  return (
    <div className="card" style={{ borderColor: 'rgba(255,122,102,0.3)' }}>
      <b style={{ color: 'var(--coral)', fontSize: '0.9rem' }}>{label}</b>
      <div style={{ marginTop: 12 }}>
        <Slider
          label="Intensidade da dor"
          value={injury.intensity}
          suffix="/10"
          onChange={(v) => onChange({ intensity: v })}
        />
        <Field label="Quando começou?">
          <SegChoice
            options={PAIN_ONSET}
            value={injury.onset}
            onChange={(v) => onChange({ onset: v as Injury['onset'] })}
          />
        </Field>
        <Field label="Aparece em repouso ou só em movimento?">
          <SegChoice
            options={PAIN_WHEN}
            value={injury.when}
            onChange={(v) => onChange({ when: v as Injury['when'] })}
          />
        </Field>
        <Field label="Está a piorar ou a melhorar?">
          <SegChoice
            options={PAIN_TREND}
            value={injury.trend}
            onChange={(v) => onChange({ trend: v as Injury['trend'] })}
          />
        </Field>
        <Field label="Algum movimento em concreto a provoca?" hint="Opcional.">
          <input
            className="lib-search"
            style={{ marginBottom: 0 }}
            placeholder="Ex. remate, rotação do tronco…"
            value={injury.trigger}
            onChange={(e) => onChange({ trigger: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}

/**
 * Aviso mostrado ainda dentro do formulário, para a pessoa o ver antes de gerar
 * o plano — e não só depois, quando já está à espera de exercícios.
 */
function RedFlagWarning({ flags }: { flags: string[] }) {
  return (
    <div className="card alert">
      <b style={{ color: 'var(--coral)', fontSize: '0.88rem' }}>
        ⚠ Vale a pena falar com um profissional
      </b>
      {flags.map((f, i) => (
        <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 6 }}>
          · {f}
        </div>
      ))}
      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 10 }}>
        A app continua a sugerir-te um plano suave, mas nenhum exercício substitui uma avaliação
        médica ou de fisioterapia quando a dor é destas.
      </div>
    </div>
  );
}
