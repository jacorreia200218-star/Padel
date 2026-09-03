/** Campos reutilizáveis do formulário de check-in. */

import type { Option } from '../data/exercises';

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label className="field-label" style={{ marginBottom: hint ? 4 : 10 }}>
        {label}
      </label>
      {hint && (
        <div style={{ fontSize: '0.74rem', color: 'var(--text-faint)', margin: '0 0 10px' }}>
          {hint}
        </div>
      )}
      {children}
    </div>
  );
}

interface ChoiceProps<T extends string | number> {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}

/** Uma escolha só, em pastilhas que passam à linha. */
export function ChipChoice<T extends string | number>({ options, value, onChange }: ChoiceProps<T>) {
  return (
    <div className="chip-row">
      {options.map((o) => (
        <span
          key={o.id}
          className={`chip ${o.id === value ? 'selected' : ''}`}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </span>
      ))}
    </div>
  );
}

/** Uma escolha só, em barra segmentada — para escalas curtas e ordenadas. */
export function SegChoice<T extends string | number>({ options, value, onChange }: ChoiceProps<T>) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <span
          key={o.id}
          className={`seg ${o.id === value ? 'selected' : ''}`}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </span>
      ))}
    </div>
  );
}

interface MultiChipProps {
  options: readonly Option[];
  values: string[];
  onToggle: (id: string) => void;
  className?: string;
}

export function MultiChip({ options, values, onToggle, className = '' }: MultiChipProps) {
  return (
    <div className={`chip-row ${className}`}>
      {options.map((o) => (
        <span
          key={o.id}
          className={`chip ${values.includes(o.id) ? 'selected' : ''}`}
          onClick={() => onToggle(o.id)}
        >
          {o.label}
        </span>
      ))}
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  suffix?: string;
  onChange: (v: number) => void;
}

export function Slider({ label, value, min = 0, max = 10, suffix = '', onChange }: SliderProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="row">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{label}</span>
        <span className="slider-value">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
