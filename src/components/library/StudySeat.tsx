import React from 'react';
import { SeatOccupant, SeatIndex } from '../../types/library';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Plus, Sparkles } from 'lucide-react';

interface StudySeatProps {
  tableId: number;
  seatIndex: SeatIndex;
  occupant: SeatOccupant | null;
  onSeatClick: (tableId: number, seatIndex: SeatIndex) => void;
  onLeaveClick?: () => void;
}

export const StudySeat: React.FC<StudySeatProps> = ({
  tableId,
  seatIndex,
  occupant,
  onSeatClick,
  onLeaveClick,
}) => {
  const { user } = useAuth();
  const isMySeat = Boolean(occupant && user && occupant.uid === user.uid);

  if (!occupant) {
    // Modern, clean, inviting empty chair pod
    return (
      <div className="relative group flex flex-col items-center">
        <button
          onClick={() => onSeatClick(tableId, seatIndex)}
          className="relative w-20 h-24 rounded-2xl bg-white/[0.03] hover:bg-amber-500/[0.08] border border-white/[0.08] hover:border-amber-400/50 flex flex-col items-center justify-center p-2.5 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-amber-500/10 group-hover:-translate-y-0.5"
        >
          {/* Minimalist Stylized Chair Icon */}
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] group-hover:border-amber-400/40 group-hover:bg-amber-500/15 flex items-center justify-center text-slate-400 group-hover:text-amber-300 transition-all duration-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
              <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0z" />
              <path d="M5 18v3" />
              <path d="M19 18v3" />
            </svg>
          </div>

          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-amber-200 transition-colors">
            <Plus className="w-3 h-3 text-slate-500 group-hover:text-amber-300" />
            <span>Otur</span>
          </div>
        </button>

        {/* Hover Hint */}
        <div className="absolute -bottom-7 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-30 whitespace-nowrap px-2 py-0.5 rounded-lg bg-[#0F111A]/95 text-[10px] font-medium text-amber-200 shadow-xl border border-white/10 backdrop-blur-md">
          Sandalyeye Otur
        </div>
      </div>
    );
  }

  // Occupied Seat
  const isWorking = occupant.characterState === 'working';
  const isBreak = occupant.characterState === 'break';

  // Circular timer calculation
  const totalSec = occupant.durationSeconds || 1500;
  const remSec = occupant.remainingSeconds || 0;
  const progressPercent = Math.min(100, Math.max(0, ((totalSec - remSec) / totalSec) * 100));
  const strokeDashoffset = 100 - progressPercent;

  return (
    <div className="relative group flex flex-col items-center">
      {/* Floating Emoji Reaction Bubble */}
      {occupant.activeReaction && (
        <div className="absolute -top-11 z-40 animate-float-up pointer-events-none">
          <div className="px-3 py-1 rounded-full bg-slate-900/95 border border-amber-400/60 shadow-2xl flex items-center gap-1.5 backdrop-blur-md">
            <span className="text-xl">{occupant.activeReaction.emoji}</span>
          </div>
        </div>
      )}

      {/* Seated Avatar Pod (Clickable to manage timer) */}
      <button
        onClick={() => onSeatClick(tableId, seatIndex)}
        className={`relative rounded-2xl p-1.5 transition-all duration-300 cursor-pointer text-left ${
          isMySeat
            ? 'ring-2 ring-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20 hover:ring-blue-400'
            : 'bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08]'
        }`}
        title={isMySeat ? 'Masayı ve sayacı yönetmek için tıkla' : `${occupant.displayName} - Süreyi görmek için tıkla`}
      >
        {/* Status Pill Badge */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center shadow-lg">
          {isWorking && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-500/40 px-2 py-0.5 rounded-full tracking-wider uppercase backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Çalışıyor
            </span>
          )}
          {isBreak && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-amber-300 bg-amber-950/90 border border-amber-500/40 px-2 py-0.5 rounded-full tracking-wider uppercase backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Mola
            </span>
          )}
          {!isWorking && !isBreak && (
            <span className="text-[9px] font-semibold text-slate-300 bg-slate-900/90 border border-white/10 px-2 py-0.5 rounded-full">
              Boşta
            </span>
          )}
        </div>

        {/* Animated Avatar */}
        <AvatarRenderer
          config={occupant.avatar}
          state={occupant.characterState}
          size={78}
        />

        {/* Circular Progress Ring Overlay on Seat */}
        {occupant.durationSeconds > 0 && (
          <div className="absolute bottom-1 right-1 flex items-center justify-center w-7 h-7 rounded-full bg-[#0F111A]/90 border border-white/15 shadow-md">
            <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={isWorking ? 'text-emerald-400' : 'text-amber-400'}
                strokeDasharray={`${progressPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[9px] font-mono font-bold text-white">
              {Math.ceil(occupant.remainingSeconds / 60)}'
            </span>
          </div>
        )}
      </button>

      {/* Name and Task Label */}
      <div className="mt-1.5 flex flex-col items-center max-w-[95px] text-center">
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-100 truncate w-full justify-center">
          <span className="truncate">{occupant.displayName}</span>
          {isMySeat && (
            <span className="text-[8px] bg-blue-600 text-white font-bold px-1 py-0.2 rounded-full">Sen</span>
          )}
        </div>
        <p className="text-[10px] text-slate-400 truncate w-full" title={occupant.currentTask}>
          {occupant.currentTask || 'Odaklanıyor'}
        </p>
      </div>

      {/* Quick Leave Button for Current User */}
      {isMySeat && onLeaveClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLeaveClick();
          }}
          className="mt-1.5 flex items-center justify-center gap-1 min-h-[34px] px-3 py-1 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 hover:text-white font-bold text-xs shadow-md active:scale-95 transition-all touch-manipulation z-20 cursor-pointer"
          title="Masadan Kalk"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>Masadan Kalk</span>
        </button>
      )}
    </div>
  );
};
