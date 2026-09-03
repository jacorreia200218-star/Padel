import { useState, type ComponentType } from 'react';

import { Toast } from './components/Toast';
import {
  IconHistory,
  IconLibrary,
  IconSettings,
  IconStats,
  IconToday,
} from './components/icons';
import { HistoryTab } from './tabs/HistoryTab';
import { LibraryTab } from './tabs/LibraryTab';
import { SettingsTab } from './tabs/SettingsTab';
import { StatsTab } from './tabs/StatsTab';
import { TodayTab } from './tabs/TodayTab';

interface Tab {
  id: string;
  label: string;
  Icon: ComponentType;
  View: ComponentType;
}

const TABS: Tab[] = [
  { id: 'today', label: 'Hoje', Icon: IconToday, View: TodayTab },
  { id: 'library', label: 'Biblioteca', Icon: IconLibrary, View: LibraryTab },
  { id: 'history', label: 'Histórico', Icon: IconHistory, View: HistoryTab },
  { id: 'stats', label: 'Estatísticas', Icon: IconStats, View: StatsTab },
  { id: 'settings', label: 'Definições', Icon: IconSettings, View: SettingsTab },
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
