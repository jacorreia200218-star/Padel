import React from 'react';
import { useStore, dateKey } from '../store/useStore';
import type { Log } from '../engine/planner';

export function StatsTab() {
  const { data } = useStore();
  const logs = Object.values(data.logs).sort((a, b) => a.date.localeCompare(b.date));
  const last30 = logs.slice(-30);
  
  const totalHours = last30.reduce((s, l) => s + l.padelHours, 0);
  const trainDays = last30.filter(l => l.didTrain).length;
  const restDays = last30.filter(l => !l.didTrain && !l.didPlayPadel).length;
  const streak = computeStreak(logs);

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 mb-[18px]">
        <div className="bg-[#173840] rounded-[12px] p-3.5 border border-white/5">
          <div className="font-display text-[1.4rem] font-bold">{totalHours.toFixed(1)}h</div>
          <div className="text-[0.72rem] text-[#9CB8B4] mt-0.5">Horas de padel (30d)</div>
        </div>
        <div className="bg-[#173840] rounded-[12px] p-3.5 border border-white/5">
          <div className="font-display text-[1.4rem] font-bold">{trainDays}</div>
          <div className="text-[0.72rem] text-[#9CB8B4] mt-0.5">Dias de treino (30d)</div>
        </div>
        <div className="bg-[#173840] rounded-[12px] p-3.5 border border-white/5">
          <div className="font-display text-[1.4rem] font-bold">{restDays}</div>
          <div className="text-[0.72rem] text-[#9CB8B4] mt-0.5">Dias de descanso (30d)</div>
        </div>
        <div className="bg-[#173840] rounded-[12px] p-3.5 border border-white/5">
          <div className="font-display text-[1.4rem] font-bold">{streak}</div>
          <div className="text-[0.72rem] text-[#9CB8B4] mt-0.5">Sequência atual</div>
        </div>
      </div>
      
      <div className="bg-[#173840] border border-white/5 rounded-[18px] p-4 mb-3">
        <div className="text-[0.72rem] uppercase tracking-[0.09em] text-[#6C8985] font-bold mb-2.5 m-0">
          Energia ao longo do tempo
        </div>
        <LineChart values={last30.map(l => l.energy)} min={0} max={10} color="var(--accent)" />
      </div>
      
      <div className="bg-[#173840] border border-white/5 rounded-[18px] p-4 mb-3">
        <div className="text-[0.72rem] uppercase tracking-[0.09em] text-[#6C8985] font-bold mb-2.5 m-0">
          Dor ao longo do tempo
        </div>
        <BarChart values={last30.map(l => l.pain)} min={0} max={7} color="var(--coral)" />
      </div>
      
      <div className="bg-[#173840] border border-white/5 rounded-[18px] p-4 mb-3">
        <div className="text-[0.72rem] uppercase tracking-[0.09em] text-[#6C8985] font-bold mb-2.5 m-0">
          Horas de padel por semana
        </div>
        <BarChart values={weeklyBuckets(last30, 'padelHours')} min={0} max={undefined} color="var(--sky)" />
      </div>
    </>
  );
}

function computeStreak(logs: Log[]) {
  const set = new Set(logs.filter(l => l.didTrain || l.didPlayPadel).map(l => l.date));
  let streak = 0; 
  let cur = new Date(); 
  cur.setHours(0,0,0,0);
  while(set.has(dateKey(cur))) { 
    streak++; 
    cur.setDate(cur.getDate() - 1); 
  }
  return streak;
}

function weeklyBuckets(logs: Log[], field: keyof Log): number[] {
  const buckets: Record<string, number> = {};
  logs.forEach(l => {
    const d = new Date(l.date); 
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    const key = d.getFullYear() + '-W' + week;
    buckets[key] = (buckets[key] || 0) + (l[field] as number || 0);
  });
  return Object.keys(buckets).sort().map(k => buckets[k]);
}

function LineChart({ values, min, max, color }: { values: number[], min?: number, max?: number, color: string }) {
  if (!values.length) {
    return <div className="text-center py-6 text-[#9CB8B4]">Ainda sem dados.</div>;
  }
  const w = 280, h = 110, pad = 6;
  const lo = min ?? Math.min(...values);
  const hi = max ?? Math.max(...values, 1);
  const pts = values.map((v, i) => {
    const x = pad + i * ((w - 2 * pad) / Math.max(1, values.length - 1));
    const y = h - pad - ((v - lo) / ((hi - lo) || 1)) * (h - 2 * pad);
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg className="w-full h-[130px] overflow-visible" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function BarChart({ values, min, max, color }: { values: number[], min?: number, max?: number, color: string }) {
  if (!values.length || values.every(v => !v)) {
    return <div className="text-center py-6 text-[#9CB8B4]">Ainda sem dados.</div>;
  }
  const w = 280, h = 110, pad = 4;
  const hi = max ?? Math.max(...values, 1);
  const bw = (w - 2 * pad) / values.length;
  
  return (
    <svg className="w-full h-[130px] overflow-visible" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {values.map((v, i) => {
        const bh = ((v) / hi) * (h - 2 * pad);
        const x = pad + i * bw + bw * 0.15;
        const y = h - pad - bh;
        return <rect key={i} x={x} y={y} width={bw * 0.7} height={Math.max(bh, 1)} rx="2" fill={color} />;
      })}
    </svg>
  );
}