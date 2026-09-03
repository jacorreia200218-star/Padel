/** Ícones da barra inferior. SVG inline, sem dependências. */

type IconProps = { className?: string };

function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      {children}
    </svg>
  );
}

export function IconToday(_: IconProps) {
  return (
    <Svg>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </Svg>
  );
}

export function IconLibrary(_: IconProps) {
  return (
    <Svg>
      <path d="M4 5h6v14H4zM14 5h6v14h-6z" />
    </Svg>
  );
}

export function IconHistory(_: IconProps) {
  return (
    <Svg>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </Svg>
  );
}

/** Penso rápido, para a área de dores e prevenção. */
export function IconPain(_: IconProps) {
  return (
    <Svg>
      <rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)" />
      <path d="M10 10l4 4M14 10l-4 4" />
    </Svg>
  );
}

export function IconStats(_: IconProps) {
  return (
    <Svg>
      <path d="M5 19V10M12 19V5M19 19v-7" />
    </Svg>
  );
}

export function IconProfile(_: IconProps) {
  return (
    <Svg>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6" />
    </Svg>
  );
}

export function IconSettings(_: IconProps) {
  return (
    <Svg>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </Svg>
  );
}
