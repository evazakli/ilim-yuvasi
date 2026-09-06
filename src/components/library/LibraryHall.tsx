import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { usePomodoro } from '../../context/PomodoroContext';
import { StudyTable } from './StudyTable';
import { TableReactions } from './TableReactions';
import { PomodoroModal } from '../timer/PomodoroModal';
import { SeatIndex } from '../../types/library';
import { Compass, Coffee, LogOut, UserCheck } from 'lucide-react';

export const LibraryHall: React.FC = () => {
  const { tables, mySeat, leaveSeat } = useLibrary();
  const { remainingSeconds, isWorkTime, currentTask } = usePomodoro();
  const [activeModalSeat, setActiveModalSeat] = useState<{ tableId: number; seatIndex: SeatIndex } | null>(null);
  const [tableFilter, setTableFilter] = useState<'all' | '1-4' | '5-8' | 'my'>('all');

  const handleSeatClick = (tableId: number, seatIndex: SeatIndex) => {
    setActiveModalSeat({ tableId, seatIndex });
  };

  // Count empty and taken seats
  const totalSeats = tables.length * 4;
  const occupiedCount = tables.reduce((acc, t) => acc + t.seats.filter(Boolean).length, 0);
  const emptyCount = totalSeats - occupiedCount;

  // Filtered tables for easier navigation on mobile screens
  const displayTables = tables.filter(t => {
    if (tableFilter === '1-4') return t.id <= 4;
    if (tableFilter === '5-8') return t.id > 4;
    if (tableFilter === 'my' && mySeat) return t.id === mySeat.tableId;
    return true;
  });

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col pb-32 md:pb-24 select-none animate-fade-in">
      {/* Inspiring & Airy Room Ambience Banner */}
      <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-4 md:px-8 pt-3 sm:pt-5 pb-2">
        <div className="p-3.5 sm:p-5 rounded-3xl glass-panel border border-white/[0.08] shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 text-center md:text-left w-full md:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Büyük Çalışma Salonu
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  Salon 1
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                {mySeat
                  ? `Masa ${mySeat.tableId}'de odaklanıyorsunuz. Yerinizden kalkmak veya süreyi yönetmek için alttaki paneli kullanabilirsiniz.`
                  : 'Sessiz ve verimli çalışma ortamı — Boş bir sandalyeye dokunarak yerinizi alın.'}
              </p>
            </div>
          </div>

          {/* Quick Room Status Chips */}
          <div className="flex items-center justify-center gap-2 text-xs font-medium w-full md:w-auto">
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-300 flex items-center gap-1.5 text-[11px] sm:text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{emptyCount} Boş Koltuk</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-300 flex items-center gap-1.5 text-[11px] sm:text-xs">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span>8 Masa</span>
            </div>
          </div>
        </div>

        {/* Mobile-Friendly Table Navigation Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setTableFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              tableFilter === 'all'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-white'
            }`}
          >
            Tümü (8 Masa)
          </button>
          <button
            onClick={() => setTableFilter('1-4')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              tableFilter === '1-4'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-white'
            }`}
          >
            Masa 1 - 4
          </button>
          <button
            onClick={() => setTableFilter('5-8')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              tableFilter === '5-8'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-white'
            }`}
          >
            Masa 5 - 8
          </button>
          {mySeat && (
            <button
              onClick={() => setTableFilter('my')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border flex items-center gap-1 ${
                tableFilter === 'my'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>📍 Masam (Masa {mySeat.tableId})</span>
            </button>
          )}
        </div>
      </div>

      {/* 8 Study Tables Responsive Grid */}
      <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-7 justify-items-center">
          {displayTables.map(table => (
            <StudyTable
              key={table.id}
              table={table}
              onSeatClick={handleSeatClick}
              onLeaveClick={leaveSeat}
            />
          ))}
        </div>
      </main>

      {/* Persistent Active Session Bar (Docked on Mobile & Corner on Desktop) */}
      {mySeat && (
        <div className="fixed bottom-14 left-2 right-2 md:bottom-4 md:right-6 md:left-auto md:w-auto z-30 animate-slide-up">
          <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-2xl bg-[#12151F]/95 border border-amber-500/40 shadow-2xl backdrop-blur-xl">
            {/* Left Info: Table, Timer, Task */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-mono font-extrabold text-xs shrink-0">
                M{mySeat.tableId}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">
                    Masa {mySeat.tableId} · Koltuk {mySeat.seatIndex + 1}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    isWorkTime ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  }`}>
                    {isWorkTime ? 'Çalışma' : 'Mola'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-300 font-mono truncate">
                  ⏱️ {formatCountdown(remainingSeconds)} {currentTask ? `• ${currentTask}` : ''}
                </p>
              </div>
            </div>

            {/* Right Quick Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setActiveModalSeat({ tableId: mySeat.tableId, seatIndex: mySeat.seatIndex as SeatIndex })}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 transition border border-white/10"
                title="Süreyi ve masayı yönet"
              >
                Yönet
              </button>
              <button
                onClick={leaveSeat}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-300 hover:text-white bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 transition shadow"
                title="Masadaki yerinizi bırakın ve sayacı sıfırlayın"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Kalk</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Micro-Reactions toolbar when seated */}
      <TableReactions />

      {/* Pomodoro Seat Modal (Opens when clicking any seat) */}
      {activeModalSeat && (
        <PomodoroModal
          tableId={activeModalSeat.tableId}
          seatIndex={activeModalSeat.seatIndex}
          isOpen={Boolean(activeModalSeat)}
          onClose={() => setActiveModalSeat(null)}
        />
      )}
    </div>
  );
};
