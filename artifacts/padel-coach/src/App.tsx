import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, BookOpen, Calendar, BarChart2, Settings } from 'lucide-react';

import { TodayTab } from './tabs/TodayTab';
import { LibraryTab } from './tabs/LibraryTab';
import { HistoryTab } from './tabs/HistoryTab';
import { StatsTab } from './tabs/StatsTab';
import { SettingsTab } from './tabs/SettingsTab';

const queryClient = new QueryClient();

const TABS = [
  { id: "today", label: "Hoje", icon: Clock },
  { id: "library", label: "Biblioteca", icon: BookOpen },
  { id: "history", label: "Histórico", icon: Calendar },
  { id: "stats", label: "Estatísticas", icon: BarChart2 },
  { id: "settings", label: "Definições", icon: Settings },
] as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]["id"]>("today");

  const currentTabLabel = TABS.find(t => t.id === activeTab)?.label;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="app-container">
          <header className="sticky top-0 z-10 flex items-baseline justify-between bg-[#0F2027]/90 backdrop-blur-[14px] border-b border-[rgba(216,255,62,0.14)] pt-[calc(env(safe-area-inset-top,0px)+18px)] px-5 pb-3.5">
            <div className="text-[1.05rem] font-bold">
              <span className="text-[#D8FF3E]">●</span> Padel Coach AI
            </div>
            <div className="text-[0.78rem] text-[#6C8985] uppercase tracking-[0.08em]">
              {currentTabLabel}
            </div>
          </header>

          <main className="flex-1 p-[18px_16px_calc(96px+env(safe-area-inset-bottom,0px))] overflow-x-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="w-full"
              >
                {activeTab === "today" && <TodayTab />}
                {activeTab === "library" && <LibraryTab />}
                {activeTab === "history" && <HistoryTab />}
                {activeTab === "stats" && <StatsTab />}
                {activeTab === "settings" && <SettingsTab />}
              </motion.div>
            </AnimatePresence>
          </main>

          <nav className="fixed bottom-0 left-0 right-0 max-w-[520px] mx-auto flex bg-[#132C34]/95 backdrop-blur-[16px] border-t border-[rgba(216,255,62,0.14)] pt-2 px-1.5 pb-[calc(10px+env(safe-area-inset-bottom,0px))] z-10">
            {TABS.map(t => {
              const isActive = activeTab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 bg-transparent border-none flex flex-col items-center gap-1 py-2 px-0.5 text-[0.66rem] font-semibold tracking-[0.02em] transition-colors ${isActive ? 'text-[#D8FF3E]' : 'text-[#6C8985]'}`}
                >
                  <Icon className="w-[22px] h-[22px]" strokeWidth={1.8} />
                  <div className="flex flex-col items-center">
                    <span className={`w-1.5 h-1.5 rounded-full mb-[1px] ${isActive ? 'bg-[#D8FF3E]' : 'bg-transparent'}`} />
                    {t.label}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}