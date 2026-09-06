import React, { useState } from 'react';
import { Navbar, AppView } from './components/common/Navbar';
import { LibraryHall } from './components/library/LibraryHall';
import { TimerStandaloneView } from './components/timer/TimerStandaloneView';
import { HistoryView } from './components/history/HistoryView';
import { CalendarView } from './components/calendar/CalendarView';
import { GoalsView } from './components/goals/GoalsView';
import { StatsView } from './components/stats/StatsView';
import { SettingsView } from './components/settings/SettingsView';
import { FloatingBubbles } from './components/timer/FloatingBubbles';
import { AuthModal } from './components/auth/AuthModal';
import { LayoutGrid, Clock, History, Calendar, Target, BarChart3, Settings } from 'lucide-react';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('library');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  const renderView = () => {
    switch (currentView) {
      case 'library':
        return <LibraryHall />;
      case 'timer':
        return <TimerStandaloneView onNavigate={(v) => setCurrentView(v)} />;
      case 'history':
        return <HistoryView onBack={() => setCurrentView('library')} />;
      case 'calendar':
        return <CalendarView onBack={() => setCurrentView('library')} />;
      case 'goals':
        return <GoalsView onBack={() => setCurrentView('library')} />;
      case 'stats':
        return <StatsView onBack={() => setCurrentView('library')} />;
      case 'settings':
        return <SettingsView onBack={() => setCurrentView('library')} />;
      default:
        return <LibraryHall />;
    }
  };

  const navTabs: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'library', label: 'Salon', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'timer', label: 'Sayaç', icon: <Clock className="w-4 h-4" /> },
    { id: 'history', label: 'Geçmiş', icon: <History className="w-4 h-4" /> },
    { id: 'calendar', label: 'Takvim', icon: <Calendar className="w-4 h-4" /> },
    { id: 'goals', label: 'Hedefler', icon: <Target className="w-4 h-4" /> },
    { id: 'stats', label: 'İstatistik', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Ayarlar', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-between text-slate-100 overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Floating Subtle Ambient Particles Background */}
      <FloatingBubbles />

      {/* Main Single Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Active Screen Content */}
      <div className="relative z-10 flex-1 w-full pb-20 md:pb-8">
        {renderView()}
      </div>

      {/* Mobile Bottom Navigation Bar (Synchronized for md breakpoint) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E1017]/95 border-t border-white/[0.08] backdrop-blur-xl px-2 py-2 flex items-center justify-around shadow-2xl">
        {navTabs.map(tab => {
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all ${
                isActive
                  ? 'text-blue-400 font-bold bg-blue-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span className="mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sleek Minimalist Footer */}
      <footer className="relative z-10 py-3 text-center text-[11px] text-slate-500/80 select-none hidden md:block border-t border-white/[0.04]">
        Developed by EVA | All rights reserved © 2025
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};
