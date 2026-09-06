import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { Logo } from './Logo';
import { AmbientAudio } from '../library/AmbientAudio';
import { AvatarCustomizer } from '../avatar/AvatarCustomizer';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import {
  LayoutGrid,
  Clock,
  Calendar,
  History,
  Target,
  BarChart3,
  Settings,
  Users,
  Sparkles,
  User,
  ChevronRight
} from 'lucide-react';

export type AppView = 'library' | 'timer' | 'history' | 'calendar' | 'goals' | 'stats' | 'settings';

interface NavbarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onSelectView, onOpenAuth }) => {
  const { user } = useAuth();
  const { mySeat, totalActiveCount } = useLibrary();
  const [isAvatarCustomizerOpen, setIsAvatarCustomizerOpen] = useState<boolean>(false);

  const navItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'library', label: 'Salon', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: 'timer', label: 'Sayaç', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'history', label: 'Geçmiş', icon: <History className="w-3.5 h-3.5" /> },
    { id: 'calendar', label: 'Takvim', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'goals', label: 'Hedefler', icon: <Target className="w-3.5 h-3.5" /> },
    { id: 'stats', label: 'İstatistik', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'settings', label: 'Ayarlar', icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 w-full px-4 lg:px-7 py-2.5 bg-[#0F111A]/85 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between shadow-lg shadow-black/20">
        {/* Left: Brand Identity with New Original Logo */}
        <div
          onClick={() => onSelectView('library')}
          className="cursor-pointer group flex items-center"
        >
          <Logo size={36} />
        </div>

        {/* Center: Segmented Navigation Pills (Desktop & Tablet) */}
        <div className="hidden md:flex items-center p-1 rounded-2xl bg-[#171B26]/80 border border-white/[0.06] shadow-inner">
          {navItems.map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Room Controls & User Status */}
        <div className="flex items-center gap-2.5">
          {/* Active Users Counter Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Users className="w-3 h-3 text-emerald-400" />
            <span className="tabular-nums">{totalActiveCount}</span>
            <span className="hidden sm:inline font-normal text-[11px] text-emerald-400/80">Odaklanıyor</span>
          </div>

          {/* Seated Table indicator */}
          {mySeat && (
            <button
              onClick={() => onSelectView('library')}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/40 border border-blue-500/30 text-[11px] font-bold text-blue-300 hover:bg-blue-900/40 transition shadow-sm"
            >
              <span>Masa {mySeat.tableId}'desiniz</span>
              <ChevronRight className="w-3 h-3 text-blue-400" />
            </button>
          )}

          {/* Ambient Sound Controller */}
          <AmbientAudio />

          {/* Character Studio Trigger */}
          <button
            onClick={() => setIsAvatarCustomizerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 text-xs font-semibold transition shadow-sm group"
            title="Karakterimi Özelleştir"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Karakterim</span>
          </button>

          {/* User Profile Chip */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-slate-900/90 border border-white/[0.08] hover:border-slate-600 transition-all shadow-sm"
          >
            <div className="text-right hidden sm:block pr-1">
              <div className="text-xs font-bold text-white truncate max-w-[100px]">
                {user?.displayName || 'Misafir'}
              </div>
              <div className="text-[9px] text-slate-400">
                {user?.isGuest ? 'Misafir' : 'Giriş Yapıldı'}
              </div>
            </div>

            <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center border border-white/10 shadow-inner">
              {user?.avatar ? (
                <AvatarRenderer config={user.avatar} state="idle" size={26} />
              ) : (
                <User className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </button>
        </div>
      </nav>

      {/* Avatar Studio Modal */}
      <AvatarCustomizer
        isOpen={isAvatarCustomizerOpen}
        onClose={() => setIsAvatarCustomizerOpen(false)}
      />
    </>
  );
};
