import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Sparkles, MessageCircle } from 'lucide-react';

const REACTION_EMOJIS = [
  { emoji: '👋', label: 'Selam Ver' },
  { emoji: '☕', label: 'Kahve Ismarla' },
  { emoji: '🔥', label: 'Ateşli Odak' },
  { emoji: '👏', label: 'Alkışla' },
  { emoji: '📖', label: 'İyi Çalışmalar' },
  { emoji: '✨', label: 'Motive Et' },
];

export const TableReactions: React.FC = () => {
  const { mySeat, sendReaction } = useLibrary();

  if (!mySeat) return null;

  return (
    <div className="fixed bottom-28 md:bottom-6 left-1/2 -translate-x-1/2 z-30 animate-fade-in flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-900/95 border border-amber-600/40 shadow-2xl backdrop-blur-md max-w-[95vw] overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-amber-300 pr-1.5 sm:pr-2 border-r border-slate-700 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="hidden sm:inline">Masa Tepkileri:</span>
      </div>

      <div className="flex items-center gap-1">
        {REACTION_EMOJIS.map(item => (
          <button
            key={item.emoji}
            onClick={() => sendReaction(item.emoji)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-base sm:text-lg hover:scale-125 active:scale-95 hover:bg-slate-800/80 transition-all duration-150"
            title={item.label}
          >
            {item.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
