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
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/90 border border-amber-600/40 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 pr-2 border-r border-slate-700">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline">Masa Tepkileri:</span>
      </div>

      <div className="flex items-center gap-1">
        {REACTION_EMOJIS.map(item => (
          <button
            key={item.emoji}
            onClick={() => sendReaction(item.emoji)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg hover:scale-125 active:scale-95 hover:bg-slate-800/80 transition-all duration-150"
            title={item.label}
          >
            {item.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
