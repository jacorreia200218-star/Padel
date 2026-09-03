import { useState, type ComponentType } from 'react';

import { Toast } from './components/Toast';
import {
  IconHistory,
  IconLibrary,
  IconPain,
  IconProfile,
  IconToday,
} from './components/icons';
import { HistoryTab } from './tabs/HistoryTab';
import { LibraryTab } from './tabs/LibraryTab';
import { PainTab } from './tabs/PainTab';
import { ProfileTab } from './tabs/ProfileTab';
import { TodayTab } from './tabs/TodayTab';

interface Tab {
  id: string;
  label: string;
  Icon: ComponentType;
  View: ComponentType;
}

// Cinco é o máximo que cabe na barra sem os rótulos ficarem ilegíveis num
// telemóvel. As estatísticas passaram para dentro do Histórico — são as duas
// sobre o que já aconteceu — para abrir lugar à página de dores.
const TABS: Tab[] = [
  { id: 'today', label: 'Hoje', Icon: IconToday, View: TodayTab },
  { id: 'library', label: 'Exercícios', Icon: IconLibrary, View: LibraryTab },
  { id: 'pain', label: 'Dores', Icon: IconPain, View: PainTab },
  { id: 'history', label: 'Histórico', Icon: IconHistory, View: HistoryTab },
  { id: 'profile', label: 'Perfil', Icon: IconProfile, View: ProfileTab },
];

export default function App() {
  const [activeId, setActiveId] = useState('today');
  const active = TABS.find((t) => t.id === activeId) ?? TABS[0];
  const View = active.View;

  return (
    <div className="app-container">
      <div className="topbar">
        <div className="brand">
          <span className="ball">●</span> Padel Coach AI
        </div>
        <div className="tabname">{active.label}</div>
      </div>

      <main>
        <View />
      </main>

      <nav className="tabbar">
        {TABS.map((t) => {
          const Icon = t.Icon;
          return (
            <button
              key={t.id}
              className={`tab-btn ${activeId === t.id ? 'active' : ''}`}
              onClick={() => setActiveId(t.id)}
            >
              <Icon />
              <span className="dot" />
              {t.label}
            </button>
          );
        })}
      </nav>

      <Toast />
    </div>
  );
}
