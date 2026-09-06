import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { StudyTable } from './StudyTable';
import { TableReactions } from './TableReactions';
import { PomodoroModal } from '../timer/PomodoroModal';
import { SeatIndex } from '../../types/library';
import { Compass, Sparkles, Coffee, ShieldCheck } from 'lucide-react';

export const LibraryHall: React.FC = () => {
  const { tables, mySeat, leaveSeat } = useLibrary();
  const [activeModalSeat, setActiveModalSeat] = useState<{ tableId: number; seatIndex: SeatIndex } | null>(null);

  const handleSeatClick = (tableId: number, seatIndex: SeatIndex) => {
    setActiveModalSeat({ tableId, seatIndex });
  };

  // Count empty and taken seats
  const totalSeats = tables.length * 4;
  const occupiedCount = tables.reduce((acc, t) => acc + t.seats.filter(Boolean).length, 0);
  const emptyCount = totalSeats - occupiedCount;

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col pb-24 select-none animate-fade-in">
      {/* Inspiring & Airy Room Ambience Banner */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-5 pb-2">
        <div className="p-4 md:p-5 rounded-3xl glass-panel border border-white/[0.08] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Büyük Çalışma Salonu
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  Salon 1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {mySeat
                  ? `Şu an Masa ${mySeat.tableId}'de odaklanıyorsunuz. Koltuğunuza tıklayarak süreyi yönetebilirsiniz.`
                  : 'Sessiz ve verimli çalışma ortamı — Boş bir sandalyeye tıklayarak yerinizi alın.'}
              </p>
            </div>
          </div>

          {/* Quick Room Status Chips */}
          <div className="flex items-center gap-2 text-xs font-medium">
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{emptyCount} Boş Sandalye</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-300 flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span>8 Masa</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Study Tables Responsive Grid */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7 justify-items-center">
          {tables.map(table => (
            <StudyTable
              key={table.id}
              table={table}
              onSeatClick={handleSeatClick}
              onLeaveClick={leaveSeat}
            />
          ))}
        </div>
      </main>

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
