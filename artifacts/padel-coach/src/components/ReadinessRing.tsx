import React from 'react';

export function ReadinessRing({ pct }: { pct: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const safePct = Math.max(0, Math.min(1, pct));
  
  return (
    <svg width="84" height="84" viewBox="0 0 84 84" className="shrink-0">
      <circle cx="42" cy="42" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="7" fill="none"/>
      <circle 
        cx="42" cy="42" r={r} 
        stroke="var(--accent)" 
        strokeWidth="7" 
        fill="none"
        strokeDasharray={c} 
        strokeDashoffset={c * (1 - safePct)} 
        strokeLinecap="round"
        transform="rotate(-90 42 42)"
        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
      />
    </svg>
  );
}
